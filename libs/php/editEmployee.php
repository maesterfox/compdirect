<?php

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	include("config.php");

	$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

	if (mysqli_connect_errno()) {
		
		$output['status']['code'] = "300";
		$output['status']['name'] = "failure";
		$output['status']['description'] = "database unavailable";
		$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
		$output['data'] = [];
		
		mysqli_close($conn);

		echo json_encode($output); 

		exit;

	}

	$_POST['firstName'] = trim($_POST['firstName']);
	$_POST['firstName'] = preg_replace('# {2,}#', ' ', $_POST['firstName']);
	$_POST['firstName'] = strtolower($_POST['firstName']);
	$_POST['firstName'] = ucfirst($_POST['firstName']);


	$_POST['lastName'] = trim($_POST['lastName']);
	$_POST['lastName'] = preg_replace('# {2,}#', ' ', $_POST['lastName']);
	$_POST['lastName'] = strtolower($_POST['lastName']);
	$_POST['lastName'] = ucfirst($_POST['lastName']);


	$_POST['jobTitle'] = trim($_POST['jobTitle']);
	$_POST['jobTitle'] = preg_replace('# {2,}#', ' ', $_POST['jobTitle']);
	$_POST['jobTitle'] = strtolower($_POST['jobTitle']);
	$_POST['jobTitle'] = ucfirst($_POST['jobTitle']);


	$_POST['email'] = trim($_POST['email']);
	$_POST['email'] = preg_replace('# {2,}#', ' ', $_POST['email']);


    $query = 'UPDATE personnel SET firstName = "' . $_POST['firstName'] . '", lastName = "' . $_POST['lastName'] . '", jobTitle = "' . $_POST['jobTitle'] . '", email = "' . $_POST['email'] . '", departmentID = "' . $_POST['departmentID'] . '" WHERE id = ' . $_POST['id'];
	
         
	$result = $conn->query($query);
	
	if (!$result) {

		$output['status']['code'] = "400";
		$output['status']['name'] = "executed";
		$output['status']['description'] = "query failed";	
		$output['data'] = [];

		mysqli_close($conn);

		echo json_encode($output); 

		exit;

	}
   

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = [];

	header('Content-Type: application/json; charset=UTF-8');
	
	mysqli_close($conn);

	echo json_encode($output);
