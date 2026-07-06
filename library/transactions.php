<?php
require_once 'config.php';
$conn = getConnection();

$dept      = isset($_GET['dept'])      ? mysqli_real_escape_string($conn, trim($_GET['dept'])) : '';
$from_date = isset($_GET['from_date']) ? mysqli_real_escape_string($conn, $_GET['from_date']) : '';
$to_date   = isset($_GET['to_date'])   ? mysqli_real_escape_string($conn, $_GET['to_date'])   : '';
$status    = isset($_GET['status'])    ? mysqli_real_escape_string($conn, $_GET['status'])    : '';

$isAdmin = isAdmin($dept);
$where   = ["1=1"];

if (!$isAdmin)         $where[] = "b.department='$dept'";
if ($from_date !== '') $where[] = "ib.issue_date >= '$from_date'";
if ($to_date   !== '') $where[] = "ib.issue_date <= '$to_date'";
if ($status    !== '') $where[] = "ib.status='$status'";

$sql = "SELECT
            ib.id, ib.issue_date, ib.due_date, ib.return_date,
            ib.status, ib.fine,
            COALESCE(ib.year_at_issue, m.year) AS year_at_issue,
            m.name AS member_name, m.roll_no,
            m.department AS member_dept,
            b.title AS book_title, b.author,
            b.department AS book_dept,
            bc.copy_code
        FROM issued_books ib
        JOIN members m      ON ib.member_id = m.id
        JOIN book_copies bc ON ib.copy_id   = bc.id
        JOIN books b        ON bc.book_id   = b.id
        WHERE " . implode(" AND ", $where) . "
        ORDER BY ib.issue_date DESC";

$result = mysqli_query($conn, $sql);
if (!$result) {
    echo json_encode(["status"=>"error","message"=>mysqli_error($conn)]); exit();
}

$rows = [];
while ($row = mysqli_fetch_assoc($result)) $rows[] = $row;

echo json_encode(["status"=>"success","data"=>$rows,"count"=>count($rows)]);
mysqli_close($conn);
?>