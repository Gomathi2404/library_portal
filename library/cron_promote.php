<?php
/**
 * CRON JOB SCRIPT — Automated Student Year Promotion
 * ====================================================
 * Schedule this via cPanel Cron Jobs or Linux crontab.
 *
 * Recommended schedule: Run once per year on June 1st at 00:00
 * Crontab entry:
 *   0 0 1 6 * /usr/bin/php /path/to/htdocs/library/cron_promote.php >> /path/to/cron.log 2>&1
 *
 * WINDOWS XAMPP Task Scheduler:
 *   Program: C:\xampp\php\php.exe
 *   Arguments: C:\xampp\htdocs\library\cron_promote.php
 *   Schedule: Yearly on June 1
 *
 * DATA PROTECTION:
 *   This script ONLY updates members.year
 *   It NEVER touches issued_books.year_at_issue (permanent snapshots)
 */

// Allow CLI execution + web execution (with secret key for security)
$isCLI = (php_sapi_name() === 'cli');

if (!$isCLI) {
    // Web trigger requires secret key
    $secret = $_GET['secret'] ?? '';
    $validSecret = 'AVC_CRON_2026_SECRET'; // Change this in production
    if ($secret !== $validSecret) {
        http_response_code(403);
        die("403 Forbidden — Invalid secret key.");
    }
}

require_once __DIR__ . '/config.php';
$conn = getConnection();

$timestamp = date("Y-m-d H:i:s");
$log       = [];
$log[]     = "=== Cron Promotion Started: $timestamp ===";

// Only run on June 1st (configurable)
$targetMonth = 6;  // June
$targetDay   = 1;
$currentMonth = (int)date('n');
$currentDay   = (int)date('j');

if (!$isCLI) {
    // When triggered via web, skip date check (manual trigger via URL)
    $log[] = "Web trigger — skipping date check.";
} else {
    if ($currentMonth !== $targetMonth || $currentDay !== $targetDay) {
        $log[] = "Skipped — not the scheduled date (June 1). Today: " . date("Y-m-d");
        echo implode("\n", $log) . "\n";
        exit();
    }
}

$promotionMap = [
    '1st Year' => '2nd Year',
    '2nd Year' => '3rd Year',
    '3rd Year' => '4th Year',
    '4th Year' => 'Alumni'
];

$totalPromoted = 0;

foreach ($promotionMap as $from => $to) {
    $from_esc = mysqli_real_escape_string($conn, $from);
    $to_esc   = mysqli_real_escape_string($conn, $to);

    // Count before
    $before = mysqli_fetch_assoc(mysqli_query($conn,
        "SELECT COUNT(*) AS c FROM members
         WHERE member_type='student' AND year='$from_esc'"))['c'];

    if ($before == 0) {
        $log[] = "  $from => $to : 0 students (skipped)";
        continue;
    }

    // UPDATE ONLY members.year — NEVER touches issued_books
    mysqli_query($conn,
        "UPDATE members
         SET year = '$to_esc'
         WHERE member_type = 'student' AND year = '$from_esc'");

    $affected = mysqli_affected_rows($conn);
    $totalPromoted += $affected;
    $log[] = "  $from => $to : $affected students promoted";
}

// Write to promotion_log table
$tableCheck = mysqli_query($conn, "SHOW TABLES LIKE 'promotion_log'");
if (mysqli_num_rows($tableCheck) > 0) {
    $details = mysqli_real_escape_string($conn, implode("; ", $log));
    mysqli_query($conn,
        "INSERT INTO promotion_log (promoted_at, department, total_promoted, details)
         VALUES ('$timestamp', 'All Departments (Cron)', $totalPromoted, '$details')");
}

$log[] = "=== Promotion Complete: $totalPromoted students updated ===";
$log[] = "=== issued_books.year_at_issue snapshots are completely untouched ===";

$output = implode("\n", $log) . "\n";

if ($isCLI) {
    echo $output;
} else {
    header("Content-Type: text/plain");
    echo $output;
}

mysqli_close($conn);
?>