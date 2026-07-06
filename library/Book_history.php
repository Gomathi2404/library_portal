<?php
require_once 'config.php';
$conn = getConnection();

$book_id = isset($_GET['book_id']) ? intval($_GET['book_id']) : 0;
$dept    = isset($_GET['dept'])    ? mysqli_real_escape_string($conn, trim($_GET['dept'])) : '';

if ($book_id === 0) {
    echo json_encode(["status"=>"error","message"=>"Book ID required"]); exit();
}

// Validate dept access
if (!isAdmin($dept)) {
    $chk = mysqli_query($conn, "SELECT id FROM books WHERE id=$book_id AND department='$dept'");
    if (mysqli_num_rows($chk) === 0) {
        echo json_encode(["status"=>"error","message"=>"Access denied."]); exit();
    }
}

// Book details + copy count
$bRes = mysqli_query($conn,
    "SELECT b.*,
            COUNT(CASE WHEN bc.status != 'deleted' THEN bc.id END) AS total_copies,
            SUM(CASE WHEN bc.status='available' THEN 1 ELSE 0 END) AS available_copies,
            SUM(CASE WHEN bc.status='issued'    THEN 1 ELSE 0 END) AS issued_copies
     FROM books b
     LEFT JOIN book_copies bc ON b.id=bc.book_id
     WHERE b.id=$book_id
     GROUP BY b.id");
$book = mysqli_fetch_assoc($bRes);

// All copies with their current status
$copiesRes = mysqli_query($conn,
    "SELECT bc.copy_code, bc.status,
            m.name AS current_holder, m.roll_no AS holder_roll,
            ib.issue_date, ib.due_date
     FROM book_copies bc
     LEFT JOIN issued_books ib ON bc.id=ib.copy_id AND ib.status='issued'
     LEFT JOIN members m ON ib.member_id=m.id
     WHERE bc.book_id=$book_id
     ORDER BY bc.copy_code");
$copies = [];
while ($row = mysqli_fetch_assoc($copiesRes)) $copies[] = $row;

// Full borrow history
$histRes = mysqli_query($conn,
    "SELECT ib.id, ib.issue_date, ib.due_date, ib.return_date, ib.status, ib.fine,
            m.name AS member_name, m.roll_no, m.department AS member_dept,
            bc.copy_code
     FROM issued_books ib
     JOIN members m      ON ib.member_id=m.id
     JOIN book_copies bc ON ib.copy_id=bc.id
     WHERE bc.book_id=$book_id
     ORDER BY ib.id DESC");
$history = [];
while ($row = mysqli_fetch_assoc($histRes)) $history[] = $row;

// Stats
$total_borrows   = count($history);
$current_holders = array_filter($history, fn($h) => $h['status'] === 'issued');
$past_borrows    = array_filter($history, fn($h) => $h['status'] === 'returned');

echo json_encode([
    "status"  => "success",
    "book"    => $book,
    "copies"  => $copies,
    "history" => $history,
    "stats"   => [
        "total_borrows"    => $total_borrows,
        "current_holders"  => count($current_holders),
        "past_borrows"     => count($past_borrows)
    ]
]);
mysqli_close($conn);
?>