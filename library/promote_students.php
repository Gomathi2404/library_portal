<?php
require_once 'config.php';
$conn = getConnection();

$method     = $_SERVER['REQUEST_METHOD'];
$admin_dept = isset($_GET['dept'])
    ? mysqli_real_escape_string($conn, trim($_GET['dept']))
    : '';

// STRICT ORDER: highest year first so no student gets double-promoted
// Step 1: 4th Year  → Alumni
// Step 2: 3rd Year  → 4th Year
// Step 3: 2nd Year  → 3rd Year
// Step 4: 1st Year  → 2nd Year
$promotionSteps = [
    ['from' => 'IV Year', 'to' => 'Alumni'],
    ['from' => 'III Year', 'to' => 'IV Year'],
    ['from' => 'II Year', 'to' => 'III Year'],
    ['from' => 'I Year', 'to' => 'II Year'],
];

// ---- GET: preview ----
if ($method === 'GET') {
    $deptFilter = (!isAdmin($admin_dept)) ? "AND department='$admin_dept'" : '';

    $preview = [];
    foreach ($promotionSteps as $step) {
        $f   = mysqli_real_escape_string($conn, $step['from']);
        $res = mysqli_query($conn,
            "SELECT COUNT(*) AS c FROM members
             WHERE member_type = 'student' AND year = '$f' $deptFilter");
        $c = (int)mysqli_fetch_assoc($res)['c'];
        if ($c > 0) {
            $preview[] = [
                'from'  => $step['from'],
                'to'    => $step['to'],
                'count' => $c
            ];
        }
    }

    echo json_encode([
        'status'  => 'success',
        'preview' => $preview,
        'total'   => array_sum(array_column($preview, 'count'))
    ]);
    exit();
}

// ---- POST: execute ----
if ($method === 'POST') {
    $data       = json_decode(file_get_contents('php://input'), true);
    $admin_dept = mysqli_real_escape_string($conn, trim($data['admin_dept'] ?? ''));
    $confirm    = $data['confirm'] ?? false;

    if (!$confirm) {
        echo json_encode(['status' => 'error', 'message' => 'Confirmation required.']);
        exit();
    }

    $deptFilter = (!isAdmin($admin_dept)) ? "AND department = '$admin_dept'" : '';
    $promoted   = 0;
    $log        = [];

    // Execute each step ONE BY ONE in strict order
    // 4th → Alumni FIRST so 3rd → 4th doesn't accidentally push them further
    foreach ($promotionSteps as $step) {
        $f = mysqli_real_escape_string($conn, $step['from']);
        $t = mysqli_real_escape_string($conn, $step['to']);

        // Single targeted UPDATE — only touches members.year
        // Never references issued_books
        mysqli_query($conn,
            "UPDATE members
             SET    year = '$t'
             WHERE  member_type = 'student'
             AND    year = '$f'
             $deptFilter");

        $n = (int)mysqli_affected_rows($conn);
        $promoted += $n;
        $log[] = "Step: $f => $t — $n student(s) updated";
    }

    // Audit log
    $ts      = date('Y-m-d H:i:s');
    $details = mysqli_real_escape_string($conn, implode('; ', $log));
    $dept_l  = isAdmin($admin_dept) ? 'All Departments' : $admin_dept;

    $chk = mysqli_query($conn, "SHOW TABLES LIKE 'promotion_log'");
    if (mysqli_num_rows($chk) > 0) {
        mysqli_query($conn,
            "INSERT INTO promotion_log
                 (promoted_at, department, total_promoted, details, triggered_by)
             VALUES ('$ts', '$dept_l', $promoted, '$details', 'admin')");
    }

    echo json_encode([
        'status'   => 'success',
        'message'  => "$promoted student profile(s) promoted successfully.",
        'promoted' => $promoted,
        'log'      => $log,
        'note'     => 'issued_books.year_at_issue snapshots are completely untouched.'
    ]);
}

mysqli_close($conn);
?>