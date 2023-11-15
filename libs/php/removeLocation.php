<?php
$executionStartTime = microtime(true);

include("config.php");

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
  // Existing error handling...
  exit;
}

// Updated SQL query to fetch department names along with count
$query = $conn->prepare('SELECT d.name FROM department d WHERE d.locationID = ?');

$query->bind_param("i", $_REQUEST['id']);
$query->execute();

if (false === $query) {
  // Existing error handling...
  exit;
}

$result = $query->get_result();

$departmentNames = [];
while ($row = mysqli_fetch_assoc($result)) {
  array_push($departmentNames, $row['name']);
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = [
  'departmentCount' => count($departmentNames),
  'departmentNames' => $departmentNames
];

echo json_encode($output);
mysqli_close($conn);
