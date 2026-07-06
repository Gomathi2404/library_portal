<?php
require_once 'config.php';
$conn = getConnection();

$data     = json_decode(file_get_contents("php://input"), true);
$username = mysqli_real_escape_string($conn, trim($data['username']     ?? ''));
$old_pass = mysqli_real_escape_string($conn, trim($data['old_password'] ?? ''));
$new_pass = mysqli_real_escape_string($conn, trim($data['new_password'] ?? ''));

if (!$username || !$old_pass || !$new_pass) {
    echo json_encode(["status"=>"error","message"=>"All fields are required."]); exit();
}

if (strlen($new_pass) < 4) {
    echo json_encode(["status"=>"error","message"=>"New password must be at least 4 characters."]); exit();
}

// Verify current credentials
$res = mysqli_query($conn,
    "SELECT id FROM members WHERE username='$username' AND password='$old_pass'");

if (mysqli_num_rows($res) === 0) {
    echo json_encode(["status"=>"error","message"=>"Current password is incorrect."]); exit();
}

// Update password
$row = mysqli_fetch_assoc($res);
$id  = intval($row['id']);

mysqli_query($conn, "UPDATE members SET password='$new_pass' WHERE id=$id");

echo json_encode([
    "status"  => "success",
    "message" => "Password updated successfully. Please log in with your new password."
]);

mysqli_close($conn);
?>