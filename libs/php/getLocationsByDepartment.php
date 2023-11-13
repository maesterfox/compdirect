<?php

include("config.php");

$deptId = $_GET['deptId'];

$query = "SELECT location.id, location.name 
          FROM location 
          JOIN department ON location.id = department.location_id 
          WHERE department.id = ?";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $deptId);
$stmt->execute();
$result = $stmt->get_result();

$locations = [];
while ($row = $result->fetch_assoc()) {
    array_push($locations, $row);
}

echo json_encode(["data" => $locations]);

// Close connections
$stmt->close();
$conn->close();
