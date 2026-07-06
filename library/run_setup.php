<?php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "library_db";
$port = 3308;

$conn = mysqli_connect($host, $user, $pass, $db, $port);
if (!$conn) {
    echo "Connection failed: " . mysqli_connect_error();
    exit();
}

mysqli_set_charset($conn, "utf8");

// Read and execute setup.sql
$sql = file_get_contents(__DIR__ . '/setup.sql');
$statements = array_filter(array_map('trim', explode(';', $sql)), fn($s) => !empty($s));

foreach ($statements as $statement) {
    if (mysqli_query($conn, $statement)) {
        echo "✓ Executed: " . substr($statement, 0, 50) . "...<br>";
    } else {
        echo "✗ Error: " . mysqli_error($conn) . "<br>";
        echo "Statement: " . substr($statement, 0, 100) . "...<br>";
    }
}

echo "<br><strong>Database setup complete!</strong>";
mysqli_close($conn);
?>
