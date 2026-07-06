<?php
require_once 'config.php';
$conn = getConnection();

// Get table structure
$result = mysqli_query($conn, "DESCRIBE members");
if ($result) {
    $columns = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $columns[] = $row['Field'];
    }
    echo json_encode([
        "status" => "success",
        "table_structure" => $columns
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Table 'members' not found or error: " . mysqli_error($conn)
    ]);
}

mysqli_close($conn);
?>
