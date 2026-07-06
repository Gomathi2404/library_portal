<?php
require_once 'config.php';
$conn = getConnection();

$dept   = isset($_GET['dept'])   ? mysqli_real_escape_string($conn, trim($_GET['dept'])) : '';
$search = isset($_GET['search']) ? mysqli_real_escape_string($conn, $_GET['search'])     : '';
$isAdm  = isAdmin($dept);

$where = ["1=1"];
$where[] = "bc.status != 'deleted'";
if (!$isAdm)      $where[] = "b.department = '$dept'";
if ($search !== '') $where[] = "(b.title LIKE '%$search%' OR b.author LIKE '%$search%' OR bc.copy_code LIKE '%$search%' OR b.publisher LIKE '%$search%')";

$sql = "SELECT
            bc.id          AS copy_id,
            bc.copy_code,
            bc.status      AS copy_status,
            b.id           AS book_id,
            b.title,
            b.author,
            b.publisher,
            b.edition,
            b.department,
            -- Current holder if issued
            m.name         AS holder_name,
            m.roll_no      AS holder_roll,
            ib.issue_date,
            ib.due_date
        FROM book_copies bc
        JOIN books b ON bc.book_id = b.id
        LEFT JOIN issued_books ib ON bc.id = ib.copy_id AND ib.status = 'issued'
        LEFT JOIN members m       ON ib.member_id = m.id
        WHERE " . implode(" AND ", $where) . "
        ORDER BY bc.copy_code";

$result = mysqli_query($conn, $sql);
if (!$result) { echo json_encode(["status"=>"error","message"=>mysqli_error($conn)]); exit(); }

$rows = [];
while ($row = mysqli_fetch_assoc($result)) $rows[] = $row;

echo json_encode(["status"=>"success","data"=>$rows,"count"=>count($rows)]);
mysqli_close($conn);
?>