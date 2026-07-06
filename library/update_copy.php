<?php
require_once 'config.php';
$conn = getConnection();

$data       = json_decode(file_get_contents("php://input"), true);
$copy_id    = intval($data['copy_id']    ?? 0);
$admin_dept = mysqli_real_escape_string($conn, trim($data['admin_dept'] ?? ''));

if (!$copy_id) {
    echo json_encode(["status"=>"error","message"=>"Copy ID required."]); exit();
}

// Get existing copy + book
$res = mysqli_query($conn,
    "SELECT bc.id, bc.book_id, b.department
     FROM book_copies bc JOIN books b ON bc.book_id=b.id
     WHERE bc.id=$copy_id");
if (mysqli_num_rows($res) === 0) {
    echo json_encode(["status"=>"error","message"=>"Copy not found."]); exit();
}
$copy = mysqli_fetch_assoc($res);

if (!isAdmin($admin_dept) && $copy['department'] !== $admin_dept) {
    echo json_encode(["status"=>"error","message"=>"Access denied."]); exit();
}

$book_id   = intval($copy['book_id']);
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

// Update parent book record
$sql = "UPDATE books
        SET title='$title', author='$author', publisher='$publisher',
            edition='$edition', department='$dept'
        WHERE id=$book_id";

if (mysqli_query($conn, $sql)) {
    echo json_encode(["status"=>"success","message"=>"Book details updated successfully."]);
} else {
    echo json_encode(["status"=>"error","message"=>mysqli_error($conn)]);
}

mysqli_close($conn);
?>