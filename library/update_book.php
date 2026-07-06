<?php
require_once 'config.php';
$conn = getConnection();

$data      = json_decode(file_get_contents("php://input"), true);
$id        = intval($data['id'] ?? 0);
$admin_dept = mysqli_real_escape_string($conn, trim($data['admin_dept'] ?? ''));

if (!$id) { echo json_encode(["status"=>"error","message"=>"Book ID required."]); exit(); }

// Validate dept ownership
if (!isAdmin($admin_dept)) {
    $chk = mysqli_query($conn, "SELECT id FROM books WHERE id=$id AND department='$admin_dept'");
    if (mysqli_num_rows($chk) === 0) {
        echo json_encode(["status"=>"error","message"=>"Access denied."]); exit();
    }
}

$title     = mysqli_real_escape_string($conn, trim($data['title']      ?? ''));
$author    = mysqli_real_escape_string($conn, trim($data['author']     ?? ''));
$publisher = mysqli_real_escape_string($conn, trim($data['publisher']  ?? ''));
$edition   = mysqli_real_escape_string($conn, trim($data['edition']    ?? ''));
$dept      = mysqli_real_escape_string($conn, trim($data['department'] ?? ''));

if (!$title || !$author) {
    echo json_encode(["status"=>"error","message"=>"Title and Author are required."]); exit();
}

// Non-admin cannot change department
if (!isAdmin($admin_dept)) $dept = $admin_dept;

$sql = "UPDATE books SET title='$title', author='$author', publisher='$publisher',
        edition='$edition', department='$dept' WHERE id=$id";

if (mysqli_query($conn, $sql)) {
    echo json_encode(["status"=>"success","message"=>"Book updated successfully."]);
} else {
    echo json_encode(["status"=>"error","message"=>mysqli_error($conn)]);
}
mysqli_close($conn);
?>