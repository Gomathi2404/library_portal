<?php
require_once 'config.php';
$conn = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// GET all dept admins
if ($method === 'GET') {
    $result = mysqli_query($conn, "SELECT id, username, department FROM admin WHERE username != 'admin' ORDER BY department");
    $admins = [];
    while ($row = mysqli_fetch_assoc($result)) $admins[] = $row;
    echo json_encode(["status" => "success", "data" => $admins]);
}

// POST - register new dept admin
elseif ($method === 'POST') {
    $data     = json_decode(file_get_contents("php://input"), true);
    $username = mysqli_real_escape_string($conn, trim($data['username'] ?? ''));
    $password = mysqli_real_escape_string($conn, trim($data['password'] ?? ''));
    $dept     = mysqli_real_escape_string($conn, trim($data['department'] ?? ''));

    if (!$username || !$password || !$dept) {
        echo json_encode(["status"=>"error","message"=>"All fields are required."]); exit();
    }

    $chk = mysqli_query($conn, "SELECT id FROM admin WHERE username='$username'");
    if (mysqli_num_rows($chk) > 0) {
        echo json_encode(["status"=>"error","message"=>"Username '$username' already exists."]); exit();
    }

    $chkDept = mysqli_query($conn, "SELECT id FROM admin WHERE department='$dept' AND username != 'admin'");
    if (mysqli_num_rows($chkDept) > 0) {
        echo json_encode(["status"=>"error","message"=>"Department '$dept' already has an admin account."]); exit();
    }

    mysqli_query($conn, "INSERT INTO admin (username, password, department) VALUES ('$username','$password','$dept')");
    echo json_encode(["status"=>"success","message"=>"Department '$dept' registered successfully!"]);
}

// PUT - reset password
elseif ($method === 'PUT') {
    $data     = json_decode(file_get_contents("php://input"), true);
    $id       = intval($data['id'] ?? 0);
    $password = mysqli_real_escape_string($conn, trim($data['password'] ?? ''));

    if (!$id || !$password) {
        echo json_encode(["status"=>"error","message"=>"ID and new password required."]); exit();
    }

    mysqli_query($conn, "UPDATE admin SET password='$password' WHERE id=$id AND username != 'admin'");
    echo json_encode(["status"=>"success","message"=>"Password updated successfully."]);
}

// DELETE - remove dept admin
elseif ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    mysqli_query($conn, "DELETE FROM admin WHERE id=$id AND username != 'admin'");
    echo json_encode(["status"=>"success","message"=>"Account removed."]);
}

mysqli_close($conn);
?>