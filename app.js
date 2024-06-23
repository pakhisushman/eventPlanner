// Initialize empty events array
var events = [];
// Initialize variables
var currentPage = 1;
var itemsPerPage = 5;
// DOM elements
var form = document.getElementById("event-form");
var eventList = document.getElementById("event-list");
var upcomingEvents = document.getElementById("upcoming-events");
var search = document.getElementById("search");
var sort = document.getElementById("sort");
var prevPage = document.getElementById("prev-page");
var nextPage = document.getElementById("next-page");
// Preload alarm audio
var audio = new Audio('alarm.wav');
audio.preload = 'auto';
// Render initial events on page load
document.addEventListener("DOMContentLoaded", function () {
    renderEvents();
});
// Event listeners
form.addEventListener("submit", function (event) {
    event.preventDefault();
    addEvent();
});
search.addEventListener("input", renderEvents);
sort.addEventListener("change", renderEvents);
prevPage.addEventListener("click", prev);
nextPage.addEventListener("click", next);
// Function to add a new event
function addEvent() {
    var eventName = document.getElementById("event-name").value;
    var eventDate = document.getElementById("event-date").value;
    var eventTime = document.getElementById("event-time").value;
    var eventObj = { name: eventName, date: eventDate, time: eventTime };
    events.push(eventObj);
    form.reset();
    renderEvents();
    scheduleAlarm(eventObj);
}
// Function to render events based on filters and pagination
function renderEvents() {
    var _a, _b;
    var filteredEvents = events.filter(function (event) {
        return event.name.toLowerCase().includes(search.value.toLowerCase());
    });
    var sortedEvents = filteredEvents.sort(function (a, b) {
        if (sort.value === "name") {
            return a.name.localeCompare(b.name);
        }
        else {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
    });
    var paginatedEvents = sortedEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    eventList.innerHTML = "";
    paginatedEvents.forEach(function (event, index) {
        var li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = "\n            <div>\n                <h5>".concat(event.name, "</h5>\n                <small>").concat(event.date, " at ").concat(event.time, "</small>\n            </div>\n            <div>\n                <button class=\"btn btn-info btn-sm mr-2\" onclick=\"editEvent(").concat(events.indexOf(event), ")\">Edit</button>\n                <button class=\"btn btn-danger btn-sm\" onclick=\"deleteEvent(").concat(events.indexOf(event), ")\">Delete</button>\n            </div>\n        ");
        eventList.appendChild(li);
    });
    (_a = prevPage === null || prevPage === void 0 ? void 0 : prevPage.parentElement) === null || _a === void 0 ? void 0 : _a.classList.toggle("disabled", currentPage === 1);
    (_b = nextPage === null || nextPage === void 0 ? void 0 : nextPage.parentElement) === null || _b === void 0 ? void 0 : _b.classList.toggle("disabled", paginatedEvents.length < itemsPerPage);
    // Update upcoming events
    updateUpcomingEvents();
}
// Function to edit an event
window.editEvent = function (index) {
    var event = events[index];
    document.getElementById("event-name").value = event.name;
    document.getElementById("event-date").value = event.date;
    document.getElementById("event-time").value = event.time;
    events.splice(index, 1);
    renderEvents();
};
// Function to delete an event
window.deleteEvent = function (index) {
    events.splice(index, 1);
    renderEvents();
};
// Function for pagination - go to previous page
function prev() {
    if (currentPage > 1) {
        currentPage--;
        renderEvents();
    }
}
// Function for pagination - go to next page
function next() {
    if (events.length > currentPage * itemsPerPage) {
        currentPage++;
        renderEvents();
    }
}
// Function to schedule alarm for upcoming events
function scheduleAlarm(event) {
    var eventTime = new Date("".concat(event.date, "T").concat(event.time));
    var now = new Date();
    var timeDifference = eventTime.getTime() - now.getTime();
    if (timeDifference > 0) {
        setTimeout(function () {
            requestAnimationFrame(function () {
                triggerAlarm(event);
            });
        }, timeDifference);
    }
    else {
        triggerAlarm(event);
    }
}
// Function to trigger alarm and alert for an event
function triggerAlarm(event) {
    // Play alarm sound
    audio.play();
    // Display alert immediately after starting the audio
    requestAnimationFrame(function () {
        alert("Time for the event: ".concat(event.name));
        // Additional alarm actions can be added here
        // Remove the event from the upcoming events list
        events = events.filter(function (e) { return e !== event; });
        renderEvents();
    });
}
// Function to update upcoming events within 10 minutes
function updateUpcomingEvents() {
    var now = new Date();
    upcomingEvents.innerHTML = ""; // Clear previous upcoming events
    events.forEach(function (event) {
        var eventTime = new Date("".concat(event.date, "T").concat(event.time));
        var timeDifference = eventTime.getTime() - now.getTime();
        if (timeDifference > 0 && timeDifference <= 10 * 60 * 1000) { // 10 minutes in milliseconds
            var card = document.createElement("div");
            card.className = "card bg-warning mb-3"; // Increase card size
            card.innerHTML = "\n                <div class=\"card-body\">\n                    <h5 class=\"card-title\">".concat(event.name, "</h5>\n                    <p class=\"card-text\">").concat(event.date, " at ").concat(event.time, "</p>\n                </div>\n            ");
            upcomingEvents.appendChild(card);
        }
    });
}
