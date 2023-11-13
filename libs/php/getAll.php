<?php

$executionStartTime = microtime(true);

include("config.php");

header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
	echo json_encode([
		'status' => [
			'code' => '400',
			'name' => 'failure',
			'description' => 'Database connection failed: ' . mysqli_connect_error(),
			'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . " ms"
		],
		'data' => []
	]);
	exit;
}

$query = 'SELECT p.id, p.lastName, p.firstName, p.jobTitle, p.email, d.name as department, d.id as departmentId, l.name as location FROM personnel p LEFT JOIN department d ON (d.id = p.departmentID) LEFT JOIN location l ON (l.id = d.locationID)';

$whereClauses = [];

if (isset($_GET['departmentId']) && $_GET['departmentId'] != 'all') {
	$whereClauses[] = 'p.departmentID = ' . $conn->real_escape_string($_GET['departmentId']);
}

if (isset($_GET['locationId']) && $_GET['locationId'] != 'all') {
	$whereClauses[] = 'd.locationID = ' . $conn->real_escape_string($_GET['locationId']);
}

if (!empty($whereClauses)) {
	$query .= ' WHERE ' . implode(' AND ', $whereClauses);
}

$query .= ' ORDER BY p.lastName, p.firstName, d.name, l.name';

$result = $conn->query($query);

if (!$result) {
	echo json_encode([
		'status' => [
			'code' => '500',
			'name' => 'executed',
			'description' => 'Query failed: ' . $conn->error,
			'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . " ms"
		],
		'data' => []
	]);
	$conn->close();
	exit;
}

$data = [];

while ($row = mysqli_fetch_assoc($result)) {
	array_push($data, $row);
}

$output = [
	'status' => [
		'code' => '200',
		'name' => 'ok',
		'description' => 'success',
		'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . " ms"
	],
	'data' => $data
];

$conn->close();

echo json_encode($output);
