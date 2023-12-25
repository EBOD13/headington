function sendSide() {
    var sideSelection = document.getElementById("side").value;

    $.ajax({
        url: "/side_process_in",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            'type': 'sideSelection',
            'side': sideSelection
        }),
        success: function(response) {
            updateRoomNumberSelect(response.result); // Update room numbers based on the selected side
        },
        error: function(error) {
            console.log(error);
        }
    });
}

// Check-Out Section
function sendSideOut() {
    var sideSelection = document.getElementById("side").value;

    $.ajax({
        url: "/side_process_out",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            'type': 'sideSelection',
            'side': sideSelection
        }),
        success: function(response) {
            updateRoomNumberSelectOut(response.result);
        },
        error: function(error) {
            console.log(error);
        }
    });
}
// Check-Out Section
function sendSideReg() {
    var sideSelection = document.getElementById("side").value;

    $.ajax({
        url: "/side_process_reg",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            'type': 'sideSelection',
            'side': sideSelection
        }),
        success: function(response) {
            updateRoomNumberSelectOut(response.result);
        },
        error: function(error) {
            console.log(error);
        }
    });
}

function sendCombinedSelection() {
    var sideSelection = document.getElementById("side").value;
    var roomSelection = document.getElementById("roomNumber").value;

    var combinedSelection = sideSelection.charAt(0).toLowerCase() + "" + roomSelection; // Combine selections

    $.ajax({
        url: "/combinedProcess",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            'type': 'combinedSelection',
            'combined': combinedSelection
        }),
        success: function(response) {
            // Handle response
            updateResidentName(response.residentNames)
        },
        error: function(error) {
            console.log(error);
        }
    });
    emptyFields();
}


function fillResidentNames(){

    // Empty the visitor field after every change
    var visFirstName = document.getElementById('visFirstName');
    visFirstName.value = '';
    var visFirstName = document.getElementById('visLastName');
    visLastName.value = '';

    var selectedResidentOptions = document.getElementById('resList');
    var selectedResident = selectedResidentOptions.value;
    var resFirstName = title(selectedResident.split(",")[1].replaceAll('"', ""));
    var resLastName = title(selectedResident.split(",")[2].replaceAll('"', ""));
    var resContact = selectedResident.split(",")[4].replaceAll('"', "");

    var residentFirstName = document.getElementById("resFirstName");
    var residentLastName = document.getElementById("resLastName");
    var residentContact = document.getElementById("resContact");


    residentFirstName.value = resFirstName;
    residentLastName.value = resLastName;
    residentContact.value = resContact;

    residentFirstName.disabled = true;
    residentLastName.disabled = true;
    residentContact.disabled = true;
}

function updateRoomNumberSelect(options) {
    var roomNumberSelect = document.getElementById("roomNumber");
    roomNumberSelect.innerHTML = ""; // Clear the current options
    emptyFields();

    if (options.length === 0){
            roomNumberSelect.innerHTML = '';
            roomNumberSelect.disabled = true;
        return
    }
    else{
        roomNumberSelect.disabled = false;
    var defaultOption = document.createElement("option");
    defaultOption.value = ""; // Set value to an empty string or any other appropriate value
    defaultOption.text = "Select Room";
    defaultOption.disabled = true; // Disable the default option
    defaultOption.selected = true;
    defaultOption.hidden = true;// Make the default option selected by default
    roomNumberSelect.appendChild(defaultOption);

    options.forEach(function(option) {
        var newOption = document.createElement("option");
        newOption.value = option;
        newOption.text = option;
        roomNumberSelect.appendChild(newOption);
    });
}
}

function updateResidentName(names) {
    var visitorFirstName = document.getElementById("visFirstName");
    var visitorLastName = document.getElementById("visLastName");
    visitorFirstName.disabled = false;
    visitorFirstName.value = "";
    visitorLastName.innerHTML = "";

    var residentFullName = document.getElementById('resList');
    residentFullName.value = '';

    if (names.length === 0) {
        residentFullName.innerHTML = '';
        residentFullName.disabled = true;
        resFirstName.disabled = false;
        resLastName.disabled = false;
        resContact.disabled = false;

        return;
    } else {
        var defaultOption = document.createElement("option");
        defaultOption.value = ""; // Set value to an empty string or any other appropriate value
        defaultOption.text = "Select Resident";
        defaultOption.disabled = true; // Disable the default option
        defaultOption.selected = true; // Make the default option selected by default
        defaultOption.hidden = true;
        residentFullName.appendChild(defaultOption);

        names.forEach(function (resident) {
            var newResOption = document.createElement("option");
            newResOption.value = JSON.stringify(resident);
           // Set the full value for future use if needed
            var combinedNames = resident[1] + " " + resident[2];
            newResOption.text = title(combinedNames);
            residentFullName.appendChild(newResOption);

        });
        residentFullName.disabled = false;

           resList.addEventListener("change", function() {
               var visitorFullName = document.getElementById('visList');
               visitorFullName.innerHTML = "";
               var selectedResidentOption = resList.options[resList.selectedIndex].value;
               var cleanVisitorString = selectedResidentOption.split("[")[2].replaceAll(']', "");
               var formatToJson = '[' + cleanVisitorString.replace(/}\s*{/g, '},{') + ']';
               var jsonifiedArray = JSON.parse(formatToJson);

               var visitorsFullNameArray = jsonifiedArray.map(function(visitor) {
                   return visitor.vis_fullname + " " + visitor.vis_cont;
               });

               updateVisitorName(visitorsFullNameArray);
           });
    }

}

function fillVisitorNames() {
    var visList = document.getElementById("visList");
    var selectedVisitor = visList.options[visList.selectedIndex].value.split(" ");
    var visitorFirstName = document.getElementById("visFirstName");
    var visitorLastName = document.getElementById("visLastName");
    var visitorContact = document.getElementById("visContact"); // Get the visitor contact field

    visitorFirstName.value = title(selectedVisitor[0]);
    visitorLastName.value = title(selectedVisitor[1]);
    visitorContact.value = selectedVisitor[2]; // Set the visitor contact information

    // Disable the fields
    visitorFirstName.disabled = true;
    visitorLastName.disabled = true;
    visitorContact.disabled = true; // Disable the visitor contact field
}

function fillVisitorNamesReg(){
    var visList = document.getElementById("visList");
    var selectedVisitor = visList.options[visList.selectedIndex].value.split(" ");
    var visitorFirstName = document.getElementById("visFirstName");
    var visitorLastName = document.getElementById("visLastName");

    visitorFirstName.value = title(selectedVisitor[0]);
    visitorLastName.value = title(selectedVisitor[1]);
//    residentContact.value = resContact;

    visitorFirstName.disabled = true;
    visitorLastName.disabled = true;
//    vistorContact.disabled = true;

}

function updateVisitorName(visitors) {
    var visitorFullName = document.getElementById('visList');
    visitorFullName.value = '';

    if (visitors.length === 0) {
        visitorFullName.innerHTML = '';
        visitorFullName.disabled = true;
        return;
    } else {
        var defaultOption = document.createElement("option");
        defaultOption.value = ""; // Set value to an empty string or any other appropriate value
        defaultOption.text = "Select Visitor";
        defaultOption.disabled = true; // Disable the default option
        defaultOption.hidden = true; // Disable the default option
        defaultOption.selected = true; // Make the default option selected by default
        visitorFullName.appendChild(defaultOption);

        visitors.forEach(function (visitor) {
            var newVisOption = document.createElement("option");
            newVisOption.value = visitor; // Set the full value for future use if needed
            newVisOption.text = title(visitor.split(" ")[0] + " " + visitor.split(" ")[1]);
            visitorFullName.appendChild(newVisOption);
        });
        visitorFullName.disabled = false;
    }
}

function updateVisitor(){
    var sideSelection = document.getElementById("side").value;
    var roomSelection = document.getElementById("roomNumber").value;

    var sideAndRoom = sideSelection.charAt(0).toLowerCase() + "" + roomSelection; // Combine selections

    $.ajax({
        url: "/update_visitor",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            'type': 'sideAndRoom',
            'sideAndRoom': sideAndRoom
        }),
        success: function(response) {
            // Handle response
             updateVisitorName(response.visitors)
         },
         error: function(error) {
             console.log(error);
         }
     });
}

function updateRoomNumberSelectOut(options) {
    var roomNumberSelect = document.getElementById("roomNumber");
    roomNumberSelect.innerHTML = ""; // Clear the current options

    if (options.length === 0) {
        roomNumberSelect.disabled = true;
        return;
    }

    roomNumberSelect.disabled = false;

    var defaultOption = new Option("Select Room", "", true, true);
    defaultOption.disabled = true;
    defaultOption.hidden = true;
    roomNumberSelect.appendChild(defaultOption);

    options.forEach(function(option) {
        var newOption = new Option(option, option);
        roomNumberSelect.appendChild(newOption);
    });
}

function emptyFields(){
    var residentFirstName = document.getElementById("resFirstName");
    var residentLastName = document.getElementById("resLastName");
    var resContact = document.getElementById("resContact");
    var resList = document.getElementById('resList');
    var resRoom = document.getElementById('roomNumber');
    var visitorFullName = document.getElementById('visList');
    var visitorFirstName = document.getElementById("visFirstName");
    var visitorLastName = document.getElementById("visLastName");
    var visitorContact = document.getElementById("vicContact");

//    resRoom.disabled = true;
    residentLastName.value = "";
    residentFirstName.value = "";
    resList.value = "";
    resList.innerHTML = "";
    resContact.value = "";
    visitorFullName.innerHTML = "";
    visitorFirstName.value = "";
    visitorLastName.value = "";
    visitorContact.value = "";

}

function title(string){
    var titledString = "";
    const len = string.trim().split(" ");
    for( let i=0; i<len.length; i++){
        var newString = string.split(" ")[i]
        var upperString = newString.charAt(0).toUpperCase() + newString.slice(1);
        titledString += upperString + " ";
    }
        return titledString.trim();
}
function resetForm() {
    var forms = document.getElementsByTagName("form");
     // Reset the form
     for (var i=0; i < forms.length; i++){
        forms[i].reset = true;
     }
    var selects = document.getElementsByTagName("select");

    emptyFields();
    for (var j = 0; j < selects.length; j++) {
        if (selects[j].id !== "side") {
            selects[j].selectedIndex = -1; // Reset the selectedIndex to -1 to deselect all options
            selects[j].innerHTML = ''; // Remove all options
            selects[j].disabled = true; // Disable the select element
        } else {
            selects[j].selectedIndex = 0; // Set "side" select element back to its default value
            selects[j].disabled = false; // Enable the "side" select element
        }
    }
}

function checkVisibility(){
    var dialog = document.getElementById("data-modal");
    var overlay = document.createElement("div");

    // Disable side when the dialog is intersecting
    const observer = new IntersectionObserver((entries) => {
        if(entries[0].isIntersecting){
            overlay.style.position = "fixed";
            overlay.style.top = "0";
            overlay.style.left = "0";
            overlay.style.width = "100%";
            overlay.style.height = "100%";
            overlay.style.backgroundColor = "rgba(0, 0, 0, 0.3)"; // Adjust alpha for transparency
            overlay.style.zIndex = "9999"; // Ensure the overlay is on top

            // Append the overlay to the body
            document.body.appendChild(overlay);

        } else {
            document.body.removeChild(overlay);
        }
    });
    observer.observe(dialog);

    // Close the dialog by setting its open attribute to false
    dialog.open = false;
}


function closeDialog(flash) {
    // Remove the parent element of the passed flash parameter
    $(flash).parent().remove();
}

function enableChange() {
    alert('enableChange function called'); // Check if this message appears in the console
    var resList = document.getElementById('resList');
    var resFirstName = document.getElementById('resFirstName');
    var resLastName = document.getElementById('resLastName');

    if (!resList.options.length) { // Check if resList is empty
        resFirstName.disabled = false;
        resLastName.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    var selectSide = document.getElementById('side');
    var selectResident = document.getElementById("resList")
    updateVisitor();
    sendCombinedSelection();
    selectSide.selectedIndex = 0;
    selectResident.selectedIndex = 0; // Set the default option as selected
    emptyFields();
    var resList = document.getElementById('resList');
    var visList = document.getElementById('visList');

    resList.disabled = true;
    visList.disabled = true;

});