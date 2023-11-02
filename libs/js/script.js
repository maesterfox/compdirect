class AjaxHandler {
  constructor() {
    this.baseUrl = "libs/php/";
  }

  // Common AJAX method for making GET requests
  get(url, successCallback, errorCallback) {
    $.ajax({
      url: this.baseUrl + url,
      type: "GET",
      dataType: "JSON",
      success: successCallback,
      error: errorCallback,
    });
  }

  getData(url, data, successCallback, errorCallback) {
    $.ajax({
      url: this.baseUrl + url,
      type: "GET",
      data: data,
      dataType: "JSON",
      success: successCallback,
      error: errorCallback,
    });
  }

  // Common AJAX method for making POST requests
  post(url, data, successCallback, errorCallback) {
    $.ajax({
      url: this.baseUrl + url,
      type: "POST",
      data: data,
      success: successCallback,
      error: errorCallback,
    });
  }

  // Set the base URL for your API
  setBaseUrl(baseUrl) {
    this.baseUrl = baseUrl;
  }
}

// Toast
var toastElList = [].slice.call(document.querySelectorAll(".toast"));
var toastList = toastElList.map(function (toastEl) {
  return new bootstrap.Toast(toastEl);
});

function showToast(message, toastId = "myToast") {
  //console.log(`Showing toast with ID: ${toastId}, Message: ${message}`); // Debugging line
  $(`#${toastId} .toast-body`).text(message);
  $(`#${toastId}`).toast("show");
}

// Create an instance of the AjaxHandler class
const ajaxHandler = new AjaxHandler();

// Initial load functions

$(window).on("load", function () {
  getAll();
  getAllDepartments();
  populateDeptsTable(); // New function for departments
  fetchAllLocations();
});

// Document Ready Event Handlers and Initialization Block

$(document).ready(function () {
  // Employee search
  $("#employeeSearch").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    $("#employeeTable tr ").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });

  // Department Filter
  $("#employeeDeptFilter").on("change", function () {
    var value = $("#employeeDeptFilter option:selected").text().toLowerCase();
    $("#employeeTable tr").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });

  // Department Table Search
  $("#departmentSearch").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    $("#departmentTable tr").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });

  // Location Table Search
  $("#locationSearch").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    $("#locationTable tr").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });

  // Focus on first input field when the modal is shown for Person
  $("#insertNewEmployee").on("shown.bs.modal", function () {
    $(".modal-backdrop").remove(); // Remove backdrop
    $("#addFirstName").focus();
    // console.log("Modal is shown");
  });

  // Focus on first input field when the modal is shown for Department
  $("#insertNewDepartment").on("shown.bs.modal", function () {
    $(".modal-backdrop").remove(); // Remove backdrop
    $("#deptName").focus();
    // console.log("Modal is shown for Add Department");
  });

  // Focus on first input field when the modal is shown for Location
  $("#insertNewLocation").on("shown.bs.modal", function () {
    $(".modal-backdrop").remove(); // Remove backdrop
    $("#newLocName").focus();
    //console.log("Modal is shown for Add Location");
  });

  // Populate edit employee form
  $("#editPerson").on("shown.bs.modal", function () {
    $(".modal-backdrop").remove(); // Remove backdrop
    $("#editFirstName").focus();
  });

  // Remove backdrop and set focus when the modal is fully displayed
  $("#editDept2").on("shown.bs.modal", function () {
    $(".modal-backdrop").remove(); // Remove backdrop
    $("#editDeptName").focus(); // Set focus
    $("#editDeptConfirmToast").toast("hide");
  });

  // Remove backdrop and set focus when the modal is fully displayed
  $("#editLocation").on("shown.bs.modal", function () {
    $(".modal-backdrop").remove(); // Remove backdrop
    $("#editLocationName").focus(); // Set focus
    $("#editLocationConfirmToast").toast("hide");
  });

  $(document).ready(function () {
    // Listen for the 'shown' event on the department tab
    $("#pills-profile-tab").on("shown.bs.tab", function (e) {
      // Call the function to populate the departments table
      populateDeptsTable();
    });
  });

  $("#pills-contact-tab").on("shown.bs.tab", function (e) {
    // Call your fetchAllLocations function to reload the data
    fetchAllLocations();
  });
});

// Tables //

// Full employee Table
function getAll() {
  // Perform AJAX GET request to getAll.php
  ajaxHandler.get(
    "getAll.php",
    function (response) {
      // Map each employee member in the returned data to a table row
      const rows = response.data.map((employee) => {
        return `
        <tr>
          <td id="personName">
            <!-- TODO: Consider making these class names more semantic -->
            <div class='d-inline-flex w-75 overflow-auto'>${employee.firstName} ${employee.lastName}</div>
          </td>
          <td class="col-dep">
            <div class='d-inline-flex w-75 col-dep'>${employee.department}</div>
          </td>
          <td class="col-loc tableHide">
            <div class='d-inline-flex w-75 col-loc'>${employee.location}</div>
          </td>
          <td class="tableHide">
            <!-- TODO: Consider if hiding email on smaller screens is the best approach -->
            <div class='d-md-inline-flex'>${employee.email}</div>
          </td>
          <td>
            <!-- TODO: These buttons could be made into a reusable component -->
            <div class="d-flex">
              <button type="button" class="btn btn-primary editPersonBtn mx-auto" data-bs-toggle="modal" data-bs-target="#editPerson" data-id="${employee.id}" title="Edit">
                <i class="fa-solid fa-pen-to-square" style="color: #ffffff;"></i>
              </button>
              <button type="button" class="btn btn-danger deletePerson mx-auto" title="Delete">
                <i class="fa-solid fa-trash" style="color: #ffffff;"></i>
              </button>
            </div>
          </td>
          <!-- TODO: Consider whether storing additional data in hidden table cells is the best approach -->
          <td class="d-none">All Departments</td>
          <td class="d-none" id="personId">${employee.id}</td>
          <td class="d-none" id="deptId">${employee.departmentId}</td>
          <td class="d-none" id="jobTitleTest">${employee.jobTitle}</td>
        </tr>`;
      });

      // TODO: Consider adding a loading state while fetching data
      // Join all rows and update the table body only once
      $("#employeeTable").html(rows.join(""));
    },
    function (error) {
      // Show an error message in the table
      $("#employeeTable").html(`<tr><td colspan='8'>Error: ${error}</td></tr>`);

      // Log the error to the console for debugging
      console.log("Error:", error);
    }
  );
}

// Populate Departments Table
function groupEmployeesByDepartment(employees) {
  const departmentCounts = {};

  employees.forEach((employee) => {
    const deptId = employee.departmentId;
    departmentCounts[deptId] = (departmentCounts[deptId] || 0) + 1;
  });

  return departmentCounts;
}

function populateDeptsTable() {
  // First fetch all employees
  ajaxHandler.get(
    "getAll.php",
    function (employeeResponse) {
      // Group employees by department
      const departmentCounts = groupEmployeesByDepartment(
        employeeResponse.data
      );

      // Then fetch all departments
      ajaxHandler.get(
        "getAllDepartments.php",
        function (deptResponse) {
          const rows = [];
          if (deptResponse.data && Array.isArray(deptResponse.data)) {
            const sortedData = deptResponse.data.sort((a, b) =>
              a.name.localeCompare(b.name)
            );

            sortedData.forEach((department) => {
              const employeeCount = departmentCounts[department.id] || "0";
              rows.push(`
                <tr>
                  <td class="tableHide d-none">${department.id}</td>
                  <td>${department.name}</td>
                  <td>${department.location}</td>
                  <td>${employeeCount}</td> <!-- New column for employee count -->
                  <td>
                    <button class="btn btn-primary editDeptBtn" data-bs-toggle="modal" data-bs-target="#editDept2" data-id="${department.id}" title="Edit">
                      <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-danger deleteDeptBtn" data-id="${department.id}" title="Delete">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              `);
            });
          }

          // Update the table body only once
          $("#departmentTable").html(rows.join(""));
        },
        function (error) {
          $("#departmentTable").html(
            `<tr><td colspan='5'>Error fetching departments: ${error}</td></tr>`
          );
          console.log("Error:", error);
        }
      );
    },
    function (error) {
      $("#departmentTable").html(
        `<tr><td colspan='5'>Error fetching employees: ${error}</td></tr>`
      );
      console.log("Error:", error);
    }
  );
}

// Function to get all departments for dropdowns
function getAllDepartments() {
  // Perform AJAX GET request to getAllDepartments.php
  ajaxHandler.get(
    "getAllDepartments.php",
    function (response) {
      const options = [
        `<option value="getAll" selected>All Departments</option>`,
      ];
      // TODO: Consider adding a loading state while fetching data

      // Check if response data exists and is an array
      if (response.data && Array.isArray(response.data)) {
        // Sort data by department name
        const sortedData = response.data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        // Generate dropdown options
        sortedData.forEach((sec) => {
          options.push(`<option value=${sec.id}>${sec.name}</option>`);
        });

        // Update the dropdown options only once
        $(".departments").html(options.join(""));
      }
    },
    function (error) {
      $(".departments").html(
        '<option value="">Error fetching departments</option>'
      );
      console.log("Error:", error);
    }
  );
}

// Function to fetch all Locations
function fetchAllLocations() {
  // Perform AJAX GET request to fetchAllLocations.php
  ajaxHandler.get(
    "fetchAllLocations.php",
    function (response) {
      // Initialize options for location dropdown and rows for location table
      let options = [`<option value="getAll" selected>All Locations</option>`];
      let rows = [];
      // TODO: Consider adding a loading state while fetching data

      // Check if response data exists and is an array
      if (response.data && Array.isArray(response.data)) {
        // Populate options and rows based on received data
        response.data.forEach((loc) => {
          options.push(`<option value="${loc.id}">${loc.name}</option>`);

          // Generate table rows
          rows.push(`
            <tr>
              <!-- TODO: Consider if hiding the ID is the best approach -->
              <td class="d-none">${loc.id}</td>
              <td>${loc.name}</td>
              <td>${loc.departmentCount}</td> <!-- New column -->
              <td>${loc.employeeCount}</td> <!-- New column -->
              <td>
                <div class="d-flex">
                  <button type="button" class="btn btn-primary updateLocBtn mx-auto" data-bs-toggle="modal" data-bs-target="#editLocation" data-id="${loc.id}" title="Edit">
                    <i class="fa-solid fa-pen-to-square" style="color: #ffffff;"></i>
                  </button>
                  <button type="button" class="btn btn-danger deleteLocationBtn mx-auto" title="Delete" data-id="${loc.id}">
                    <i class="fa-solid fa-trash" style="color: #ffffff;"></i>
                  </button>
                </div>
              </td>
            </tr>
          `);
        });
        // TODO: Consider making buttons into reusable components

        // Update dropdown and table body only once to minimize DOM updates
        $(".locations").html(options.join(""));
        $("#locationTable").html(rows.join(""));

        // TODO: Evaluate the necessity of these attribute changes
        $('#insertNewEmployee select option[value="getAll"]').attr("value", "");
        $('#insertNewDepartment select option[value="getAll"]').attr(
          "value",
          ""
        );
        $('#insertNewLocation select option[value="getAll"]').attr("value", "");
      }
    },
    function (error) {
      $("#locationTable").html(
        `<tr><td colspan='5'>Error fetching locations: ${error}</td></tr>`
      );
      console.log("Error getting data:", error);
    }
  );
}

// Add Employees, Depts, Locations //

// Handle form submission for adding an employee
$("#addEmployee").submit(function (e) {
  e.preventDefault(); // Prevent default submit behavior

  // Serialize the form data
  var formData = $("#addEmployee").serialize();

  // TODO: Consider using const or let instead of var for modern JS practices

  // Convert serialized data to object
  var formDataObj = {};
  $.each(formData.split("&"), function (index, value) {
    var item = value.split("=");
    formDataObj[item[0]] = decodeURIComponent(item[1]);
  });

  // TODO: Validate the formDataObj to ensure it contains all required fields

  // Extract first name and last name from formDataObj
  const firstName = formDataObj["firstName"];
  const lastName = formDataObj["lastName"];

  // Use AjaxHandler class to make POST request
  ajaxHandler.post(
    "addEmployee.php", // URL
    formData, // Data
    function (response) {
      // Success callback
      // TODO: Check the response for any specific success indicators
      if (response) {
        $("#newemployeeResponse").html(
          `<div class='alert alert-success'>${firstName} ${lastName} has been added to the directory</div>`
        );

        // Close the employee modal after 2 seconds
        setTimeout(() => {
          $("#insertNewEmployee").modal("hide");
          $("#addEmployee")[0].reset(); // Clear the form
          $("#newemployeeResponse").empty(); // Clear the success message
          // TODO: Maybe refresh the department and location lists too?
        }, 2000);

        getAll(); // Reload the table
        $(".modal-backdrop").remove(); // Remove the backdrop
      }
    },
    function (error) {
      // Error callback
      $("#newemployeeResponse").html(
        `<div class='alert alert-danger'>Error adding employee member: ${error}</div>`
      );
    }
  );
});

// Handle form submission for adding a department
$("#addDepartment").submit(function (e) {
  e.preventDefault(); // Prevent default submit behavior

  // Serialize the form data
  const formData = $("#addDepartment").serialize();

  // TODO: Consider using const or let instead of var for modern JS practices

  // Convert serialized data to object
  let formDataObj = {};
  $.each(formData.split("&"), function (index, value) {
    const item = value.split("=");
    formDataObj[item[0]] = decodeURIComponent(item[1]);
  });

  // TODO: Validate the formDataObj to ensure it contains all required fields

  // Extract department name from formDataObj
  const deptName = formDataObj["name"];

  // Use AjaxHandler class to make POST request
  ajaxHandler.post(
    "insertDepartment.php", // URL
    formData, // Data
    function (response) {
      // Success callback
      // TODO: Check the response for any specific success indicators
      if (response) {
        $("#newDeptResponse").html(
          `<div class='alert alert-success'>${deptName} has been added as a new department</div>`
        );

        // Close the department modal after 2 seconds
        setTimeout(() => {
          $("#insertNewDepartment").modal("hide");
          $("#addDepartment")[0].reset(); // Clear the form
          $("#newDeptResponse").empty(); // Clear the success message
          // TODO: Maybe refresh the employee and location lists too?
        }, 2000);

        populateDeptsTable(); // Reload the department table
        getAllDepartments(); // Update all department dropdowns
        $(".modal-backdrop").remove(); // Remove the backdrop
      }
    },
    function () {
      // Error callback
      // TODO: Provide more informative error messages based on server response
      $("#newDeptResponse").html(
        "<div class='alert alert-danger'>Error adding department</div>"
      );
    }
  );
});

// Handle form submission for adding a location
$("#addLocation").submit(function (e) {
  e.preventDefault(); // Prevent default submit behavior

  // Serialize the form data
  const formData = $("#addLocation").serialize();

  // TODO: Consider using const or let instead of var for modern JS practices

  // Convert serialized data to object
  let formDataObj = {};
  $.each(formData.split("&"), function (index, value) {
    const item = value.split("=");
    formDataObj[item[0]] = decodeURIComponent(item[1]);
  });

  // TODO: Validate the formDataObj to ensure it contains all required fields

  // Extract location name from formDataObj
  const locName = formDataObj["name"];

  // Use AjaxHandler class to make POST request
  ajaxHandler.post(
    "addLocation.php", // URL
    formData, // Data
    function (response) {
      // Success callback
      // TODO: Check the response for any specific success indicators
      if (response) {
        $("#newLocResponse").html(
          `<div class='alert alert-success'>${locName} has been added as a new location</div>`
        );

        // Close the location modal after 2 seconds
        setTimeout(() => {
          $("#insertNewLocation").modal("hide");
          $("#addLocation")[0].reset(); // Clear the form
          $("#newLocResponse").empty(); // Clear the success message
          // TODO: Maybe refresh the employee and department lists too?
        }, 2000);

        fetchAllLocations(); // Reload the location table
        $(".modal-backdrop").remove(); // Remove the backdrop
      }
    },
    function () {
      // Error callback
      // TODO: Provide more informative error messages based on server response
      $("#newLocResponse").html(
        "<div class='alert alert-danger'>Error adding location</div>"
      );
    }
  );
});

// Edit Employees, Depts, Locations //

// Function to show edit employee confirmation toast
function showEditConfirmToast() {
  $("#editEmployeeConfirmToast").toast("show");
}

// Handle form submission for editing an employee
$("#editPersonForm").submit(function (e) {
  e.preventDefault();

  var personIDtoBeUpdate = $("#personId").val();
  const formData = $(this).serialize() + "&id=" + personIDtoBeUpdate;

  // Show the confirmation toast
  showEditConfirmToast();

  // Confirm the edit
  $("#confirmEditEmployee").on("click", function () {
    ajaxHandler.post(
      "editEmployee.php",
      formData,
      function (response) {
        if (response.status && Number(response.status.code) === 200) {
          $("#editEmployeeResponse").html(
            "<div class='alert alert-success'>Successfully Edited Employee</div>"
          );
          setTimeout(() => {
            $("#editPerson").modal("hide");
            $("#editPersonForm")[0].reset();
            $("#editEmployeeResponse").html(""); // Clear the message
          }, 2000); // keep the modal open for 2 more seconds

          getAll(); // Refresh the table
        } else {
          console.log("Error editing employee");
        }
      },
      function (error) {
        console.log("Error during form submission: ", error);
      }
    );
    $("#editEmployeeConfirmToast").toast("hide"); // Hide the toast
  });

  // Cancel the edit
  $("#cancelEditEmployee").on("click", function () {
    $("#editEmployeeConfirmToast").toast("hide"); // Hide the toast
  });

  return false;
});

// Populate data when the modal is shown
$("#editPerson").on("show.bs.modal", function (e) {
  const personID = $(e.relatedTarget).attr("data-id");

  ajaxHandler.post(
    "getPersonnelByID.php",
    { id: personID },
    function (result) {
      // console.log("Received data:", result);
      // console.log("Type of status code:", typeof result.status.code);

      if (Number(result.status.code) === 200) {
        const personnel = result.data.personnel[0];
        $("#personId").val(personnel.id);
        $("#editPersonForm input[name='firstName']").val(personnel.firstName);
        $("#editPersonForm input[name='lastName']").val(personnel.lastName);
        $("#editPersonForm input[name='jobTitle']").val(personnel.jobTitle);
        $("#editPersonForm input[name='email']").val(personnel.email);
        $("#editDept").val(personnel.departmentID);
      } else {
        console.log("Error populating data. Status code:", result.status.code);
      }
    },
    function () {
      console.log("Error fetching data.");
    }
  );
});

function showEditEmployeeConfirmation(confirmCallback) {
  //console.log("showEditEmployeeConfirmation called"); // Debugging

  // Show the toast
  $("#editEmployeeConfirmToast").toast("show");

  // Debugging: Check if the toast element exists in DOM
  console.log(
    "Does the toast element exist?",
    !!document.getElementById("editEmployeeConfirmToast")
  );

  // Attach click handlers after the toast is fully visible
  $("#editEmployeeConfirmToast").on("shown.bs.toast", function () {
    //console.log("Toast is now shown"); // Debugging

    // Remove any previous click handlers to avoid multiple triggers
    $("#confirmEditEmployee").off();
    $("#cancelEditEmployee").off();

    // Attach new click handlers
    $("#confirmEditEmployee").click(function () {
      //console.log("Confirm button clicked"); // Debugging
      confirmCallback();
      $("#editEmployeeConfirmToast").toast("hide");
    });

    $("#cancelEditEmployee").click(function () {
      //console.log("Cancel button clicked"); // Debugging
      $("#editEmployeeConfirmToast").toast("hide");
    });
  });
}

// Function to populate the Edit Department modal with current data
function populateEditDeptModal(departmentId) {
  // Validate departmentId
  if (!departmentId) {
    console.error("Department ID is not valid.");
    return;
  }

  ajaxHandler.post(
    "getDepartmentByID.php",
    { id: departmentId },
    function (result) {
      // Validate result object and its properties
      if (result && result.status && result.status.code && result.data) {
        if (result.status.code.toString() === "200") {
          $("#deptId").val(result.data[0].id);
          $("#editDeptName").val(result.data[0].name);
          $("#editDeptLocation").val(result.data[0].locationID);
        } else {
          console.error(
            "Error getting department data. resultCode is not 200."
          );
          // Optionally, display an error message on the modal
          $("#editDeptResponse").html(
            "<div class='alert alert-danger'>Failed to fetch department data.</div>"
          );
        }
      } else {
        console.error("Invalid response structure.");
        // Optionally, display an error message on the modal
        $("#editDeptResponse").html(
          "<div class='alert alert-danger'>Invalid response structure.</div>"
        );
      }
    },
    function (error) {
      console.error("Error fetching department data:", error);
      // Optionally, display an error message on the modal
      $("#editDeptResponse").html(
        `<div class='alert alert-danger'>Error fetching department data: ${error}</div>`
      );
    }
  );
}

// Function to show edit department confirmation toast
function showEditDeptConfirmation(confirmCallback) {
  //console.log("Inside showEditDeptConfirmation()");

  $("#editDeptConfirmToast").toast("show");

  $("#editDeptConfirmToast").on("shown.bs.toast", function () {
    $("#confirmEditDept").off();
    $("#cancelEditDept").off();

    // Attach new click handlers
    $("#confirmEditDept").click(function () {
      confirmCallback();
      $("#editDeptConfirmToast").toast("hide");
    });

    $("#cancelEditDept").click(function () {
      $("#editDeptConfirmToast").toast("hide");
    });
  });
}

// Handle form submission for editing a department
$("#editDeptForm").submit(function (e) {
  e.preventDefault();

  // Step 2: Define formData object right here
  const formData = {
    id: $("#deptId").val(),
    name: $("#editDeptName").val(),
    locationID: $("#editDeptLocation").val(),
  };

  //console.log("Handling form submission for editing a department.");
  //console.log("Form Data: ", formData);

  showEditDeptConfirmation(function () {
    //console.log("Inside confirmCallback");
    ajaxHandler.post(
      "editDept.php",
      formData,
      function (response) {
        console.log("Response from editDept.php: ", response);
        if (response.status && response.status.code === "200") {
          $("#editDeptResponse").html(
            "<div class='alert alert-success'>Successfully Edited Department</div>"
          );
          setTimeout(() => {
            $("#editDept2").modal("hide");
            $("#editDeptForm")[0].reset();
            $("#editDeptResponse").html("");
          }, 2000);
          getAllDepartments();
          populateDeptsTable(); // New function for departments
        } else {
          $("#editDeptResponse").html(
            "<div class='alert alert-danger'>Error editing department</div>"
          );
        }
      },
      function (error) {
        $("#editDeptResponse").html(
          "<div class='alert alert-danger'>Error editing department</div>"
        );
      }
    );
  });
  return false;
});

// Fetch data and populate the modal before it is shown
$("#editDept2").on("show.bs.modal", function (e) {
  const departmentId = $(e.relatedTarget).attr("data-id");
  populateEditDeptModal(departmentId);
});

// Fetch data and populate the modal before it is shown
$("#editLocation").on("show.bs.modal", function (e) {
  const idToBeFetched = $(e.relatedTarget).attr("data-id");

  ajaxHandler.post(
    "fetchLocID.php",
    { id: idToBeFetched },
    function (result) {
      console.group(result);
      const locationIDtoBeUpdate = result.data[0].id;
      const resultCode = result.status.code.toString();

      if (resultCode === "200") {
        $("#editLocationSelect").val(locationIDtoBeUpdate);
        $("#editLocationName").val(result.data[0].name);
      } else {
        console.log("Error getting data. resultCode is not 200.");
      }
    },
    function () {
      console.log("Error getting data.");
    }
  );
});

// Function to show edit location confirmation toast
function showEditLocationConfirmation(confirmCallback) {
  //console.log(confirmCallback);
  $("#editLocationConfirmToast").toast("show"); // Assuming your toast ID for location is 'editLocationConfirmToast'

  // Attach click handlers after the toast is fully visible
  $("#editLocationConfirmToast").on("shown.bs.toast", function () {
    $("#confirmEditLocation").off();
    $("#cancelEditLocation").off();

    // Attach new click handlers
    $("#confirmEditLocation").click(function () {
      confirmCallback();
      $("#editLocationConfirmToast").toast("hide");
    });

    $("#cancelEditLocation").click(function () {
      $("#editLocationConfirmToast").toast("hide");
    });
  });
}

// Handle form submission for editing a location
$("#editLocationForm").submit(function (e) {
  e.preventDefault();
  const formData =
    $(this).serialize() + "&id=" + $("#editLocationSelect").val();

  // Show confirmation toast
  showEditLocationConfirmation(function () {
    ajaxHandler.post(
      "editLocation.php",
      formData,
      function (response) {
        if (response.status && response.status.code === "200") {
          $("#editLocResponse").html(
            "<div class='alert alert-success'>Location Updated</div>"
          );
          setTimeout(() => {
            $("#editLocation").modal("hide");
            $("#editLocationForm")[0].reset();
            $("#editLocResponse").html(""); // Clear the message
          }, 2000); // keep the modal open for 2 more seconds
          fetchAllLocations(); // Refresh the table data
        } else {
          $("#editLocResponse").html(
            "<div class='alert alert-danger'>Error editing location</div>"
          );
        }
      },
      function (error) {
        $("#editLocResponse").html(
          "<div class='alert alert-danger'>Error editing location</div>"
        );
      }
    );
  });
  return false;
});

// Remove Employees, Depts, Locations //

// Remove Employees
// Initialize global variables to hold the person ID and name to be deleted
let personIDtoBeDelete;
let personName;

// TODO: Consider encapsulating these globals into an object or a closure for better structure

$(document).on("click", ".deletePerson", function (e) {
  e.preventDefault();
  personIDtoBeDelete = $(this).closest("tr").find("#personId").text();
  let person = $(this).closest("tr").find("td");
  personName = $(person).eq(0).text();

  // Update the toast body and show it
  $("#confirmEmployeeDelete .toast-body").text(
    `Are you sure you want to delete ${personName}?`
  );
  $("#confirmEmployeeDelete").toast("show");
});

// TODO: Maybe refactor this into its own function for reusability

// Function specifically for showing success toast
function showSuccessToast(message) {
  $("#successToast .toast-body").text(message);
  $("#successToast").toast("show");
}

// TODO: Consider creating a function for showing error toasts for uniformity

// Confirm the deletion
$("#confirmDelete").on("click", function () {
  // Use the AjaxHandler to perform the POST request
  ajaxHandler.post(
    "removeEmployee.php",
    { id: personIDtoBeDelete },
    function (response) {
      // Check the response status more thoroughly for extra safety
      if (response.status && response.status.code === "200") {
        showSuccessToast(`${personName} has been removed.`);
        getAll(); // Refresh the table data
      }
    },
    function () {
      // Improve this error message to be more informative
      showToast("Error deleting employee.");
    }
  );

  // Manually hide the confirmation toast
  $("#confirmEmployeeDelete").toast("hide");
});

// Cancel the deletion
$("#cancelDelete").on("click", function () {
  // Manually hide the confirmation toast
  $("#confirmEmployeeDelete").toast("hide");
});

// TODO: Maybe add a function to reset the global variables after use

// Delete Department with Toast
// Declare global variables for department ID and name
let departmentIdToBeDeleted;
let departmentName;

// TODO: Consider encapsulating these globals into an object or a closure for better structure

$(document).on("click", ".deleteDeptBtn", function (e) {
  e.preventDefault();
  departmentIdToBeDeleted = $(this).data("id");
  let department = $(this).closest("tr").find("td");
  departmentName = $(department).eq(1).text();

  // Update the toast body and show it
  $("#confirmDeptDelete .toast-body").text(
    `Are you sure you want to delete ${departmentName}?`
  );
  $("#confirmDeptDelete").toast("show");
});

// TODO: Maybe refactor this into its own function for reusability

// Confirm the deletion of the department
$("#confirmDeptDeleteButton").on("click", function () {
  // Hide the confirmation toast immediately
  $("#confirmDeptDelete").toast("hide");

  // TODO: Add a loading indicator here for better user experience

  // First, check for dependencies via your PHP script
  ajaxHandler.post(
    "deleteDept.php",
    { id: departmentIdToBeDeleted },
    function (response) {
      // TODO: Validate the response more thoroughly
      let deptNum = response.data[0].departmentCount;
      if (response.status.code === "200" && deptNum === 0) {
        // Now, proceed with deletion
        ajaxHandler.post(
          "deleteDepartmentByID.php",
          { id: departmentIdToBeDeleted },
          function (response) {
            // TODO: Validate the response more thoroughly
            if (response.status.code === "200") {
              showSuccessToast(`${departmentName} has been removed.`);
              populateDeptsTable(); // Reload the table
              getAllDepartments(); // Update department dropdowns if necessary
            } else {
              // TODO: Improve this error message to be more informative
              showToast("Error deleting department.", "red");
            }
          },
          function () {
            showToast("Error deleting department.", "red");
          }
        );
      } else {
        showToast(
          `${departmentName} cannot be removed due to dependent employees. ${deptNum} in total.`,
          "red"
        );
      }
    },
    function () {
      showToast("Error fetching department details.", "red");
    }
  );
});

// Cancel the department deletion
$("#cancelDeptDelete").on("click", function () {
  $("#confirmDeptDelete").toast("hide");
});

// TODO: Maybe add a function to reset the global variables after use

// Remove a location
// Declare global variables for location ID and name
let locationIdToBeDeleted;
let locationName;

// TODO: Consider encapsulating these global variables into an object or a closure for better code organization.

// Function to delete a Location by ID
$(document).on("click", ".deleteLocationBtn", function (e) {
  e.preventDefault();
  locationIdToBeDeleted = parseInt($(this).attr("data-id")); // Convert to integer
  let location = $(this).closest("tr").find("td");
  locationName = $(location).eq(1).text(); // Update the global variable

  // Update the toast body and show it
  $("#confirmLocationDelete .toast-body").text(
    `Are you sure you want to delete ${locationName}?`
  );
  $("#confirmLocationDelete").toast("show");
});

// TODO: Consider refactoring the above into its own function for reusability.

// Confirm the deletion of the location
$("#confirmLocationDeleteButton").on("click", function () {
  // Hide the confirmation toast immediately
  $("#confirmLocationDelete").toast("hide");

  // TODO: Add a loading indicator here for a better user experience.

  // First, check for dependencies via your PHP script
  ajaxHandler.post(
    "removeLocation.php",
    { id: locationIdToBeDeleted },
    function (response) {
      // TODO: Validate the response more thoroughly.
      let locNum = response.data[0].locNum;
      if (response.status.code === "200" && locNum === 0) {
        // Now, proceed with deletion
        ajaxHandler.post(
          "removeLocationByID.php",
          { id: locationIdToBeDeleted },
          function (response) {
            // TODO: Validate the response more thoroughly.
            if (response.status.code === "200") {
              showSuccessToast(`${locationName} has been removed.`);
              fetchAllLocations(); // Refresh the table
            } else {
              // TODO: Make this error message more informative based on server's response.
              showToast("Error deleting location.", "red");
            }
          },
          function () {
            showToast("Error deleting location.", "red");
          }
        );
      } else {
        showToast(
          `${locationName} cannot be removed due to dependent departments.`,
          "red"
        );
      }
    },
    function () {
      showToast("Error fetching location details.", "red");
    }
  );
});

// Cancel the deletion of the location
$("#cancelLocationDelete").on("click", function () {
  $("#confirmLocationDelete").toast("hide");
});

// TODO: Consider adding a function to reset the global variables after use.

// Function to show toast with color and autohide after a specific delay
function showToast(message, color, delay = 2000) {
  // Add delay parameter with default value
  $("#myToast .toast-body").text(message);
  $("#myToast").removeClass("toast-red toast-green").addClass(`toast-${color}`);
  // Show toast with autohide and delay options
  $("#myToast").toast({ autohide: true, delay: delay }).toast("show");
}

// PRELOADER //

// $(window).on("load", function () {
//   if ($("#preloader").length) {
//     $("#preloader")
//       .delay(2000)
//       .fadeOut("slow", function () {
//         $(this).remove();
//       });
//   }
// });
