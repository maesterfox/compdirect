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
// Updated SQL query to count the number of employees in a department
$query = $conn->prepare('SELECT d.name AS departmentName, COUNT(p.id) as personnelCount 
FROM department d 
LEFT JOIN personnel p ON (p.departmentID = d.id) 
WHERE d.id = ?');

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


$row = mysqli_fetch_assoc($result);

$output = [
  'status' => ['code' => "200", 'name' => "ok", 'description' => "success"],
  'data' => [
    'departmentName' => $row['departmentName'],
    'personnelCount' => $row['personnelCount']
  ]
];

echo json_encode($output);
mysqli_close($conn);
