<?php
require_once 'config.php';
$conn = getConnection();

$dept    = isset($_GET['dept']) ? mysqli_real_escape_string($conn, trim($_GET['dept'])) : '';
$admin   = isAdmin($dept);


$bWhere  = $admin ? "WHERE 1=1"           : "WHERE b.department='$dept'";
$bAnd    = $admin ? ""                    : "AND b.department='$dept'";


$mWhere  = $admin ? "WHERE 1=1"           : "WHERE department='$dept'";


$iWhere  = $admin ? "WHERE 1=1"           : "WHERE b.department='$dept'";
$iAnd    = $admin ? "WHERE ib.status='issued'" : "WHERE ib.status='issued' AND b.department='$dept'";
$iToday  = $admin ? "WHERE ib.issue_date=CURDATE()" : "WHERE ib.issue_date=CURDATE() AND b.department='$dept'";
$iOver   = $admin ? "WHERE ib.status='issued' AND ib.due_date < CURDATE()"
                  : "WHERE ib.status='issued' AND ib.due_date < CURDATE() AND b.department='$dept'";


$total_copies = mysqli_fetch_assoc(mysqli_query($conn,
    "SELECT COUNT(bc.id) AS c FROM book_copies bc JOIN books b ON bc.book_id=b.id $bWhere"))['c'];

$available_copies = mysqli_fetch_assoc(mysqli_query($conn,
    "SELECT COUNT(bc.id) AS c FROM book_copies bc JOIN books b ON bc.book_id=b.id $bWhere AND bc.status='available'"))['c'];

$total_titles = mysqli_fetch_assoc(mysqli_query($conn,
    "SELECT COUNT(*) AS c FROM books b $bWhere"))['c'];


$total_members = mysqli_fetch_assoc(mysqli_query($conn,
    "SELECT COUNT(*) AS c FROM members $mWhere"))['c'];

$total_issued = mysqli_fetch_assoc(mysqli_query($conn,
    "SELECT COUNT(ib.id) AS c FROM issued_books ib
     JOIN book_copies bc ON ib.copy_id=bc.id
     JOIN books b ON bc.book_id=b.id $iAnd"))['c'];

$issued_today = mysqli_fetch_assoc(mysqli_query($conn,
    "SELECT COUNT(ib.id) AS c FROM issued_books ib
     JOIN book_copies bc ON ib.copy_id=bc.id
     JOIN books b ON bc.book_id=b.id $iToday"))['c'];

$overdue = mysqli_fetch_assoc(mysqli_query($conn,
    "SELECT COUNT(ib.id) AS c FROM issued_books ib
     JOIN book_copies bc ON ib.copy_id=bc.id
     JOIN books b ON bc.book_id=b.id $iOver"))['c'];


$recent = [];
$rr = mysqli_query($conn,
    "SELECT ib.issue_date, ib.due_date,
            m.name AS member_name, m.roll_no,
            b.title AS book_title, bc.copy_code
     FROM issued_books ib
     JOIN members m      ON ib.member_id=m.id
     JOIN book_copies bc ON ib.copy_id=bc.id
     JOIN books b        ON bc.book_id=b.id
     " . ($admin ? "WHERE 1=1" : "WHERE b.department='$dept'") . "
     ORDER BY ib.id DESC LIMIT 5");
while ($row = mysqli_fetch_assoc($rr)) $recent[] = $row;

echo json_encode([
    "status" => "success",
    "stats"  => [
        "total_copies"     => (int)$total_copies,
        "available_copies" => (int)$available_copies,
        "total_titles"     => (int)$total_titles,
        "total_members"    => (int)$total_members,
        "issued_today"     => (int)$issued_today,
        "overdue"          => (int)$overdue,
        "total_issued"     => (int)$total_issued
    ],
    "recent_issues" => $recent
]);
mysqli_close($conn);
?>