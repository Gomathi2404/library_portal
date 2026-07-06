<?php
require_once 'config.php';
$conn = getConnection();

$code = isset($_GET['code']) ? mysqli_real_escape_string($conn, trim($_GET['code'])) : '';
$dept = isset($_GET['dept']) ? mysqli_real_escape_string($conn, trim($_GET['dept'])) : '';

if ($code === '') { echo json_encode(["status"=>"error","message"=>"Book code is required."]); exit(); }

$sql = "SELECT bc.id AS copy_id, bc.copy_code, bc.status,
               b.id AS book_id, b.title, b.author, b.department, b.edition, b.publisher,
               COUNT(bc2.id) AS total_copies,
               SUM(CASE WHEN bc2.status='available' THEN 1 ELSE 0 END) AS available_copies
        FROM book_copies bc
        JOIN books b ON bc.book_id=b.id
        LEFT JOIN book_copies bc2 ON bc2.book_id=b.id
        WHERE bc.copy_code='$code'
        GROUP BY bc.id";

$result = mysqli_query($conn, $sql);

if (mysqli_num_rows($result) === 0) {
    echo json_encode(["status"=>"error","message"=>"Book Code '$code' not found!"]); exit();
}

$row = mysqli_fetch_assoc($result);

// STRICT: validate book belongs to this admin's dept
if (!isAdmin($dept) && $row['department'] !== $dept) {
    echo json_encode(["status"=>"error","message"=>"Book code '$code' belongs to {$row['department']} dept. Access denied!"]); exit();
}

if ($row['status'] === 'deleted') {
    echo json_encode(["status"=>"unavailable","message"=>"Book Not Found ."]); exit();
}
if ($row['status'] !== 'available') {
    echo json_encode(["status"=>"unavailable","message"=>"This book copy is currently unavailable (already issued)."]); exit();
}

echo json_encode(["status"=>"success","data"=>$row]);
mysqli_close($conn);
?>