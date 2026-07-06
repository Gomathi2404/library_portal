<?php
require_once 'config.php';
$conn = getConnection();

$dept    = isset($_GET['dept']) ? mysqli_real_escape_string($conn, trim($_GET['dept'])) : '';
$isAdmin = isAdmin($dept);

// Check table exists
$tableCheck = mysqli_query($conn, "SHOW TABLES LIKE 'promotion_log'");
if (mysqli_num_rows($tableCheck) === 0) {
    echo json_encode(["status"=>"success","data"=>[]]);
    exit();
}

$where = $isAdmin ? "1=1" : "(department='$dept' OR department='All Departments (Cron)')";

$result = mysqli_query($conn,
    "SELECT * FROM promotion_log WHERE $where ORDER BY promoted_at DESC LIMIT 20");

$rows = [];
while ($row = mysqli_fetch_assoc($result)) $rows[] = $row;

echo json_encode(["status"=>"success","data"=>$rows]);
mysqli_close($conn);
?>