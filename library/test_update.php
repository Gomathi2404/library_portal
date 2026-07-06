<?php
require_once 'config.php';
$conn = getConnection();

if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Connection failed"]);
    exit();
}

// Check if members table has data
$result = mysqli_query($conn, "SELECT id, roll_no, name FROM members LIMIT 1");
if (!$result) {
    echo json_encode(["status" => "error", "message" => "Query failed: " . mysqli_error($conn)]);
    exit();
}

$member = mysqli_fetch_assoc($result);
if (!$member) {
    echo json_encode(["status" => "error", "message" => "No members in database"]);
    exit();
}

// Try to update the first member
$id = $member['id'];
$sql = "UPDATE members SET name='Test Update " . time() . "' WHERE id=$id";
$update_result = mysqli_query($conn, $sql);

if ($update_result) {
    $check = mysqli_query($conn, "SELECT name FROM members WHERE id=$id");
    $updated = mysqli_fetch_assoc($check);
    echo json_encode([
        "status" => "success", 
        "message" => "Update test successful", 
        "member_id" => $id,
        "new_name" => $updated['name']
    ]);
} else {
    echo json_encode([
        "status" => "error", 
        "message" => "Update failed: " . mysqli_error($conn)
    ]);
}

mysqli_close($conn);
?>
