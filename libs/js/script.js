// PRELOADER

$(window).on("load", function () {
  if ($("#loader").length) {
    // Gradually reduce opacity to 0
    $("#loader").css("opacity", 0);

    // After the opacity transition, remove the loader from the DOM
    setTimeout(function () {
      $("#loader").remove();
    }, 4000); // Adjust the delay (in milliseconds) as needed
  }
});

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

// Function to show success modal
function showSuccessModal(message) {
  $("#successModalBody").html(message);
  $("#successModal").modal("show");
}

// Function to show error modal
function showErrorModal(message) {
  $("#errorModalBody").html(message);
  $("#errorModal").modal("show");
}

// Function to show toast without autohide
function showToast(message, color, toastId = "myToast") {
  $(`#${toastId} .toast-body`).text(message);
  $(`#${toastId}`)
    .removeClass("toast-red toast-green")
    .addClass(`toast-${color}`);
  $(`#${toastId}`).toast({ autohide: false }).toast("show");
}

// Toast Initialization with autohide set to false
var toastElList = [].slice.call(document.querySelectorAll(".toast"));
var toastList = toastElList.map(function (toastEl) {
  return new bootstrap.Toast(toastEl, { autohide: false });
});

// Function to show toast with color without autohide
function showToast(message, color) {
  $("#myToast .toast-body").text(message);
  $("#myToast").removeClass("toast-red toast-green").addClass(`toast-${color}`);
  // Show toast without autohide
  $("#myToast").toast({ autohide: false }).toast("show");
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

$(document).ready(function () {
  // Unified search for tables
  $("#universalSearch").on("keyup", function () {
    const value = $(this).val().toLowerCase();
    const activeTab = $(".nav-link.active").attr("id");
    const tableMap = {
      "pills-home-tab": "#employeeTable tr",
      "pills-profile-tab": "#departmentTable tr",
      "pills-contact-tab": "#locationTable tr",
    };
    $(tableMap[activeTab]).filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });

  // Refresh Button Click Event
  $("#refreshBtn").click(function () {
    const activeTab = $(".nav-link.active").attr("id");
    const refreshMap = {
      "pills-home-tab": getAll,
      "pills-profile-tab": populateDeptsTable,
      "pills-contact-tab": fetchAllLocations,
    };
    if (refreshMap[activeTab]) refreshMap[activeTab]();
  });

  $("#addBtn").click(function () {
    const activeTab = $(".nav-link.active").attr("id");
    const modalMap = {
      "pills-home-tab": "insertNewEmployee",
      "pills-profile-tab": "insertNewDepartment",
      "pills-contact-tab": "insertNewLocation",
    };
    if (modalMap[activeTab]) {
      new bootstrap.Modal(document.getElementById(modalMap[activeTab])).show();
    }
  });

  // Modal shown events
  $(".modal").on("shown.bs.modal", function () {
    const focusMap = {
      insertNewEmployee: "#addFirstName",
      insertNewDepartment: "#deptName",
      insertNewLocation: "#newLocName",
      editPerson: "#editFirstName",
      editDept2: "#editDeptName",
      editLocation: "#editLocationName",
    };
    $(focusMap[this.id]).focus();
    $(document.body).removeClass("modal-open"); // Remove the modal-open class from the body
  });

  $(".modal").on("hidden.bs.modal", function () {
    const resetMap = {
      insertNewEmployee: function () {
        $("#addEmployee").trigger("reset");
        $("#newemployeeResponse").empty();
      },
      insertNewDepartment: function () {
        $("#addDepartment").trigger("reset");
        $("#newDeptResponse").empty();
        populateLocationDropdownForAddDept();
      },
      insertNewLocation: function () {
        $("#addLocation").trigger("reset");
        $("#newLocResponse").empty();
      },
    };

    if (resetMap[this.id]) resetMap[this.id]();
  });

  // Tab change event for filter button visibility and data loading
  $(".nav-link").on("click", function () {
    toggleFilterButtonVisibility();
    const tabFunctionMap = {
      "pills-home-tab": getAll,
      "pills-profile-tab": populateDeptsTable,
      "pills-contact-tab": fetchAllLocations,
    };
    const activeTab = $(this).attr("id");
    if (tabFunctionMap[activeTab]) tabFunctionMap[activeTab]();
  });

  // Filter Button Click Handlers
  $("#filterBtn").click(showFilterModal);
  $("#locationsFilterBtn").click(showLocationsFilterModal);

  // Apply filter logic
  $("#applyLocationsFilter").click(applyLocationsFilter);
  $("#departmentFilter").on("change", handleDepartmentFilterChange);
});

// Helper functions
function toggleFilterButtonVisibility() {
  const activeTab = $(".nav-link.active").attr("id");
  $("#filterBtn").toggleClass("d-none", activeTab === "pills-contact-tab");
  $("#locationsFilterBtn").toggleClass(
    "d-none",
    activeTab !== "pills-contact-tab"
  );
}

function showFilterModal() {
  populateFilterDropdowns();
  $("#filterModal").modal("show");
}

function showLocationsFilterModal() {
  populateLocationsFilterDropdown();
  $("#locationsFilterModal").modal("show");
}

function applyLocationsFilter() {
  const selectedLoc = $("#locationsFilterSelect").val();
  fetchAllLocations(selectedLoc);
  $("#locationsFilterModal").modal("hide");
}

function handleDepartmentFilterChange() {
  const selectedDept = $(this).val();
  if (selectedDept !== "all") {
    filterLocationsByDepartment(selectedDept);
  } else {
    populateFilterDropdowns();
  }
}

// Function implementations for fetchAllLocations, populateDeptsTable, getAll, etc.

function filterLocationsTable(selectedLoc) {
  // console.log(selectedLoc);
  // Check if a specific location is selected
  if (selectedLoc !== "all") {
    // Filter the location table based on the selected location
    $("#locationTable tr").filter(function () {
      $(this).toggle(
        $(this).text().toLowerCase().indexOf(selectedLoc.toLowerCase()) > -1
      );
    });
  } else {
    // If 'all' is selected, show all rows
    $("#locationTable tr").show();
  }
}

function filterLocationsByDepartment(deptId) {
  // Make an AJAX call to a PHP script that returns locations based on the department
  ajaxHandler.get(
    "getLocationsByDepartment.php",
    { deptId: deptId },
    function (response) {
      if (response.data && Array.isArray(response.data)) {
        let locOptions = '<option value="all">All Locations</option>';
        response.data.forEach((loc) => {
          locOptions += `<option value="${loc.id}">${loc.name}</option>`;
        });
        $("#locationFilter").html(locOptions);
      }
    },
    function (error) {
      console.error("Error:", error);
    }
  );
}

function filterDepartmentsByLocation(locId) {
  // Make an AJAX call to a PHP script that returns departments based on the location
  ajaxHandler.get(
    "getDepartmentsByLocation.php",
    { locId: locId },
    function (response) {
      if (response.data && Array.isArray(response.data)) {
        let deptOptions = '<option value="all">All Departments</option>';
        response.data.forEach((dept) => {
          deptOptions += `<option value="${dept.id}">${dept.name}</option>`;
        });
        $("#departmentFilter").html(deptOptions);
      }
    },
    function (error) {
      console.error("Error:", error);
    }
  );
}

// Function to populate filter dropdowns
function populateFilterDropdowns() {
  // Fetch and populate department dropdown using AjaxHandler
  ajaxHandler.get(
    "getAllDepartments.php",
    function (response) {
      let deptOptions =
        '<select class="form-select filterDepartmentSelect" id="filterDepartmentSelect" placeholder="Department" name="department"><option value="all" selected>All</option>';
      if (Array.isArray(response.data)) {
        response.data.forEach(function (value) {
          deptOptions += `<option value="${value.id}">${value.name}</option>`;
        });
      }
      deptOptions += "</select>";
      $("#departmentFilter").html(deptOptions);
    },
    function (error) {
      console.error("Error fetching departments:", error);
    }
  );

  // Fetch and populate location dropdown using AjaxHandler
  ajaxHandler.get(
    "fetchAllLocations.php",
    function (response) {
      let locOptions =
        '<select class="form-select filterLocationSelect" id="filterLocationSelect" placeholder="Location" name="location"><option value="all" selected>All</option>';
      if (Array.isArray(response.data)) {
        response.data.forEach(function (value) {
          locOptions += `<option value="${value.id}">${value.name}</option>`;
        });
      }
      locOptions += "</select>";
      $("#locationFilter").html(locOptions);
    },
    function (error) {
      console.error("Error fetching locations:", error);
    }
  );
}

// Department change event
$("#departmentFilter").on("change", ".filterDepartmentSelect", function () {
  if ($(this).val() !== "all") {
    $("#locationFilter").html(
      '<select class="form-select filterLocationSelect" id="filterLocationSelect"><option value="all" selected>All</option></select>'
    );
  } else {
    populateFilterDropdowns(); // Repopulate both filters
  }
});

// Location change event
$("#locationFilter").on("change", ".filterLocationSelect", function () {
  if ($(this).val() !== "all") {
    $("#departmentFilter").html(
      '<select class="form-select filterDepartmentSelect" id="filterDepartmentSelect"><option value="all" selected>All</option></select>'
    );
  } else {
    populateFilterDropdowns(); // Repopulate both filters
  }
});

function populateLocationsFilterDropdown() {
  // Fetch all locations and populate the dropdown for the locations filter modal
  ajaxHandler.get(
    "fetchAllLocations.php",
    function (response) {
      if (response.data && Array.isArray(response.data)) {
        let options = response.data
          .map((loc) => `<option value="${loc.id}">${loc.name}</option>`)
          .join("");
        $("#locationsFilterSelect").html(options);
      } else {
        console.error("Expected an array for locations, got:", response);
      }
    },
    function (error) {
      console.error("Error fetching locations:", error);
    }
  );
}

window.onerror = function (message, source, lineno, colno, error) {
  if (
    message.includes("Cannot read properties of undefined (reading 'backdrop')")
  ) {
    return true;
  }
  return false;
};

// Function to filter locations based on selected department
function populateFilterDropdowns() {
  // Fetch and populate department dropdown
  ajaxHandler.get(
    "getAllDepartments.php",
    function (response) {
      let deptOptions =
        '<select class="form-select filterDepartmentSelect" id="filterDepartmentSelect" name="department"><option value="all" selected>All</option>';

      if (Array.isArray(response.data)) {
        response.data.forEach(function (value) {
          deptOptions += `<option value="${value.id}">${value.name}</option>`;
        });
      } else {
        console.error("Expected an array for departments, got:", response);
      }

      deptOptions += "</select>";
      $("#departmentFilter").html(deptOptions);
    },
    function (error) {
      console.error("Error fetching departments:", error);
    }
  );

  // Fetch and populate location dropdown
  ajaxHandler.get(
    "fetchAllLocations.php",
    function (response) {
      let locOptions =
        '<select class="form-select filterLocationSelect" id="filterLocationSelect" name="location"><option value="all" selected>All</option>';

      if (Array.isArray(response.data)) {
        response.data.forEach(function (value) {
          locOptions += `<option value="${value.id}">${value.name}</option>`;
        });
      } else {
        console.error("Expected an array for locations, got:", response);
      }

      locOptions += "</select>";
      $("#locationFilter").html(locOptions);
    },
    function (error) {
      console.error("Error fetching locations:", error);
    }
  );
}

$("#applyFilter").click(function () {
  let selectedDept = $("#departmentFilter").val();
  let selectedLoc = $("#locationFilter").val();
  let activeTab = $(".nav-link.active").attr("id");

  // Check which tab is active and apply filter accordingly
  if (activeTab === "pills-home-tab") {
    // Employee Table
    getAll(selectedDept, selectedLoc);
  } else if (activeTab === "pills-profile-tab") {
    // Departments Table
    populateDeptsTable(selectedDept, selectedLoc); // Modify populateDeptsTable to accept and use these parameters
  } else if (activeTab === "pills-contact-tab") {
    // Locations Table
    fetchAllLocations(selectedLoc); // Modify fetchAllLocations to accept and use this parameter
  }

  $("#filterModal").modal("hide");
});

$("#clearFilter").on("click", function (e) {
  e.preventDefault();
  populateFilterDropdowns(); // Repopulate both filters
  // Additional logic to reset the actual filtered content can be added here
});

// Tables //

// Full employee Table
function getAll(deptId = null, locId = null) {
  let queryParams = {};
  if (deptId && deptId !== "all") queryParams.departmentId = deptId;
  if (locId && locId !== "all") queryParams.locationId = locId;

  let queryStr = $.param(queryParams);
  let url = `getAll.php?${queryStr}`;

  ajaxHandler.get(
    url,
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

// Update the populateDeptsTable function to include filtering logic
function populateDeptsTable(deptId = null, locId = null) {
  // First fetch all employees
  ajaxHandler.get(
    "getAll.php",
    function (employeeResponse) {
      const departmentCounts = groupEmployeesByDepartment(
        employeeResponse.data
      );

      // Then fetch all departments with possible filters
      let queryParams = {};
      if (deptId && deptId !== "all") queryParams.departmentId = deptId;
      if (locId && locId !== "all") queryParams.locationId = locId;

      let queryStr = $.param(queryParams);
      let filterUrl = `getAllDepartments.php?${queryStr}`;

      ajaxHandler.get(
        filterUrl,
        function (deptResponse) {
          const rows = deptResponse.data.map((department) => {
            const employeeCount = departmentCounts[department.id] || 0;
            return `
          <tr>
            <td class="tableHide d-none">${department.id}</td>
            <td>${department.name}</td>
            <td>${department.location}</td>
            <td>${employeeCount}</td>
            <td>
              <button class="btn btn-primary editDeptBtn" data-bs-toggle="modal" data-bs-target="#editDept2" data-id="${department.id}" title="Edit">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn btn-danger deleteDeptBtn" data-id="${department.id}" title="Delete">
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          </tr>
        `;
          });

          $("#departmentTable").html(rows.join(""));
        },
        function (error) {
          console.error("Error fetching filtered departments:", error);
          $("#departmentTable").html(
            `<tr><td colspan='5'>Error: ${error}</td></tr>`
          );
        }
      );
    },
    function (error) {
      console.error("Error fetching employees for counts:", error);
      $("#departmentTable").html(
        `<tr><td colspan='5'>Error: ${error}</td></tr>`
      );
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
function fetchAllLocations(selectedLoc = null) {
  let queryParams = {};
  if (selectedLoc && selectedLoc !== "all") {
    queryParams.locationId = selectedLoc;
  }

  let queryStr = $.param(queryParams);
  let url = `fetchAllLocations.php?${queryStr}`;

  // console.log("Fetching locations with URL:", url); // Debugging log

  ajaxHandler.get(
    url,
    function (response) {
      // console.log("Response data:", response.data); // Debugging log

      let rows = [];
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach((loc) => {
          rows.push(`
            <tr>
              <td class="d-none">${loc.id}</td>
              <td>${loc.name}</td>
              <td>${loc.departmentCount}</td>
              <td>${loc.employeeCount}</td>
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

        $("#locationTable").html(rows.join(""));
      } else {
        $("#locationTable").html(`<tr><td colspan='5'>No data found</td></tr>`);
      }
    },
    function (error) {
      $("#locationTable").html(`<tr><td colspan='5'>Error: ${error}</td></tr>`);
      console.error("Error fetching locations:", error);
    }
  );
}

// Bind this function to the location filter button click event
$("#applyLocationsFilter").click(function () {
  let selectedLoc = $("#locationsFilterSelect").val();
  // console.log("Selected Location ID:", selectedLoc); // Debugging log
  fetchAllLocations(selectedLoc);
  $("#locationsFilterModal").modal("hide");
});

// Handle form submission for adding an employee
$("#addEmployee").submit(function (e) {
  e.preventDefault();
  const formData = $(this).serialize();
  ajaxHandler.post(
    "addEmployee.php",
    formData,
    addEmployeeSuccess,
    addEmployeeError
  );
});

function addEmployeeSuccess(response) {
  const { firstName, lastName } = parseFormData($("#addEmployee").serialize());
  $("#newemployeeResponse").html(
    `<div class='alert alert-success'>${firstName} ${lastName} has been added to the directory</div>`
  );
  getAll();
}

function addEmployeeError(error) {
  $("#newemployeeResponse").html(
    `<div class='alert alert-danger'>Error adding employee member: ${error}</div>`
  );
}

// Populate location dropdown in Add Department modal
function populateLocationDropdownForAddDept() {
  ajaxHandler.get(
    "fetchAllLocations.php",
    populateLocationDropdownSuccess,
    populateLocationDropdownError
  );
}

$("#insertNewDepartment").on(
  "show.bs.modal",
  populateLocationDropdownForAddDept
);

function populateLocationDropdownSuccess(response) {
  const locOptions = response.data
    .map((value) => `<option value="${value.id}">${value.name}</option>`)
    .join("");
  $("#locName").html(
    `<option value="" disabled selected>Select Location</option>${locOptions}`
  );
}

function populateLocationDropdownError(error) {
  console.error("Error fetching locations for add department modal:", error);
}

// Handle form submission for adding a department
$("#addDepartment").submit(function (e) {
  e.preventDefault();
  const formData = $(this).serialize();
  ajaxHandler.post(
    "insertDepartment.php",
    formData,
    addDepartmentSuccess,
    addDepartmentError
  );
});

function addDepartmentSuccess(response) {
  const { name: deptName } = parseFormData($("#addDepartment").serialize());
  $("#newDeptResponse").html(
    `<div class='alert alert-success'>${deptName} has been added as a new department</div>`
  );
  populateDeptsTable();
  getAllDepartments();
}

function addDepartmentError() {
  $("#newDeptResponse").html(
    "<div class='alert alert-danger'>Error adding department</div>"
  );
}

// Handle form submission for adding a location
$("#addLocation").submit(function (e) {
  e.preventDefault();
  const formData = $(this).serialize();
  ajaxHandler.post(
    "addLocation.php",
    formData,
    addLocationSuccess,
    addLocationError
  );
});

function addLocationSuccess(response) {
  const { name: locName } = parseFormData($("#addLocation").serialize());
  $("#newLocResponse").html(
    `<div class='alert alert-success'>${locName} has been added as a new location</div>`
  );
  fetchAllLocations();
}

function addLocationError() {
  $("#newLocResponse").html(
    "<div class='alert alert-danger'>Error adding location</div>"
  );
}

// Utility function to parse form data into an object
function parseFormData(serializedData) {
  return serializedData.split("&").reduce((obj, item) => {
    const [key, value] = item.split("=");
    obj[key] = decodeURIComponent(value);
    return obj;
  }, {});
}

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
  $("#editEmployeeResponse").empty();

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

// Edit Departments

// Function to populate the Edit Department modal with current data
function populateEditDeptModal(departmentId) {
  // Improved Department ID Validation
  if (!departmentId || isNaN(departmentId)) {
    $("#editDeptResponse").html(
      "<div class='alert alert-danger'>Invalid Department ID.</div>"
    );
    return;
  }

  // Populate the location dropdown first
  populateLocationDropdown(function () {
    // Fetch department data by ID
    ajaxHandler.post(
      "getDepartmentByID.php",
      { id: departmentId },
      function (result) {
        if (result && result.status && result.status.code && result.data) {
          if (result.status.code.toString() === "200") {
            $("#deptId").val(result.data[0].id);
            $("#editDeptName").val(result.data[0].name);
            $("#editDeptLocation").val(result.data[0].locationID); // Set the department's current location
          } else {
            $("#editDeptResponse").html(
              "<div class='alert alert-danger'>Failed to fetch department data.</div>"
            );
          }
        } else {
          $("#editDeptResponse").html(
            "<div class='alert alert-danger'>Invalid response structure.</div>"
          );
        }
      },
      function (error) {
        $("#editDeptResponse").html(
          `<div class='alert alert-danger'>Error fetching department data: ${error}</div>`
        );
      }
    );
  });
}

// Function to populate location dropdown
function populateLocationDropdown(callback) {
  ajaxHandler.get(
    "fetchAllLocations.php",
    function (response) {
      let locOptions = '<option value="" disabled>Select Location</option>';
      if (Array.isArray(response.data)) {
        response.data.forEach(function (value) {
          locOptions += `<option value="${value.id}">${value.name}</option>`;
        });
      }
      $("#editDeptLocation").html(locOptions); // Update the dropdown in Edit modal
      if (callback) callback(); // Execute callback if provided
    },
    function (error) {
      console.error("Error fetching locations:", error);
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

  const name = $("#editDeptName").val();
  if (name.trim() === "") {
    $("#editDeptResponse").html(
      "<div class='alert alert-danger'>Department name is required.</div>"
    );
    return false;
  }

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
        // console.log("Response from editDept.php: ", response);
        if (response.status && response.status.code === "200") {
          $("#editDeptResponse").html(
            "<div class='alert alert-success'>Successfully Edited Department</div>"
          );

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
  $("#editDeptResponse").empty();

  const departmentId = $(e.relatedTarget).attr("data-id");
  populateEditDeptModal(departmentId);
});

// Function to show edit location confirmation toast
function showEditLocationConfirmation(confirmCallback) {
  $("#editLocationConfirmToast").toast("show");

  $("#editLocationConfirmToast").on("shown.bs.toast", function () {
    $("#confirmEditLocation").off();
    $("#cancelEditLocation").off();

    $("#confirmEditLocation").click(function () {
      confirmCallback();
      $("#editLocationConfirmToast").toast("hide");
    });

    $("#cancelEditLocation").click(function () {
      $("#editLocationConfirmToast").toast("hide");
    });
  });
}

// Edit Location

// Fetch data and populate the modal before it is shown
$("#editLocation").on("show.bs.modal", function (e) {
  $("#editLocResponse").empty(); // Clear any existing messages

  const locationId = $(e.relatedTarget).attr("data-id");
  $("#editLocationId").val(locationId); // Set the hidden ID field

  ajaxHandler.post(
    "fetchLocID.php",
    { id: locationId },
    function (result) {
      // console.log("Location fetch result: ", result);
      if (result.status.code.toString() === "200") {
        $("#editLocationName").val(result.data[0].name);
      } else {
        console.log("Error getting data. resultCode is not 200.");
      }
    },
    function (error) {
      console.log("Error getting data.", error);
    }
  );
});

// Handle form submission for editing a location
$("#editLocationForm").submit(function (e) {
  e.preventDefault();
  const formData = $(this).serialize();

  // console.log("FormData sent for location update: ", formData);

  showEditLocationConfirmation(function () {
    ajaxHandler.post(
      "editLocation.php",
      formData,
      function (response) {
        // console.log("Response from editLocation.php: ", response);
        if (response.status && response.status.code === "200") {
          $("#editLocResponse").html(
            "<div class='alert alert-success'>Location Updated</div>"
          );
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
        console.log("Error: ", error);
      }
    );
  });
  return false;
});

// Delete Employee, Department, Location

// Delete Employee

// Initialize global variables to hold the person ID and name to be deleted
let personIDtoBeDelete;
let personName;

// Attach the show.bs.modal event to the delete employee confirmation modal
$("#deleteModal").on("show.bs.modal", function () {
  // Update the modal content with the person's name
  $("#deleteModal .modal-body p").text(
    `Are you sure you want to delete ${personName}?`
  );
});

// Handle click events on the delete button
$(document).on("click", ".deletePerson", function (e) {
  e.preventDefault();
  personIDtoBeDelete = $(this).closest("tr").find("#personId").text();
  personName = $(this).closest("tr").find("td").eq(0).text();
  $("#deleteModal").modal("show");
});

// Handle click event on the confirm delete button for employees
$("#confirmDeleteBtn").click(function () {
  // Use the AjaxHandler to perform the POST request to delete the employee
  ajaxHandler.post(
    "removeEmployee.php",
    { id: personIDtoBeDelete },
    function (response) {
      // Check the response status more thoroughly for extra safety
      if (response.status && response.status.code === "200") {
        // Hide the delete confirmation modal
        $("#deleteModal").modal("hide");

        // Show a success message within the success modal
        $("#successModalBody").html(
          `<p class="text-success">${personName} has been removed.</p>`
        );
        // Show the success modal
        $("#successModal").modal("show");

        // Refresh the table data (if needed)
        getAll();
      } else {
        // Show an error message within the modal
        $("#deleteModal .modal-body p").html(
          `<p class="text-danger">Error deleting employee.</p>`
        );
      }
    },
    function () {
      // Show an error message within the modal for the Ajax request failure
      $("#deleteModal .modal-body p").html(
        `<p class="text-danger">Error deleting employee.</p>`
      );
    }
  );
});

// Handle click event on the cancel delete button
$("#cancelDeleteBtn").click(function () {
  // Manually hide the delete confirmation modal
  $("#deleteModal").modal("hide");
});

// Delete Department

// Global variables for department ID and name
let departmentIdToBeDeleted;
let departmentName;

// Attach the show.bs.modal event to the delete department confirmation modal
$("#deleteDeptModal").on("show.bs.modal", function () {
  // Update the modal content with the department's name
  $("#deleteDeptConfirmationText").text(
    `Are you sure you want to delete ${departmentName}?`
  );
});

// Function to initiate the delete process for a department
$(document).on("click", ".deleteDeptBtn", function (e) {
  e.preventDefault();
  departmentIdToBeDeleted = $(this).data("id");
  departmentName = $(this).closest("tr").find("td").eq(1).text();
  checkDeptForDependencies();
});

// Function to check for dependencies of a department
function checkDeptForDependencies() {
  ajaxHandler.post(
    "deleteDept.php",
    { id: departmentIdToBeDeleted },
    function (response) {
      // console.log("Response received:", response); // Log the response
      if (response.status.code === "200") {
        let dependentsCount = response.data.departmentCount;
        if (dependentsCount === 0) {
          // No dependencies, show confirmation modal
          // console.log("Modal should show now: No dependencies"); // Log confirmation
          $("#deleteDeptConfirmationText").text(
            `Are you sure you want to delete ${departmentName}?`
          );
          $("#deleteDeptModal").modal("show");
        } else {
          // Dependencies exist, show error modal with employee names
          let dependentsList = response.data.employeeNames
            .map((name) => `<li>${name}</li>`)
            .join(""); // Convert the array to a list of <li> elements
          console.log("Modal should show now: Dependencies exist"); // Log dependencies
          $("#deleteDeptErrorModalBody").html(
            `<p>${departmentName} cannot be removed due to the following dependent employees:</p>
             <ul>${dependentsList}</ul>` // Display the list in an unordered list
          );
          $("#deleteDeptErrorModal").modal("show");
        }
      } else {
        // Non-200 status code
        showErrorModal(
          "Error occurred while checking for department dependencies."
        );
      }
    },
    function (error) {
      // AJAX request error
      showErrorModal(
        "Network or server error occurred while checking dependencies."
      );
    }
  );
}

// Confirm the deletion of the department
$("#confirmDeleteDeptBtn").on("click", function () {
  deleteDepartment();
});

// Function to delete the department
function deleteDepartment() {
  $("#deleteDeptModal").modal("hide");

  ajaxHandler.post(
    "deleteDepartmentByID.php",
    { id: departmentIdToBeDeleted },
    function (response) {
      if (response.status.code === "200") {
        showSuccessModal(`${departmentName} has been removed.`);
        populateDeptsTable(); // Reload the table
        getAllDepartments(); // Update department dropdowns if necessary
      } else {
        showErrorModal("Error deleting department.");
      }
    },
    function () {
      showErrorModal("Error deleting department.");
    }
  );
}

// Cancel the department deletion
$("#cancelDeptDelete").on("click", function () {
  $("#deleteDeptModal").modal("hide");
});

// Delete Location

// Global variables for location ID and name
let locationIdToBeDeleted;
let locationName;

// Attach the show.bs.modal event to the delete location confirmation modal
$("#deleteLocationModal").on("show.bs.modal", function () {
  // Update the modal content with the location's name
  $("#deleteLocationConfirmationText").text(
    `Are you sure you want to delete ${locationName}?`
  );
});

// Function to initiate the delete process for a location
$(document).on("click", ".deleteLocationBtn", function (e) {
  e.preventDefault();
  locationIdToBeDeleted = parseInt($(this).attr("data-id")); // Convert to integer
  locationName = $(this).closest("tr").find("td").eq(1).text(); // Get location name

  // Check for dependencies before showing delete confirmation
  checkForDependencies();
});

// Function to check for dependencies of a location
function checkForDependencies() {
  ajaxHandler.post(
    "removeLocation.php",
    { id: locationIdToBeDeleted },
    function (response) {
      if (response.status.code === "200") {
        let dependentsCount = response.data.departmentCount;
        if (dependentsCount === 0) {
          // No dependencies, show confirmation modal
          $("#deleteLocationConfirmationText").text(
            `Are you sure you want to delete ${locationName}?`
          );
          $("#deleteLocationModal").modal("show");
        } else {
          // Dependencies exist, show error modal with dependent names
          let dependentsList = response.data.departmentNames
            .map((name) => `<li>${name}</li>`)
            .join("");
          $("#deleteLocationErrorText").html(
            `<p>${locationName} cannot be removed due to dependent departments:</p>
			<ul>${dependentsList}</ul>.`
          );
          $("#deleteLocationErrorModal").modal("show");
        }
      } else {
        // Handle cases where the status code is not 200
        $("#deleteLocationErrorText").text(
          "An error occurred while checking for dependencies. Please try again."
        );
        $("#deleteLocationErrorModal").modal("show");
      }
    },
    function (error) {
      // Handle AJAX request errors
      $("#deleteLocationErrorText").text(
        "Failed to check for dependencies due to a network or server error."
      );
      $("#deleteLocationErrorModal").modal("show");
    }
  );
}

// Confirm the deletion of the location
$("#confirmDeleteLocationBtn").on("click", function () {
  deleteLocation();
});

// Function to delete the location
function deleteLocation() {
  $("#deleteLocationModal").modal("hide");

  ajaxHandler.post(
    "removeLocationByID.php",
    { id: locationIdToBeDeleted },
    function (response) {
      if (response.status.code === "200") {
        // Show success modal for location removal
        $("#deleteLocationSuccessText").text(
          `${locationName} has been removed.`
        );
        $("#deleteLocationSuccessModal").modal("show");
        fetchAllLocations(); // Refresh the table
      } else {
        // Show error modal for location removal failure
        $("#deleteLocationErrorText").text("Error deleting location.");
        $("#deleteLocationErrorModal").modal("show");
      }
    },
    function () {
      // Show error modal for location removal failure
      $("#deleteLocationErrorText").text("Error deleting location.");
      $("#deleteLocationErrorModal").modal("show");
    }
  );
}

// Cancel the deletion of the location
$("#cancelLocationDelete").on("click", function () {
  // Manually hide the confirmation modal
  $("#deleteLocationModal").modal("hide");
});
