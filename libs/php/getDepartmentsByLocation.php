<?php

include("config.php");

$locId = $_GET['locId'];

$query = "SELECT department.id, department.name 
          FROM department 
          JOIN location ON department.location_id = location.id 
          WHERE location.id = ?";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $locId);
$stmt->execute();
$result = $stmt->get_result();

$departments = [];
while ($row = $result->fetch_assoc()) {
    array_push($departments, $row);
}

echo json_encode(["data" => $departments]);

// Close connections
$stmt->close();
$conn->close();
