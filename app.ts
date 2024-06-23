// Define an interface for the custom event object
interface EventItem {
    name: string;
    date: string;
    time: string;
}

// Initialize empty events array
let events: EventItem[] = [];

// Initialize variables
let currentPage: number = 1;
const itemsPerPage: number = 5;

// DOM elements
const form = document.getElementById("event-form") as HTMLFormElement;
const eventList = document.getElementById("event-list") as HTMLUListElement;
const upcomingEvents = document.getElementById("upcoming-events") as HTMLDivElement;
const search = document.getElementById("search") as HTMLInputElement;
const sort = document.getElementById("sort") as HTMLSelectElement;
const prevPage = document.getElementById("prev-page") as HTMLAnchorElement;
const nextPage = document.getElementById("next-page") as HTMLAnchorElement;

// Preload alarm audio
const audio = new Audio('alarm.wav');
audio.preload = 'auto';

// Render initial events on page load
document.addEventListener("DOMContentLoaded", () => {
    renderEvents();
});

// Event listeners
form.addEventListener("submit", event => {
    event.preventDefault();
    addEvent();
});

search.addEventListener("input", renderEvents);
sort.addEventListener("change", renderEvents);
prevPage.addEventListener("click", prev);
nextPage.addEventListener("click", next);

// Function to add a new event
function addEvent() {
    const eventName = (document.getElementById("event-name") as HTMLInputElement).value;
    const eventDate = (document.getElementById("event-date") as HTMLInputElement).value;
    const eventTime = (document.getElementById("event-time") as HTMLInputElement).value;

    const eventObj: EventItem = { name: eventName, date: eventDate, time: eventTime };
    events.push(eventObj);
    form.reset();
    renderEvents();
    scheduleAlarm(eventObj);
}

// Function to render events based on filters and pagination
function renderEvents() {
    const filteredEvents = events.filter(event =>
        event.name.toLowerCase().includes(search.value.toLowerCase())
    );

    const sortedEvents = filteredEvents.sort((a, b) => {
        if (sort.value === "name") {
            return a.name.localeCompare(b.name);
        } else {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
    });

    const paginatedEvents = sortedEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    eventList.innerHTML = "";
    paginatedEvents.forEach((event, index) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
            <div>
                <h5>${event.name}</h5>
                <small>${event.date} at ${event.time}</small>
            </div>
            <div>
                <button class="btn btn-info btn-sm mr-2" onclick="editEvent(${events.indexOf(event)})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteEvent(${events.indexOf(event)})">Delete</button>
            </div>
        `;
        eventList.appendChild(li);
    });

    prevPage?.parentElement?.classList.toggle("disabled", currentPage === 1);
    nextPage?.parentElement?.classList.toggle("disabled", paginatedEvents.length < itemsPerPage);

    // Update upcoming events
    updateUpcomingEvents();
}

// Function to edit an event
(window as any).editEvent = function (index: number) {
    const event = events[index];
    (document.getElementById("event-name") as HTMLInputElement).value = event.name;
    (document.getElementById("event-date") as HTMLInputElement).value = event.date;
    (document.getElementById("event-time") as HTMLInputElement).value = event.time;

    events.splice(index, 1);
    renderEvents();
};

// Function to delete an event
(window as any).deleteEvent = function (index: number) {
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
function scheduleAlarm(event: EventItem) {
    const eventTime = new Date(`${event.date}T${event.time}`);
    const now = new Date();
    const timeDifference = eventTime.getTime() - now.getTime();

    if (timeDifference > 0) {
        setTimeout(() => {
            requestAnimationFrame(() => {
                triggerAlarm(event);
            });
        }, timeDifference);
    } else {
        triggerAlarm(event);
    }
}

// Function to trigger alarm and alert for an event
function triggerAlarm(event: EventItem) {
    // Play alarm sound
    audio.play();

    // Display alert immediately after starting the audio
    requestAnimationFrame(() => {
        alert(`Time for the event: ${event.name}`);
        // Additional alarm actions can be added here

        // Remove the event from the upcoming events list
        events = events.filter(e => e !== event);
        renderEvents();
    });
}

// Function to update upcoming events within 10 minutes
function updateUpcomingEvents() {
    const now = new Date();
    upcomingEvents.innerHTML = ""; // Clear previous upcoming events

    events.forEach(event => {
        const eventTime = new Date(`${event.date}T${event.time}`);
        const timeDifference = eventTime.getTime() - now.getTime();

        if (timeDifference > 0 && timeDifference <= 10 * 60 * 1000) { // 10 minutes in milliseconds
            const card = document.createElement("div");
            card.className = "card bg-warning mb-3"; // Increase card size
            card.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${event.name}</h5>
                    <p class="card-text">${event.date} at ${event.time}</p>
                </div>
            `;
            upcomingEvents.appendChild(card);
        }
    });
}
