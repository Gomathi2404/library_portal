<?php
require_once 'config.php';
$conn = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $search  = isset($_GET['search']) ? mysqli_real_escape_string($conn, $_GET['search']) : '';
    $type    = isset($_GET['type'])   ? mysqli_real_escape_string($conn, $_GET['type'])   : '';
    $year    = isset($_GET['year'])   ? mysqli_real_escape_string($conn, trim($_GET['year'])) : '';
    $dept    = isset($_GET['dept'])   ? mysqli_real_escape_string($conn, trim($_GET['dept'])) : '';

    $where = ["1=1"];
    // Never show archived members in main list
    $where[] = "m.year != 'Archived'";
    if ($search !== '') $where[] = "(m.name LIKE '%$search%' OR m.roll_no LIKE '%$search%')";
    if ($type   !== '') $where[] = "m.member_type = '$type'";
    if ($year   !== '') $where[] = "m.year = '$year'";
    if (!isAdmin($dept)) $where[] = "m.department = '$dept'";

    $sql = "SELECT m.*,
                COUNT(ib.id) AS total_issued,
                SUM(CASE WHEN ib.status='issued'   THEN 1 ELSE 0 END) AS currently_holding,
                SUM(CASE WHEN ib.status='returned' THEN 1 ELSE 0 END) AS total_returned,
                SUM(CASE WHEN ib.status='issued' AND ib.due_date < CURDATE() THEN 1 ELSE 0 END) AS overdue_count
            FROM members m
            LEFT JOIN issued_books ib ON m.id = ib.member_id
            WHERE " . implode(" AND ", $where) . "
            GROUP BY m.id
            ORDER BY m.roll_no ASC";

    $result  = mysqli_query($conn, $sql);
    if (!$result) { echo json_encode(["status"=>"error","message"=>mysqli_error($conn)]); exit(); }
    $members = [];
    while ($row = mysqli_fetch_assoc($result)) $members[] = $row;
    echo json_encode(["status"=>"success","data"=>$members]);

} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) { echo json_encode(["status"=>"error","message"=>"No data received."]); exit(); }

    $roll       = trim($data['roll_no']      ?? '');
    $name       = trim($data['name']         ?? '');
    $dept       = trim($data['department']   ?? '');
    $section    = trim($data['section']      ?? '');
    $year       = trim($data['year']         ?? 'I Year');
    $type       = trim($data['member_type']  ?? 'student');
    $admin_dept = trim($data['admin_dept']   ?? '');

    if ($roll === '') { echo json_encode(["status"=>"error","message"=>"Roll No. is required!"]); exit(); }
    if ($name === '') { echo json_encode(["status"=>"error","message"=>"Name is required!"]); exit(); }
    if ($dept === '') { echo json_encode(["status"=>"error","message"=>"Department is required!"]); exit(); }

    if (!isAdmin($admin_dept)) $dept = $admin_dept;

    $username = strtolower(str_replace(' ', '', $roll));
    $password = strtolower(str_replace(' ', '', $roll));

    $roll     = mysqli_real_escape_string($conn, $roll);
    $name     = mysqli_real_escape_string($conn, $name);
    $dept     = mysqli_real_escape_string($conn, $dept);
    $section  = mysqli_real_escape_string($conn, $section);
    $year     = mysqli_real_escape_string($conn, $year);
    $type     = mysqli_real_escape_string($conn, $type);
    $username = mysqli_real_escape_string($conn, $username);
    $password = mysqli_real_escape_string($conn, $password);

    $check = mysqli_query($conn, "SELECT id, year FROM members WHERE roll_no='$roll'");
    if (mysqli_num_rows($check) > 0) {
        $existing = mysqli_fetch_assoc($check);

        if ($existing['year'] === 'Archived') {
            // This roll_no belongs to a soft-deleted member — reactivate the
            // same row instead of blocking the add or creating a duplicate.
            // Keeps their id intact so old borrowing history stays linked.
            $reactivate_id = intval($existing['id']);
            $sql = "UPDATE members
                    SET name='$name', department='$dept', section='$section',
                        year='$year', member_type='$type',
                        username='$username', password='$password'
                    WHERE id=$reactivate_id";

            if (mysqli_query($conn, $sql)) {
                echo json_encode([
                    "status"  => "success",
                    "message" => "Member Added!"
                ]);
            } else {
                echo json_encode(["status"=>"error","message"=>"DB Error: ".mysqli_error($conn)]);
            }
            mysqli_close($conn);
            exit();
        }

        echo json_encode(["status"=>"error","message"=>"Roll No. '$roll' already exists!"]); exit();
    }

    $sql = "INSERT INTO members (roll_no, name, department, section, year, member_type, username, password)
            VALUES ('$roll','$name','$dept','$section','$year','$type','$username','$password')";

    if (mysqli_query($conn, $sql)) {
        echo json_encode([
            "status"  => "success",
            "message" => "Member  added!",
        ]);
    } else {
        echo json_encode(["status"=>"error","message"=>"DB Error: ".mysqli_error($conn)]);
    }

} elseif ($method === 'DELETE') {
    $id   = intval($_GET['id']);
    $dept = isset($_GET['dept']) ? mysqli_real_escape_string($conn, trim($_GET['dept'])) : '';

    if (!isAdmin($dept)) {
        $chk = mysqli_query($conn, "SELECT id FROM members WHERE id=$id AND department='$dept'");
        if (mysqli_num_rows($chk) === 0) {
            echo json_encode(["status"=>"error","message"=>"Access denied."]); exit();
        }
    }

    // Check if member has history
    $hasHistory = (int)mysqli_fetch_assoc(mysqli_query($conn,
        "SELECT COUNT(*) AS c FROM issued_books WHERE member_id=$id"))['c'];

    // Check if currently has books
    $hasActive = (int)mysqli_fetch_assoc(mysqli_query($conn,
        "SELECT COUNT(*) AS c FROM issued_books WHERE member_id=$id AND status='issued'"))['c'];

    if ($hasActive > 0) {
        echo json_encode(["status"=>"error","message"=>"Cannot remove: member has books currently issued."]); exit();
    }

    if ($hasHistory > 0) {
        // Soft delete — preserve history
        mysqli_query($conn, "UPDATE members SET year='Archived', member_type='alumni' WHERE id=$id");
        echo json_encode(["status"=>"success","message"=>"Member removed from active list. History preserved."]);
    } else {
        // Hard delete — no history
        mysqli_query($conn, "DELETE FROM members WHERE id=$id");
        echo json_encode(["status"=>"success","message"=>"Member deleted."]);
    }
}

mysqli_close($conn);
?>