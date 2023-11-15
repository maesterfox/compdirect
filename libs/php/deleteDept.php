<?php

$executionStartTime = microtime(true);

include("config.php");

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
  $output = [
    'status' => ['code' => "300", 'name' => "failure", 'description' => "database unavailable"],
    'data' => []
  ];
  echo json_encode($output);
  mysqli_close($conn);
  exit;
}

// Updated SQL query to fetch employee names and order by last name
$query = $conn->prepare('SELECT p.lastName, p.firstName FROM personnel p WHERE p.departmentID = ? ORDER BY p.lastName, p.firstName');

$query->bind_param("i", $_REQUEST['id']);
$query->execute();

if (false === $query) {
  $output = [
    'status' => ['code' => "400", 'name' => "executed", 'description' => "query failed"],
    'data' => []
  ];
  echo json_encode($output);
  mysqli_close($conn);
  exit;
}

$result = $query->get_result();

$employeeNames = [];
while ($row = mysqli_fetch_assoc($result)) {
  array_push($employeeNames, $row['lastName'] . ', ' . $row['firstName']);
}

$output = [
  'status' => ['code' => "200", 'name' => "ok", 'description' => "success"],
  'data' => [
    'departmentCount' => count($employeeNames),
    'employeeNames' => $employeeNames
  ]
];

echo json_encode($output);
mysqli_close($conn);
