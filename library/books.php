<?php
require_once 'config.php';
$conn = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $search  = isset($_GET['search']) ? mysqli_real_escape_string($conn, $_GET['search']) : '';
    $dept    = isset($_GET['dept'])   ? mysqli_real_escape_string($conn, trim($_GET['dept'])) : '';
    $isAdmin = ($dept === 'admin' || $dept === '');

    $sql = "SELECT b.*, COUNT(CASE WHEN bc.status != 'deleted' THEN bc.id END) AS total_copies,
                SUM(CASE WHEN bc.status='available' THEN 1 ELSE 0 END) AS available_copies
            FROM books b LEFT JOIN book_copies bc ON b.id=bc.book_id
            WHERE 1=1";

    if (!$isAdmin) $sql .= " AND b.department='$dept'";
    if ($search !== '') $sql .= " AND (b.title LIKE '%$search%' OR b.author LIKE '%$search%')";
    $sql .= " GROUP BY b.id HAVING total_copies > 0 ORDER BY b.id";

    $result = mysqli_query($conn, $sql);
    $books  = [];
    while ($row = mysqli_fetch_assoc($result)) $books[] = $row;
    echo json_encode(["status" => "success", "data" => $books]);

} elseif ($method === 'POST') {
    $data      = json_decode(file_get_contents("php://input"), true);
    $title     = mysqli_real_escape_string($conn, trim($data['title']       ?? ''));
    $author    = mysqli_real_escape_string($conn, trim($data['author']      ?? ''));
    $dept      = mysqli_real_escape_string($conn, trim($data['department']  ?? 'CS'));
    $edition   = mysqli_real_escape_string($conn, trim($data['edition']     ?? ''));
    $publisher = mysqli_real_escape_string($conn, trim($data['publisher']   ?? ''));
    $book_code = mysqli_real_escape_string($conn, trim($data['book_code']   ?? ''));

    if ($title === '' || $author === '') {
        echo json_encode(["status" => "error", "message" => "Title and Author are required!"]); exit();
    }
    if ($book_code === '') {
        echo json_encode(["status" => "error", "message" => "Book Code is required!"]); exit();
    }

    $chk = mysqli_query($conn, "SELECT id, book_id, status FROM book_copies WHERE copy_code='$book_code'");
    if (mysqli_num_rows($chk) > 0) {
        $existingCopy = mysqli_fetch_assoc($chk);

        if ($existingCopy['status'] === 'deleted') {
            // This code belongs to a previously soft-deleted copy — reactivate
            // the same copy + its parent book instead of blocking as a
            // duplicate. Keeps the same ids so old borrowing history is
            // still linked and visible.
            $reactivate_book_id = intval($existingCopy['book_id']);
            $reactivate_copy_id = intval($existingCopy['id']);

            mysqli_query($conn, "UPDATE books
                    SET title='$title', author='$author', department='$dept',
                        edition='$edition', publisher='$publisher'
                    WHERE id=$reactivate_book_id");
            mysqli_query($conn, "UPDATE book_copies SET status='available' WHERE id=$reactivate_copy_id");

            echo json_encode(["status" => "success", "message" => "Book Code '$book_code' reactivated! Previous borrowing history restored."]);
            mysqli_close($conn);
            exit();
        }

        echo json_encode(["status" => "error", "message" => "Book Code '$book_code' already exists!"]); exit();
    }

    $existing = mysqli_query($conn, "SELECT id FROM books WHERE LOWER(title)=LOWER('$title') LIMIT 1");
    if (mysqli_num_rows($existing) > 0) {
        $book_id = mysqli_fetch_assoc($existing)['id'];
        mysqli_query($conn, "INSERT INTO book_copies (book_id, copy_code) VALUES ($book_id, '$book_code')");
        echo json_encode(["status" => "success", "message" => "Copy '$book_code' added to existing book!"]);
    } else {
        mysqli_query($conn, "INSERT INTO books (title,author,department,edition,publisher) VALUES ('$title','$author','$dept','$edition','$publisher')");
        $book_id = mysqli_insert_id($conn);
        mysqli_query($conn, "INSERT INTO book_copies (book_id, copy_code) VALUES ($book_id, '$book_code')");
        echo json_encode(["status" => "success", "message" => "Book added! "]);
    }

} elseif ($method === 'DELETE') {
    $id = intval($_GET['id']);

    // Walk every copy under this book title — same rule as delete_copy.php:
    // a copy with issue history gets soft-deleted (row kept, status='deleted')
    // so the issued_books foreign key never blocks the delete; a copy with
    // no history at all gets hard-deleted.
    $copiesRes = mysqli_query($conn, "SELECT id FROM book_copies WHERE book_id=$id");
    $copyIds = [];
    while ($row = mysqli_fetch_assoc($copiesRes)) $copyIds[] = intval($row['id']);

    foreach ($copyIds as $cid) {
        $histRes    = mysqli_query($conn, "SELECT COUNT(*) AS c FROM issued_books WHERE copy_id=$cid");
        $hasHistory = intval(mysqli_fetch_assoc($histRes)['c']) > 0;

        if ($hasHistory) {
            mysqli_query($conn, "UPDATE book_copies SET status='deleted' WHERE id=$cid");
        } else {
            mysqli_query($conn, "DELETE FROM book_copies WHERE id=$cid");
        }
    }

    // Only remove the book row itself once literally zero book_copies rows
    // remain (soft-deleted ones included), so any archived copy's history
    // stays joinable to its parent book.
    $remaining_res = mysqli_query($conn, "SELECT COUNT(*) AS c FROM book_copies WHERE book_id=$id");
    $remaining     = intval(mysqli_fetch_assoc($remaining_res)['c']);

    if ($remaining === 0) {
        if (mysqli_query($conn, "DELETE FROM books WHERE id=$id")) {
            echo json_encode(["status" => "success", "message" => "Book deleted!"]);
        } else {
            echo json_encode(["status" => "error", "message" => mysqli_error($conn)]);
        }
    } else {
        // Some copies had history and were archived instead of removed —
        // the book record itself stays (so that history is still joinable)
        // but it's already invisible in the active list since total_copies is 0.
        echo json_encode(["status" => "success", "message" => "Book deleted. Borrowing history preserved."]);
    }
}
mysqli_close($conn);
?>