<?php
require_once 'config.php';
$conn = getConnection();

$data       = json_decode(file_get_contents("php://input"), true);
$year       = mysqli_real_escape_string($conn, trim($data['year']       ?? ''));
$dept       = mysqli_real_escape_string($conn, trim($data['department'] ?? ''));
$admin_dept = mysqli_real_escape_string($conn, trim($data['admin_dept'] ?? ''));

if (!$year || !$dept) {
    echo json_encode(["status"=>"error","message"=>"Year and Department are required."]); exit();
}

if (!isAdmin($admin_dept) && $dept !== $admin_dept) {
    echo json_encode(["status"=>"error","message"=>"Access denied."]); exit();
}

$total = (int)mysqli_fetch_assoc(mysqli_query($conn,
    "SELECT COUNT(*) AS c FROM members
     WHERE year='$year' AND department='$dept' AND member_type='student'"))['c'];

if ($total === 0) {
    echo json_encode(["status"=>"error","message"=>"No students found in $year $dept."]); exit();
}

$withHistory = mysqli_query($conn,
    "SELECT DISTINCT m.id FROM members m
     JOIN issued_books ib ON m.id = ib.member_id
     WHERE m.year='$year' AND m.department='$dept' AND m.member_type='student'");

$historyIds = [];
while ($row = mysqli_fetch_assoc($withHistory)) $historyIds[] = $row['id'];

if (!empty($historyIds)) {
    $ids_str    = implode(',', $historyIds);
    $stillOut   = (int)mysqli_fetch_assoc(mysqli_query($conn,
        "SELECT COUNT(*) AS c FROM issued_books
         WHERE member_id IN ($ids_str) AND status='issued'"))['c'];

    if ($stillOut > 0) {
        echo json_encode([
            "status"  => "error",
            "message" => "Cannot delete: $stillOut student(s) still have books currently issued. Collect all books first."
        ]); exit();
    }
}

$softDeleted = 0;
$hardDeleted = 0;

if (!empty($historyIds)) {
    $ids_str = implode(',', $historyIds);
    mysqli_query($conn, "UPDATE members SET year='Archived', member_type='alumni' WHERE id IN ($ids_str)");
    $softDeleted = (int)mysqli_affected_rows($conn);
}

$noHistory = mysqli_query($conn,
    "SELECT m.id FROM members m
     LEFT JOIN issued_books ib ON m.id = ib.member_id
     WHERE m.year='$year' AND m.department='$dept'
       AND m.member_type='student' AND ib.id IS NULL");

$noHistIds = [];
while ($row = mysqli_fetch_assoc($noHistory)) $noHistIds[] = $row['id'];

if (!empty($noHistIds)) {
    $ids_str = implode(',', $noHistIds);
    mysqli_query($conn, "DELETE FROM members WHERE id IN ($ids_str)");
    $hardDeleted = (int)mysqli_affected_rows($conn);
}

$total_removed = $softDeleted + $hardDeleted;

echo json_encode([
    "status"      => "success",
    "message"     => "$total_removed student(s) from $year $dept removed from active list. History preserved for $softDeleted student(s).",
    "removed"     => $total_removed,
    "soft_deleted"=> $softDeleted,
    "hard_deleted"=> $hardDeleted
]);

mysqli_close($conn);
?>