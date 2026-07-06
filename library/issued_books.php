<?php
require_once 'config.php';
$conn = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// GET available copies for a book
if ($method === 'GET' && isset($_GET['available_copies'])) {
    $book_id = intval($_GET['book_id']);
    $result  = mysqli_query($conn,
        "SELECT id, copy_code FROM book_copies
         WHERE book_id=$book_id AND status='available'
         ORDER BY copy_code");
    $copies = [];
    while ($row = mysqli_fetch_assoc($result)) $copies[] = $row;
    echo json_encode(["status"=>"success","data"=>$copies]);
    exit();
}

// GET issued books — strict dept filter
if ($method === 'GET') {
    $status  = isset($_GET['status']) ? mysqli_real_escape_string($conn, $_GET['status']) : '';
    $dept    = isset($_GET['dept'])   ? mysqli_real_escape_string($conn, trim($_GET['dept'])) : '';
    $admin   = isAdmin($dept);

    $where = ["1=1"];
    if ($status !== '') $where[] = "ib.status='$status'";
    if (!$admin)        $where[] = "b.department='$dept'";

    $sql = "SELECT
                ib.id, ib.issue_date, ib.due_date, ib.return_date,
                ib.fine, ib.status,
                -- Use snapshot year; fall back to current year for old records
                COALESCE(ib.year_at_issue, m.year) AS year_at_issue,
                m.roll_no, m.name AS member_name,
                m.department AS member_dept, m.year AS current_year,
                m.id AS member_id,
                b.title AS book_title, b.author,
                b.department AS book_dept,
                bc.copy_code, bc.id AS copy_id
            FROM issued_books ib
            JOIN members m      ON ib.member_id = m.id
            JOIN book_copies bc ON ib.copy_id   = bc.id
            JOIN books b        ON bc.book_id   = b.id
            WHERE " . implode(" AND ", $where) . "
            ORDER BY ib.id DESC";

    $result = mysqli_query($conn, $sql);
    if (!$result) {
        echo json_encode(["status"=>"error","message"=>mysqli_error($conn)]); exit();
    }

    $issues = [];
    while ($row = mysqli_fetch_assoc($result)) {
        if ($row['status'] === 'issued') {
            $due   = new DateTime($row['due_date']);
            $today = new DateTime();
            if ($today > $due) {
                $row['days_late'] = $today->diff($due)->days;
                $row['fine']      = $row['days_late'] * 2;
            } else {
                $row['days_late'] = 0;
            }
        }
        $issues[] = $row;
    }
    echo json_encode(["status"=>"success","data"=>$issues]);
}

// ISSUE a book — snapshot year at time of issue
elseif ($method === 'POST') {
    $data       = json_decode(file_get_contents("php://input"), true);
    $member_id  = intval($data['member_id']);
    $copy_code  = mysqli_real_escape_string($conn, trim($data['copy_code']));
    $issue_date = mysqli_real_escape_string($conn, $data['issue_date']);
    $due_date   = mysqli_real_escape_string($conn, $data['due_date']);
    $admin_dept = mysqli_real_escape_string($conn, trim($data['admin_dept'] ?? ''));

    // Get copy and validate
    $res = mysqli_query($conn,
        "SELECT bc.*, b.department AS book_dept
         FROM book_copies bc
         JOIN books b ON bc.book_id=b.id
         WHERE bc.copy_code='$copy_code'");
    if (mysqli_num_rows($res) === 0) {
        echo json_encode(["status"=>"error","message"=>"Book code '$copy_code' not found!"]); exit();
    }
    $copy = mysqli_fetch_assoc($res);

    if (!isAdmin($admin_dept) && $copy['book_dept'] !== $admin_dept) {
        echo json_encode(["status"=>"error","message"=>"This book belongs to {$copy['book_dept']} dept. Access denied."]); exit();
    }
    if ($copy['status'] === 'deleted') {
        echo json_encode(["status"=>"error","message"=>"This copy has been removed and cannot be issued."]); exit();
    }
    if ($copy['status'] !== 'available') {
        echo json_encode(["status"=>"error","message"=>"This copy is already issued."]); exit();
    }

    // Validate member belongs to dept
    if (!isAdmin($admin_dept)) {
        $mChk = mysqli_query($conn,
            "SELECT id FROM members WHERE id=$member_id AND department='$admin_dept'");
        if (mysqli_num_rows($mChk) === 0) {
            echo json_encode(["status"=>"error","message"=>"This member does not belong to your department."]); exit();
        }
    }

    // *** SNAPSHOT: read member's current year right now ***
    $mRes       = mysqli_query($conn, "SELECT year FROM members WHERE id=$member_id");
    $mRow       = mysqli_fetch_assoc($mRes);
    $year_snap  = mysqli_real_escape_string($conn, $mRow['year'] ?? '');

    $copy_id = $copy['id'];

    // Insert with year snapshot
    $sql = "INSERT INTO issued_books (member_id, copy_id, issue_date, due_date, year_at_issue)
            VALUES ($member_id, $copy_id, '$issue_date', '$due_date', '$year_snap')";

    if (mysqli_query($conn, $sql)) {
        mysqli_query($conn, "UPDATE book_copies SET status='issued' WHERE id=$copy_id");
        echo json_encode([
            "status"  => "success",
            "message" => "Book issued!"
        ]);
    } else {
        echo json_encode(["status"=>"error","message"=>mysqli_error($conn)]);
    }
}

// RETURN a book
elseif ($method === 'PUT') {
    $data        = json_decode(file_get_contents("php://input"), true);
    $issue_id    = intval($data['issue_id']);
    $return_date = mysqli_real_escape_string($conn, $data['return_date']);
    $fine        = floatval($data['fine']);
    $admin_dept  = mysqli_real_escape_string($conn, trim($data['admin_dept'] ?? ''));

    if (!isAdmin($admin_dept)) {
        $chk = mysqli_query($conn,
            "SELECT ib.id FROM issued_books ib
             JOIN book_copies bc ON ib.copy_id=bc.id
             JOIN books b ON bc.book_id=b.id
             WHERE ib.id=$issue_id AND b.department='$admin_dept'");
        if (mysqli_num_rows($chk) === 0) {
            echo json_encode(["status"=>"error","message"=>"Access denied."]); exit();
        }
    }

    $res     = mysqli_query($conn, "SELECT copy_id FROM issued_books WHERE id=$issue_id");
    $copy_id = mysqli_fetch_assoc($res)['copy_id'];

    mysqli_query($conn,
        "UPDATE issued_books SET return_date='$return_date', fine=$fine, status='returned'
         WHERE id=$issue_id");
    mysqli_query($conn, "UPDATE book_copies SET status='available' WHERE id=$copy_id");
    echo json_encode(["status"=>"success","message"=>"Book returned!"]);
}

mysqli_close($conn);
?>