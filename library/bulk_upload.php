<?php
require_once 'config.php';
$conn = getConnection();

$type       = $_POST['type']       ?? '';
$admin_dept = mysqli_real_escape_string($conn, trim($_POST['admin_dept'] ?? ''));
$rows_json  = $_POST['rows']       ?? '[]';
$rows       = json_decode($rows_json, true);

if (empty($rows) || !is_array($rows)) {
    echo json_encode(["status"=>"error","message"=>"No data received."]); exit();
}

$inserted = 0;
$skipped  = 0;
$errors   = [];

if ($type === 'books') {
    foreach ($rows as $i => $row) {
        $title     = mysqli_real_escape_string($conn, trim($row['title']      ?? ''));
        $author    = mysqli_real_escape_string($conn, trim($row['author']     ?? ''));
        $publisher = mysqli_real_escape_string($conn, trim($row['publisher']  ?? ''));
        $edition   = mysqli_real_escape_string($conn, trim($row['edition']    ?? ''));
        $dept      = mysqli_real_escape_string($conn, trim($row['department'] ?? $admin_dept));
        $book_code = mysqli_real_escape_string($conn, trim($row['book_code']  ?? ''));

        if (!$title || !$author || !$book_code) {
            $errors[] = "Row ".($i+2).": title, author, book_code are required.";
            $skipped++; continue;
        }

        if (!isAdmin($admin_dept)) $dept = $admin_dept;

        $chk = mysqli_query($conn, "SELECT id FROM book_copies WHERE copy_code='$book_code'");
        if (mysqli_num_rows($chk) > 0) {
            $errors[] = "Row ".($i+2).": book_code '$book_code' already exists.";
            $skipped++; continue;
        }

        $existing = mysqli_query($conn, "SELECT id FROM books WHERE LOWER(title)=LOWER('$title') LIMIT 1");
        if (mysqli_num_rows($existing) > 0) {
            $book_id = mysqli_fetch_assoc($existing)['id'];
        } else {
            mysqli_query($conn, "INSERT INTO books (title,author,department,edition,publisher) VALUES ('$title','$author','$dept','$edition','$publisher')");
            $book_id = mysqli_insert_id($conn);
        }
        mysqli_query($conn, "INSERT INTO book_copies (book_id,copy_code) VALUES ($book_id,'$book_code')");
        $inserted++;
    }

} elseif ($type === 'members') {
    foreach ($rows as $i => $row) {
        $roll     = mysqli_real_escape_string($conn, trim($row['roll_no']      ?? ''));
        $name     = mysqli_real_escape_string($conn, trim($row['name']         ?? ''));
        $dept     = mysqli_real_escape_string($conn, trim($row['department']   ?? $admin_dept));
        $year     = mysqli_real_escape_string($conn, trim($row['year']         ?? '1st Year'));
        
        $mtype    = mysqli_real_escape_string($conn, trim($row['member_type']  ?? 'student'));
        // Auto-generate login: username = lowercase roll_no, password = roll_no
        $uname    = mysqli_real_escape_string($conn, strtolower(str_replace(' ','',$roll)));
        $pass     = mysqli_real_escape_string($conn, strtolower(str_replace(' ','',$roll)));

        if (!$roll || !$name) {
            $errors[] = "Row ".($i+2).": roll_no and name are required.";
            $skipped++; continue;
        }

        if (!isAdmin($admin_dept)) $dept = $admin_dept;

        $chk = mysqli_query($conn, "SELECT id FROM members WHERE roll_no='$roll'");
        if (mysqli_num_rows($chk) > 0) {
            $errors[] = "Row ".($i+2).": roll_no '$roll' already exists.";
            $skipped++; continue;
        }

        mysqli_query($conn, "INSERT INTO members (roll_no,name,department,year,member_type,username,password)
                             VALUES ('$roll','$name','$dept','$year','$mtype','$uname','$pass')");
        $inserted++;
    }
} else {
    echo json_encode(["status"=>"error","message"=>"Invalid type."]); exit();
}

echo json_encode([
    "status"   => "success",
    "message"  => "$inserted records inserted, $skipped skipped.",
    "inserted" => $inserted,
    "skipped"  => $skipped,
    "errors"   => $errors
]);
mysqli_close($conn);
?>