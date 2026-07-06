<?php
require_once 'config.php';
$conn = getConnection();

$data       = json_decode(file_get_contents("php://input"), true);
$id         = intval($data['id']         ?? 0);
$admin_dept = mysqli_real_escape_string($conn, trim($data['admin_dept'] ?? ''));

if (!$id) { echo json_encode(["status"=>"error","message"=>"Member ID required."]); exit(); }

if (!isAdmin($admin_dept)) {
    $chk = mysqli_query($conn, "SELECT id FROM members WHERE id=$id AND department='$admin_dept'");
    if (mysqli_num_rows($chk) === 0) {
        echo json_encode(["status"=>"error","message"=>"Access denied."]); exit();
    }
}

$roll    = mysqli_real_escape_string($conn, trim($data['roll_no']     ?? ''));
$name    = mysqli_real_escape_string($conn, trim($data['name']        ?? ''));
$dept    = mysqli_real_escape_string($conn, trim($data['department']  ?? ''));
$section = mysqli_real_escape_string($conn, trim($data['section']     ?? ''));
$year    = mysqli_real_escape_string($conn, trim($data['year']        ?? ''));

$mtype = mysqli_real_escape_string($conn, trim($data['member_type'] ?? 'student'));

if (!$roll || !$name) {
    echo json_encode(["status"=>"error","message"=>"Roll No. and Name are required."]); exit();
}

// Check duplicate roll_no for other members
$chkRoll = mysqli_query($conn, "SELECT id FROM members WHERE roll_no='$roll' AND id != $id");
if (mysqli_num_rows($chkRoll) > 0) {
    echo json_encode(["status"=>"error","message"=>"Roll No. '$roll' already exists for another member."]); exit();
}

if (!isAdmin($admin_dept)) $dept = $admin_dept;

// If roll_no changed, update username to match new roll_no
// Password is NOT reset — student keeps whatever password they have set
$new_username = mysqli_real_escape_string($conn, strtolower(str_replace(' ', '', $roll)));

$sql = "UPDATE members
        SET roll_no='$roll', name='$name', department='$dept', section='$section',
            year='$year', 
            member_type='$mtype', username='$new_username'
        WHERE id=$id";

// Note: password column is intentionally NOT updated here
// Students manage their own password via change_password.php

if (mysqli_query($conn, $sql)) {
    echo json_encode([
        "status"  => "success",
        "message" => "Member updated!"
    ]);
} else {
    echo json_encode(["status"=>"error","message"=>mysqli_error($conn)]);
}

mysqli_close($conn);
?>