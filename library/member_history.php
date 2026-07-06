<?php
require_once 'config.php';
$conn = getConnection();

$member_id = isset($_GET['member_id']) ? intval($_GET['member_id']) : 0;
$dept      = isset($_GET['dept'])      ? mysqli_real_escape_string($conn, trim($_GET['dept'])) : '';

if ($member_id === 0) {
    echo json_encode(["status"=>"error","message"=>"Member ID required."]); exit();
}

if (!isAdmin($dept)) {
    $chk = mysqli_query($conn,
        "SELECT id FROM members WHERE id=$member_id AND department='$dept'");
    if (mysqli_num_rows($chk) === 0) {
        echo json_encode(["status"=>"error","message"=>"Access denied."]); exit();
    }
}

// Member current profile
$mRes   = mysqli_query($conn, "SELECT * FROM members WHERE id=$member_id");
$member = mysqli_fetch_assoc($mRes);

// Full history — use year_at_issue snapshot, never the current year
$histRes = mysqli_query($conn,
    "SELECT
         ib.id, ib.issue_date, ib.due_date, ib.return_date,
         ib.status, ib.fine,
         COALESCE(ib.year_at_issue, m.year) AS year_at_issue,
         b.title AS book_title, b.author, b.department AS book_dept,
         bc.copy_code
     FROM issued_books ib
     JOIN book_copies bc ON ib.copy_id  = bc.id
     JOIN books b        ON bc.book_id  = b.id
     JOIN members m      ON ib.member_id = m.id
     WHERE ib.member_id = $member_id
     ORDER BY ib.id DESC");

$history  = [];
$current  = [];
$returned = [];

while ($row = mysqli_fetch_assoc($histRes)) {
    $history[] = $row;
    if ($row['status'] === 'issued')   $current[]  = $row;
    if ($row['status'] === 'returned') $returned[] = $row;
}

// Year-wise summary — group by snapshot year
$byYear = [];
foreach ($history as $h) {
    $yr = $h['year_at_issue'] ?: 'Unknown';
    if (!isset($byYear[$yr])) $byYear[$yr] = ['year'=>$yr,'total'=>0,'returned'=>0,'issued'=>0];
    $byYear[$yr]['total']++;
    if ($h['status']==='returned') $byYear[$yr]['returned']++;
    if ($h['status']==='issued')   $byYear[$yr]['issued']++;
}

echo json_encode([
    "status"    => "success",
    "member"    => $member,
    "history"   => $history,
    "current"   => $current,
    "returned"  => $returned,
    "year_summary" => array_values($byYear),
    "stats"     => [
        "total_borrowed"    => count($history),
        "currently_holding" => count($current),
        "total_returned"    => count($returned),
        "total_fine"        => array_sum(array_column($history, 'fine'))
    ]
]);
mysqli_close($conn);
?>