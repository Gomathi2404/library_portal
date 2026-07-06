<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");
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

function getConnection() {
    global $host, $user, $pass, $db, $port;
    $conn = mysqli_connect($host, $user, $pass, $db, $port);
    if (!$conn) {
        echo json_encode(["status" => "error", "message" => "DB Connection failed: " . mysqli_connect_error()]);
        exit();
    }
    mysqli_set_charset($conn, "utf8");
    return $conn;
}

// Returns true if this dept sees everything
function isAdmin($dept) {
    return ($dept === 'admin' || $dept === '' || $dept === null);
}
?>