///////////////// PRELOADER //////////////

// $(window).on("load", function () {
//   if ($("#preloader").length) {
//     $("#preloader")
//       .delay(1000)
//       .fadeOut("slow", function () {
//         $(this).remove();
//       });
//   }
// });

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
  console.log(`Showing toast with ID: ${toastId}, Message: ${message}`); // Debugging line
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
  // Staff search
  $("#staffSearch").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    $("#staffTable tr ").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });

  // Department Filter
  $("#staffDeptFilter").on("change", function () {
    var value = $("#staffDeptFilter option:selected").text().toLowerCase();
    $("#staffTable tr").filter(function () {
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
  $("#insertNewPerson").on("shown.bs.modal", function () {
    $(".modal-backdrop").remove(); // Remove backdrop
    $("#addFirstName").focus();
    console.log("Modal is shown");
  });

  // Focus on first input field when the modal is shown for Department
  $("#insertNewDepartment").on("shown.bs.modal", function () {
    $(".modal-backdrop").remove(); // Remove backdrop
    $("#deptName").focus();
    console.log("Modal is shown for Add Department");
  });

  // Focus on first input field when the modal is shown for Location
  $("#insertNewLocation").on("shown.bs.modal", function () {
    $(".modal-backdrop").remove(); // Remove backdrop
    $("#newLocName").focus();
    console.log("Modal is shown for Add Location");
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

  $("#pills-contact-tab").on("shown.bs.tab", function (e) {
    // Call your fetchAllLocations function to reload the data
    fetchAllLocations();
  });
});

// Tables //

// Full Staff Table

function getAll() {
  ajaxHandler.get(
    "getAll.php",
    function (response) {
      const rows = response.data.map((staff) => {
        return `
        <tr>
          <td id="personName">
            <div class='d-inline-flex w-75 overflow-auto'>${staff.firstName} ${staff.lastName}</div>
          </td>
          <td class="col-dep">
            <div class='d-inline-flex w-75 col-dep'>${staff.department}</div>
          </td>
          <td class="col-loc tableHide">
            <div class='d-inline-flex w-75 col-loc'>${staff.location}</div>
          </td>
          <td class="tableHide">
            <div class='d-md-inline-flex'>${staff.email}</div>
          </td>
          <td>
            <div class="d-flex">
              <button type="button" class="btn btn-primary editPersonBtn mx-auto" data-bs-toggle="modal" data-bs-target="#editPerson" data-id="${staff.id}" title="Edit">
                <i class="fa-solid fa-pen-to-square" style="color: #ffffff;"></i>
              </button>
              <button type="button" class="btn btn-danger deletePerson mx-auto" title="Delete">
                <i class="fa-solid fa-trash" style="color: #ffffff;"></i>
              </button>
            </div>
          </td>
          <td class="d-none">All Departments</td>
          <td class="d-none" id="personId">${staff.id}</td>
          <td class="d-none" id="deptId">${staff.departmentId}</td>
          <td class="d-none" id="jobTitleTest">${staff.jobTitle}</td>
        </tr>`;
      });

      // Join all rows and update the table body only once
      $("#staffTable").html(rows.join(""));
    },
    function (error) {
      console.log("Error:", error);
    }
  );
}

// Departments Table

function populateDeptsTable() {
  ajaxHandler.get(
    "getAllDepartments.php",
    function (response) {
      const rows = [];

      if (response.data && Array.isArray(response.data)) {
        const sortedData = response.data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        sortedData.forEach((department) => {
          rows.push(`
          <tr>
            <td class="tableHide d-none">${department.id}</td>
            <td>${department.name}</td>
            <td>${department.location}</td>
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

        $("#departmentTable").html(rows.join(""));
      }
    },
    function (error) {
      console.log("Error:", error);
    }
  );
}

function getAllDepartments() {
  ajaxHandler.get(
    "getAllDepartments.php",
    function (response) {
      const options = [
        `<option value="getAll" selected>All Departments</option>`,
      ];

      if (response.data && Array.isArray(response.data)) {
        const sortedData = response.data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        sortedData.forEach((sec) => {
          options.push(`<option value=${sec.id}>${sec.name}</option>`);
        });

        $(".departments").html(options.join(""));
      }
    },
    function (error) {
      console.log("Error:", error);
    }
  );
}

// Locations Table

function fetchAllLocations() {
  ajaxHandler.get(
    "fetchAllLocations.php",
    function (response) {
      let options = [`<option value="getAll" selected>All Locations</option>`];
      let rows = [];

      if (response.data && Array.isArray(response.data)) {
        response.data.forEach((loc) => {
          options.push(`<option value="${loc.id}">${loc.name}</option>`);

          rows.push(`
          <tr>
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

        $(".locations").html(options.join(""));
        $("#locationTable").html(rows.join(""));

        $('#insertNewPerson select option[value="getAll"]').attr("value", "");
        $('#insertNewDepartment select option[value="getAll"]').attr(
          "value",
          ""
        );
        $('#insertNewLocation select option[value="getAll"]').attr("value", "");
      }
    },
    function () {
      console.log("Error getting data.");
    }
  );
}

// Add Employees, Depts, Locations //

// Handle form submission for adding an employee
$("#addPerson").submit(function (e) {
  e.preventDefault(); // Prevent default submit behavior

  // Serialize the form data
  var formData = $("#addPerson").serialize();

  // Convert serialized data to object
  var formDataObj = {};
  $.each(formData.split("&"), function (index, value) {
    var item = value.split("=");
    formDataObj[item[0]] = decodeURIComponent(item[1]);
  });

  // Extract first name and last name from formDataObj
  var firstName = formDataObj["firstName"];
  var lastName = formDataObj["lastName"];

  // Use AjaxHandler class to make POST request
  ajaxHandler.post(
    "addEmployee.php", // URL
    formData, // Data
    function (response) {
      // Success callback
      if (response) {
        $("#newStaffResponse").html(
          `<div class='alert alert-success'>${firstName} ${lastName} has been added to the directory</div>`
        );

        // Close the employee modal after 2 seconds
        setTimeout(() => {
          $("#insertNewPerson").modal("hide");
          $("#addPerson")[0].reset(); // Clear the form
          $("#newStaffResponse").empty(); // Clear the success message
        }, 2000);

        getAll(); // Reload the table
        $(".modal-backdrop").remove(); // Remove the backdrop
      }
    },
    function () {
      // Error callback
      $("#newStaffResponse").html(
        "<div class='alert alert-danger'>Error adding staff member</div>"
      );
    }
  );
});

// Handle form submission for adding a department
$("#addDepartment").submit(function (e) {
  e.preventDefault(); // Prevent default submit behavior

  // Serialize the form data
  var formData = $("#addDepartment").serialize();

  // Convert serialized data to object
  var formDataObj = {};
  $.each(formData.split("&"), function (index, value) {
    var item = value.split("=");
    formDataObj[item[0]] = decodeURIComponent(item[1]);
  });

  // Extract department name from formDataObj
  var deptName = formDataObj["name"];

  // Use AjaxHandler class to make POST request
  ajaxHandler.post(
    "insertDepartment.php", // URL
    formData, // Data
    function (response) {
      // Success callback
      if (response) {
        $("#newDeptResponse").html(
          `<div class='alert alert-success'>${deptName} has been added as a new department</div>`
        );

        // Close the department modal after 2 seconds
        setTimeout(() => {
          $("#insertNewDepartment").modal("hide");
          $("#addDepartment")[0].reset(); // Clear the form
          $("#newDeptResponse").empty(); // Clear the success message
        }, 2000);

        populateDeptsTable(); // Reload the table
        $(".modal-backdrop").remove(); // Remove the backdrop
      }
    },
    function () {
      // Error callback
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
  var formData = $("#addLocation").serialize();

  // Convert serialized data to object
  var formDataObj = {};
  $.each(formData.split("&"), function (index, value) {
    var item = value.split("=");
    formDataObj[item[0]] = decodeURIComponent(item[1]);
  });

  // Extract location name from formDataObj
  var locName = formDataObj["name"];

  // Use AjaxHandler class to make POST request
  ajaxHandler.post(
    "addLocation.php", // URL
    formData, // Data
    function (response) {
      // Success callback
      if (response) {
        $("#newLocResponse").html(
          `<div class='alert alert-success'>${locName} has been added as a new location</div>`
        );

        // Close the location modal after 2 seconds
        setTimeout(() => {
          $("#insertNewLocation").modal("hide");
          $("#addLocation")[0].reset(); // Clear the form
          $("#newLocResponse").empty(); // Clear the success message
        }, 2000);

        fetchAllLocations(); // Reload the table
        $(".modal-backdrop").remove(); // Remove the backdrop
      }
    },
    function () {
      // Error callback
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
          $("#editStaffResponse").html(
            "<div class='alert alert-success'>Successfully Edited Employee</div>"
          );
          setTimeout(() => {
            $("#editPerson").modal("hide");
            $("#editPersonForm")[0].reset();
            $("#editStaffResponse").html(""); // Clear the message
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
      console.log("Received data:", result);
      console.log("Type of status code:", typeof result.status.code);

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
  console.log("showEditEmployeeConfirmation called"); // Debugging

  // Show the toast
  $("#editEmployeeConfirmToast").toast("show");

  // Debugging: Check if the toast element exists in DOM
  console.log(
    "Does the toast element exist?",
    !!document.getElementById("editEmployeeConfirmToast")
  );

  // Attach click handlers after the toast is fully visible
  $("#editEmployeeConfirmToast").on("shown.bs.toast", function () {
    console.log("Toast is now shown"); // Debugging

    // Remove any previous click handlers to avoid multiple triggers
    $("#confirmEditEmployee").off();
    $("#cancelEditEmployee").off();

    // Attach new click handlers
    $("#confirmEditEmployee").click(function () {
      console.log("Confirm button clicked"); // Debugging
      confirmCallback();
      $("#editEmployeeConfirmToast").toast("hide");
    });

    $("#cancelEditEmployee").click(function () {
      console.log("Cancel button clicked"); // Debugging
      $("#editEmployeeConfirmToast").toast("hide");
    });
  });
}

// Function to populate the Edit Department modal with current data
function populateEditDeptModal(departmentId) {
  console.log("Populating Edit Department Modal for ID: ", departmentId);
  ajaxHandler.post(
    "getDepartmentByID.php",
    { id: departmentId },
    function (result) {
      if (result.status.code.toString() === "200") {
        $("#deptId").val(result.data[0].id);
        console.log("Populated deptId: ", $("#deptId").val());
        $("#editDeptName").val(result.data[0].name);
        $("#editDeptLocation").val(result.data[0].locationID);
      } else {
        console.log("Error getting department data. resultCode is not 200.");
      }
    },
    function () {
      console.log("Error fetching department data.");
    }
  );
}

// Function to show edit department confirmation toast
function showEditDeptConfirmation(confirmCallback) {
  console.log("Inside showEditDeptConfirmation()");

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

  console.log("Handling form submission for editing a department.");
  console.log("Form Data: ", formData);

  showEditDeptConfirmation(function () {
    console.log("Inside confirmCallback");
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
  console.log(confirmCallback);
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
// Initialize global variable to hold the person ID to be deleted
let personIDtoBeDelete;
let personName;

// Remove Employees
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

// Function specifically for showing success toast
function showSuccessToast(message) {
  // console.log(`Showing success toast with Message: ${message}`); // Debugging line
  $("#successToast .toast-body").text(message);
  $("#successToast").toast("show");
}

// Confirm the deletion
$("#confirmDelete").on("click", function () {
  // Use the AjaxHandler to perform the POST request
  ajaxHandler.post(
    "removeEmployee.php",
    { id: personIDtoBeDelete },
    function (response) {
      if (response.status && response.status.code === "200") {
        showSuccessToast(`${personName} has been removed.`);
        setTimeout(() => {
          $("#confirmEmployeeDelete").toast("hide");
        }); // keep the toast open for 2 more seconds
        getAll(); // Refresh the table data
      }
    },
    function () {
      showToast("Error deleting employee.");
    }
  );
});

// Cancel the deletion
$("#cancelDelete").on("click", function () {
  $("#confirmEmployeeDelete").toast("hide"); // Hide the toast
});

// Delete Department with Toast
let departmentIdToBeDeleted;
let departmentName; // Declare as a global variable

$(document).on("click", ".deleteDeptBtn", function (e) {
  e.preventDefault();
  departmentIdToBeDeleted = $(this).data("id");
  let department = $(this).closest("tr").find("td");
  departmentName = $(department).eq(1).text(); // Update the global variable

  // Update the toast body and show it
  $("#confirmDeptDelete .toast-body").text(
    `Are you sure you want to delete ${departmentName}?`
  );
  $("#confirmDeptDelete").toast("show");
});

// Confirm the deletion of the department
$("#confirmDeptDeleteButton").on("click", function () {
  // Hide the confirmation toast immediately
  $("#confirmDeptDelete").toast("hide");

  // First, check for dependencies via your PHP script
  ajaxHandler.post(
    "deleteDept.php",
    { id: departmentIdToBeDeleted },
    function (response) {
      let deptNum = response.data[0].departmentCount;
      if (response.status.code === "200" && deptNum === 0) {
        // Now, proceed with deletion
        ajaxHandler.post(
          "deleteDepartmentByID.php",
          { id: departmentIdToBeDeleted },
          function (response) {
            if (response.status.code === "200") {
              showSuccessToast(`${departmentName} has been removed.`);
              populateDeptsTable();
            } else {
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

// Remove a location
let locationIdToBeDeleted;
let locationName; // Declare as global variable

// Function to delete a Location by ID
$(document).on("click", ".deleteLocationBtn", function (e) {
  e.preventDefault();
  locationIdToBeDeleted = parseInt($(this).attr("data-id"));
  let location = $(this).closest("tr").find("td");
  locationName = $(location).eq(1).text(); // Update the global variable

  // Update the toast body and show it
  $("#confirmLocationDelete .toast-body").text(
    `Are you sure you want to delete ${locationName}?`
  );
  $("#confirmLocationDelete").toast("show");
});

// Confirm the deletion of the location
$("#confirmLocationDeleteButton").on("click", function () {
  // Hide the confirmation toast immediately
  $("#confirmLocationDelete").toast("hide");

  // First, check for dependencies via your PHP script
  ajaxHandler.post(
    "removeLocation.php",
    { id: locationIdToBeDeleted },
    function (response) {
      let locNum = response.data[0].locNum;
      if (response.status.code === "200" && locNum === 0) {
        // Now, proceed with deletion
        ajaxHandler.post(
          "removeLocationByID.php",
          { id: locationIdToBeDeleted },
          function (response) {
            if (response.status.code === "200") {
              showSuccessToast(`${locationName} has been removed.`);
              fetchAllLocations();
            } else {
              showToast("Error deleting location.", "red");
            }
          },
          function () {
            showToast("Error deleting location.", "red");
          }
        );
      } else {
        showToast(
          `${locationName} cannot be removed due to dependent departments. ${locNum} in total.`,
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

// Function to show toast with color
function showToast(message, color) {
  $("#myToast .toast-body").text(message);
  $("#myToast").removeClass("toast-red toast-green").addClass(`toast-${color}`);
  $("#myToast").toast("show");
}
