<?php
require_once 'config.php';

echo json_encode(["message" => "Testing database connection..."]);

$conn = getConnection();
if ($conn) {
    echo json_encode(["status" => "success", "message" => "Database connected successfully!"]);
    
    // Check if members table exists
    $result = mysqli_query($conn, "SHOW TABLES LIKE 'members'");
    if (mysqli_num_rows($result) > 0) {
        echo json_encode(["status" => "success", "message" => "Members table exists"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Members table NOT found. Create tables first."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Connection failed"]);
}
?>
