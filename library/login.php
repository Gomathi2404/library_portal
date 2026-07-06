<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept, Authorization");
header("Content-Type: application/json");


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


$host = "localhost";
$user = "root";
$pass = "";
$db   = "library_db";
$port = 3308;

$conn = mysqli_connect($host, $user, $pass, $db, $port);

if (!$conn) {
    echo json_encode([
        "status"  => "error",
        "message" => "DB failed: " . mysqli_connect_error()
    ]);
    exit();
}

mysqli_set_charset($conn, "utf8");

$raw  = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!$data || empty($data['username']) || empty($data['password'])) {
    echo json_encode(["status" => "error", "message" => "Username and password required!"]);
    exit();
}

$username = mysqli_real_escape_string($conn, trim($data['username']));
$password = mysqli_real_escape_string($conn, trim($data['password']));

$result = mysqli_query($conn, "SELECT * FROM admin WHERE username='$username' AND password='$password'");

if (mysqli_num_rows($result) === 1) {
    $row = mysqli_fetch_assoc($result);
    echo json_encode([
        "status"     => "success",
        "message"    => "Login successful",
        "department" => $row['department'] ?? 'admin',
        "username"   => $row['username']
    ]);
} else {
    echo json_encode(["status" => "error", "message" => "Invalid username or password!"]);
}

mysqli_close($conn);
?>