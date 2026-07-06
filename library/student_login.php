<?php
require_once 'config.php';
$conn = getConnection();

$data     = json_decode(file_get_contents("php://input"), true);
$username = mysqli_real_escape_string($conn, trim($data['username'] ?? ''));
$password = mysqli_real_escape_string($conn, trim($data['password'] ?? ''));

if (!$username || !$password) {
    echo json_encode(["status"=>"error","message"=>"Username and password are required."]); exit();
}

$sql    = "SELECT * FROM members WHERE username='$username' AND password='$password'";
$result = mysqli_query($conn, $sql);

if (mysqli_num_rows($result) === 1) {
    $member = mysqli_fetch_assoc($result);
    echo json_encode([
        "status"     => "success",
        "message"    => "Login successful",
        "member_id"  => $member['id'],
        "name"       => $member['name'],
        "roll_no"    => $member['roll_no'],
        "department" => $member['department'],
        "year"       => $member['year'],
        "member_type"=> $member['member_type']
    ]);
} else {
    echo json_encode(["status"=>"error","message"=>"Invalid username or password."]);
}

mysqli_close($conn);
?>