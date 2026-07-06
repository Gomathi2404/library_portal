<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once 'config.php';
$conn = getConnection();

register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && ($error['type'] === E_ERROR || $error['type'] === E_PARSE || $error['type'] === E_COMPILE_ERROR)) {
        echo json_encode(["status" => "error", "message" => "PHP Crash Intercepted: " . $error['message']]);
        exit();
    }
});

$copy_id    = intval($_GET['copy_id'] ?? 0);
$admin_dept = mysqli_real_escape_string($conn, trim($_GET['dept'] ?? ''));

if (!$copy_id) {
    echo json_encode(["status" => "error", "message" => "Copy ID required."]);
    exit();
}

// book_copies primary key is "id" (see get_copy.php / update_copy.php for reference) —
// no need to dynamically probe for a "copy_id" column that doesn't exist on the table.
$query = "SELECT bc.id AS final_copy_id, bc.book_id, b.department, bc.status AS current_status
          FROM book_copies bc
          JOIN books b ON bc.book_id = b.id
          WHERE bc.id = $copy_id";

$res = mysqli_query($conn, $query);

if (!$res || mysqli_num_rows($res) === 0) {
    echo json_encode(["status" => "error", "message" => "Copy not found or already deleted."]);
    exit();
}

$copy    = mysqli_fetch_assoc($res);
$book_id = intval($copy['book_id']);

// Enforce department access, same as the rest of the admin endpoints.
if (!isAdmin($admin_dept) && $copy['department'] !== $admin_dept) {
    echo json_encode(["status" => "error", "message" => "Access denied."]);
    exit();
}

// Does this copy have any borrow history? If it does, a hard DELETE would
// either violate the issued_books -> book_copies foreign key (blocking the
// delete entirely) or silently wipe that history. Either way, soft-delete
// instead: keep the row, mark it deleted, and hide it from active listings.
$hist_res = mysqli_query($conn, "SELECT COUNT(*) AS c FROM issued_books WHERE copy_id = $copy_id");
$has_history = intval(mysqli_fetch_assoc($hist_res)['c']) > 0;

if ($has_history) {
    $soft_delete = mysqli_query($conn, "UPDATE book_copies SET status = 'deleted' WHERE id = $copy_id");
    if (!$soft_delete) {
        echo json_encode(["status" => "error", "message" => "SQL Delete execution failed."]);
        exit();
    }
    echo json_encode(["status" => "success", "message" => "Book Deleted!."]);
    mysqli_close($conn);
    exit();
}

// No history — safe to hard delete.
$delete_query = mysqli_query($conn, "DELETE FROM book_copies WHERE id = $copy_id");
if (!$delete_query) {
    echo json_encode(["status" => "error", "message" => "SQL Delete execution failed."]);
    exit();
}

// Clean up empty master books safely — only once truly zero book_copies rows
// remain (including soft-deleted ones), so a deleted copy's history stays
// joinable to its parent book.
$remaining_res = mysqli_query($conn, "SELECT COUNT(*) AS c FROM book_copies WHERE book_id = $book_id");
$remaining_row  = mysqli_fetch_assoc($remaining_res);
$remaining      = intval($remaining_row['c']);

if ($remaining === 0) {
    mysqli_query($conn, "DELETE FROM books WHERE id = $book_id");
}

echo json_encode(["status" => "success", "message" => "Book deleted!"]);
mysqli_close($conn);
exit();
?>