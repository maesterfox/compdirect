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

  $(document).ready(function () {
    // Add New Button Click Handler
    $("#addBtn").click(function () {
      let activeTab = $(".nav-link.active").attr("id");

      // Check which tab is active and open the corresponding modal
      if (activeTab === "pills-home-tab") {
        // Show Add New Employee Modal
        $("#insertNewEmployee").modal("show");
      } else if (activeTab === "pills-profile-tab") {
        // Show Add New Department Modal
        $("#insertNewDepartment").modal("show");
      } else if (activeTab === "pills-contact-tab") {
        // Show Add New Location Modal
        $("#insertNewLocation").modal("show");
      }
    });

    // Focus on first input field when the modal is shown for Person
    $("#insertNewEmployee").on("shown.bs.modal", function () {
      $(".modal-backdrop").remove(); // Remove backdrop
      $("#addFirstName").focus();
    });

    // Focus on first input field when the modal is shown for Department
    $("#insertNewDepartment").on("shown.bs.modal", function () {
      $(".modal-backdrop").remove(); // Remove backdrop
      $("#deptName").focus();
      populateLocationDropdownForAddDept(); // Populate the location dropdown
    });

    // Focus on first input field when the modal is shown for Location
    $("#insertNewLocation").on("shown.bs.modal", function () {
      $(".modal-backdrop").remove(); // Remove backdrop
      $("#newLocName").focus();
    });
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

  // Listen for the 'shown' event on the department tab
  $("#pills-home-tab").on("shown.bs.tab", function (e) {
    // Call the function to populate the departments table
    getAll();
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

// Document Ready Event Handlers
$(document).ready(function () {
  // Unified search for all tables
  $("#universalSearch").on("keyup", function () {
    let value = $(this).val().toLowerCase();
    let activeTab = $(".nav-link.active").attr("id");

    if (activeTab === "pills-home-tab") {
      $("#employeeTable tr").filter(function () {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
      });
    } else if (activeTab === "pills-profile-tab") {
      $("#departmentTable tr").filter(function () {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
      });
    } else if (activeTab === "pills-contact-tab") {
      $("#locationTable tr").filter(function () {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
      });
    }
  });
});

$(document).ready(function () {
  // Toggle filter button visibility based on the active tab
  function toggleFilterButtonVisibility() {
    let activeTab = $(".nav-link.active").attr("id");

    if (activeTab === "pills-contact-tab") {
      $("#filterBtn").addClass("d-none");
      $("#locationsFilterBtn").removeClass("d-none");
    } else {
      $("#filterBtn").removeClass("d-none");
      $("#locationsFilterBtn").addClass("d-none");
    }
  }

  // Call the function initially and on tab change
  toggleFilterButtonVisibility();
  $(".nav-link").on("click", toggleFilterButtonVisibility);

  // Regular Filter Button Click Handler
  $("#filterBtn").click(function () {
    populateFilterDropdowns();
    $("#filterModal").modal("show");
  });

  // Locations Filter Button Click Handler
  $("#locationsFilterBtn").click(function () {
    populateLocationsFilterDropdown();
    $("#locationsFilterModal").modal("show");
  });

  // Apply Filter Logic for Locations Modal
  $("#applyLocationsFilter").click(function () {
    let selectedLoc = $("#locationsFilterSelect").val();
    fetchAllLocations(selectedLoc); // Modify to use the selected location
    $("#locationsFilterModal").modal("hide");
  });

  // Remove backdrop when any modal is shown
  $(".modal").on("shown.bs.modal", function () {
    $(".modal-backdrop").remove();
    $(this).find("select").first().focus();
  });

  // Change event for department filter (only applicable for the regular filter modal)
  $("#departmentFilter").on("change", function () {
    let selectedDept = $(this).val();
    if (selectedDept !== "all") {
      filterLocationsByDepartment(selectedDept);
    } else {
      populateFilterDropdowns();
    }
  });
});

// Apply filter logic for locations tab using the new modal
$("#applyLocationsFilter").click(function () {
  let selectedLoc = $("#locationsFilterSelect").val(); // Adjust this ID based on your new modal's dropdown
  filterLocationsTable(selectedLoc); // Call the specific function to filter locations table
  $("#locationsFilterModal").modal("hide");
});

function filterLocationsTable(selectedLoc) {
  console.log(selectedLoc);
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
    "getLocationsByDepartment.php", // This PHP script needs to exist on the server
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
    "getDepartmentsByLocation.php", // This PHP script needs to exist on the server
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
        // Handle the case where response.data is not an array
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
        // Handle the case where response.data is not an array
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
    // Call populateDeptsTable with parameters if necessary
    populateDeptsTable(selectedDept, selectedLoc); // Modify populateDeptsTable to accept and use these parameters
  } else if (activeTab === "pills-contact-tab") {
    // Locations Table
    // Call fetchAllLocations with parameters if necessary
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
  console.log(
    "populateDeptsTable called with deptId:",
    deptId,
    "locId:",
    locId
  );

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

  console.log("Fetching locations with URL:", url); // Debugging log

  ajaxHandler.get(
    url,
    function (response) {
      console.log("Response data:", response.data); // Debugging log

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
  console.log("Selected Location ID:", selectedLoc); // Debugging log
  fetchAllLocations(selectedLoc);
  $("#locationsFilterModal").modal("hide");
});

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

// Function to populate location dropdown in Add Department modal
function populateLocationDropdownForAddDept() {
  ajaxHandler.get(
    "fetchAllLocations.php",
    function (response) {
      if (response && Array.isArray(response.data)) {
        let locOptions =
          '<option value="" disabled selected>Select Location</option>'; // Default option
        response.data.forEach(function (value) {
          locOptions += `<option value="${value.id}">${value.name}</option>`;
        });

        // Debugging: Log the options string
        console.log("Dropdown HTML:", locOptions);

        // Update the dropdown
        $("#locName").html(locOptions); // Update the dropdown
      } else {
        console.error("Unexpected response format or no data", response);
      }
    },
    function (error) {
      console.error(
        "Error fetching locations for add department modal:",
        error
      );
    }
  );
}

// Attach the function call to the modal's show event
$("#insertNewDepartment").on("show.bs.modal", function () {
  populateLocationDropdownForAddDept();
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

// Edit Departments

// Function to populate the Edit Department modal with current data
function populateEditDeptModal(departmentId) {
  // Validate departmentId
  if (!departmentId) {
    console.error("Department ID is not valid.");
    return;
  }

  // Populate the location dropdown first
  populateLocationDropdown(function () {
    // Fetch department data by ID
    ajaxHandler.post(
      "getDepartmentByID.php",
      { id: departmentId },
      function (result) {
        // Validate result object and its properties
        if (result && result.status && result.status.code && result.data) {
          if (result.status.code.toString() === "200") {
            $("#deptId").val(result.data[0].id);
            $("#editDeptName").val(result.data[0].name);
            $("#editDeptLocation").val(result.data[0].locationID); // Set the department's current location
          } else {
            console.error(
              "Error getting department data. resultCode is not 200."
            );
            $("#editDeptResponse").html(
              "<div class='alert alert-danger'>Failed to fetch department data.</div>"
            );
          }
        } else {
          console.error("Invalid response structure.");
          $("#editDeptResponse").html(
            "<div class='alert alert-danger'>Invalid response structure.</div>"
          );
        }
      },
      function (error) {
        console.error("Error fetching department data:", error);
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

// Fetch data and populate the modal before it is shown
$("#editLocation").on("show.bs.modal", function (e) {
  $("#editLocResponse").empty(); // Clear any existing messages

  const idToBeFetched = $(e.relatedTarget).attr("data-id");

  ajaxHandler.post(
    "fetchLocID.php",
    { id: idToBeFetched },
    function (result) {
      if (result.status.code.toString() === "200") {
        $("#editLocationSelect").val(result.data[0].id);
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

// Fetch data and populate the modal before it is shown
$("#editLocation").on("show.bs.modal", function (e) {
  $("#editLocResponse").empty(); // Clear any existing messages

  const idToBeFetched = $(e.relatedTarget).attr("data-id");

  ajaxHandler.post(
    "fetchLocID.php",
    { id: idToBeFetched },
    function (result) {
      if (result.status.code.toString() === "200") {
        $("#editLocationSelect").val(result.data[0].id);
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

// Global variables for department ID and name
let departmentIdToBeDeleted;
let departmentName;

// Function to initiate the delete process for a department
$(document).on("click", ".deleteDeptBtn", function (e) {
  e.preventDefault();
  departmentIdToBeDeleted = $(this).data("id"); // Get department ID
  departmentName = $(this).closest("tr").find("td").eq(1).text(); // Get department name

  // Check for dependencies before showing delete confirmation
  checkDeptForDependencies();
});

// Function to check for dependencies of a department
function checkDeptForDependencies() {
  ajaxHandler.post(
    "deleteDept.php", // Script to check for department dependencies
    { id: departmentIdToBeDeleted },
    function (response) {
      let deptNum = response.data[0].departmentCount;
      if (response.status.code === "200" && deptNum === 0) {
        // No dependencies, show confirmation modal
        showDeptDeleteConfirmation();
      } else {
        // Dependencies exist, show error toast
        showToast(
          `${departmentName} cannot be removed due to dependent employees. ${deptNum} in total.`,
          "red"
        );
      }
    },
    function () {
      showToast("Error checking department dependencies.", "red");
    }
  );
}

// Function to show delete confirmation modal for department
function showDeptDeleteConfirmation() {
  $("#confirmDeptDelete .toast-body").text(
    `Are you sure you want to delete ${departmentName}?`
  );
  $("#confirmDeptDelete").toast("show");
}

// Confirm the deletion of the department
$("#confirmDeptDeleteButton").on("click", function () {
  deleteDepartment();
});

// Function to delete the department
function deleteDepartment() {
  $("#confirmDeptDelete").toast("hide");

  ajaxHandler.post(
    "deleteDepartmentByID.php",
    { id: departmentIdToBeDeleted },
    function (response) {
      if (response.status.code === "200") {
        showSuccessToast(`${departmentName} has been removed.`);
        populateDeptsTable(); // Reload the table
        getAllDepartments(); // Update department dropdowns if necessary
      } else {
        showToast("Error deleting department.", "red");
      }
    },
    function () {
      showToast("Error deleting department.", "red");
    }
  );
}

// Cancel the department deletion
$("#cancelDeptDelete").on("click", function () {
  $("#confirmDeptDelete").toast("hide");
});

// TODO: Maybe add a function to reset the global variables after use

// Global variables for location ID and name
let locationIdToBeDeleted;
let locationName;

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
      let locNum = response.data[0].locNum;
      if (response.status.code === "200" && locNum === 0) {
        // No dependencies, show confirmation modal
        showDeleteConfirmation();
      } else {
        // Dependencies exist, show error toast
        showToast(
          `${locationName} cannot be removed due to dependent departments.`,
          "red"
        );
      }
    },
    function () {
      showToast("Error checking location dependencies.", "red");
    }
  );
}

// Function to show delete confirmation modal
function showDeleteConfirmation() {
  $("#confirmLocationDelete .toast-body").text(
    `Are you sure you want to delete ${locationName}?`
  );
  $("#confirmLocationDelete").toast("show");
}

// Confirm the deletion of the location
$("#confirmLocationDeleteButton").on("click", function () {
  deleteLocation();
});

// Function to delete the location
function deleteLocation() {
  $("#confirmLocationDelete").toast("hide");

  ajaxHandler.post(
    "removeLocationByID.php",
    { id: locationIdToBeDeleted },
    function (response) {
      if (response.status.code === "200") {
        showSuccessToast(`${locationName} has been removed.`);
        fetchAllLocations(); // Refresh the table
      } else {
        showToast("Error deleting location.", "red");
      }
    },
    function () {
      showToast("Error deleting location.", "red");
    }
  );
}

// Cancel the deletion of the location
$("#cancelLocationDelete").on("click", function () {
  $("#confirmLocationDelete").toast("hide");
});

// TODO: Consider adding a function to reset the global variables after use.

// Function to show toast with color without autohide
function showToast(message, color) {
  $("#myToast .toast-body").text(message);
  $("#myToast").removeClass("toast-red toast-green").addClass(`toast-${color}`);
  // Show toast without autohide
  $("#myToast").toast({ autohide: false }).toast("show");
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
