// Array to store guest data
let guests = [];
const MAX_GUESTS = 10;

// Get DOM elements
const guestForm = document.getElementById('guest-form');
const guestNameInput = document.getElementById('guest-name-input');
const guestCategorySelect = document.getElementById('guest-category-select');
const guestList = document.getElementById('guest-list');
const guestCountSpan = document.getElementById('guest-count');
const messageBox = document.getElementById('message-box');
const messageText = document.getElementById('message-text');

/**
* Displays a message in the message box.
* @param {string} message - The message to display.
* @param {string} type - The type of message (e.g., 'info', 'error').
*/
function showMessage(message, type = 'info') {
    messageText.textContent = message;
    messageBox.classList.remove('hidden', 'bg-blue-100', 'border-blue-400', 'text-blue-700', 'bg-red-100', 'border-red-400', 'text-red-700');
    if (type === 'error') {
        messageBox.classList.add('bg-red-100', 'border-red-400', 'text-red-700');
    } else {
        messageBox.classList.add('bg-blue-100', 'border-blue-400', 'text-blue-700');
    }
    messageBox.classList.remove('hidden');
    setTimeout(() => {
        messageBox.classList.add('hidden');
    }, 3000); // Hide after 3 seconds
}

/**
* Renders the guest list to the DOM.
*/
function renderGuestList() {
    guestList.innerHTML = ''; // Clear existing list
    guestCountSpan.textContent = guests.length;

    guests.forEach((guest, index) => {
        const li = document.createElement('li');
        li.id = `guest-${guest.id}`;
        li.className = `guest-item ${guest.attending ? 'attending' : 'not-attending'}`;

        // Guest name and category
        const guestInfo = document.createElement('div');
        guestInfo.className = 'flex items-center flex-wrap gap-2';

        const categoryTag = document.createElement('span');
        categoryTag.textContent = guest.category;
        categoryTag.className = `category-tag category-${guest.category.toLowerCase()} flex-shrink-0`; // Apply Tailwind color classes

        const guestNameDisplay = document.createElement('span');
        guestNameDisplay.className = 'text-lg font-medium text-gray-800 flex-grow';
        guestNameDisplay.textContent = guest.name;

        guestInfo.appendChild(categoryTag);
        guestInfo.appendChild(guestNameDisplay);


        // Timestamp
        const timestampSpan = document.createElement('span');
        const date = new Date(guest.addedTime);
        timestampSpan.textContent = `Added: ${date.toLocaleString()}`;
        timestampSpan.className = 'text-sm text-gray-500 ml-4 hidden sm:block'; // Hide on small screens

        guestInfo.appendChild(timestampSpan);


        // Buttons container
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'flex gap-2 flex-wrap justify-end';

        // Edit button
        const editButton = document.createElement('button');
        editButton.className = 'action-button edit-button';
        editButton.innerHTML = '<i class="fas fa-edit"></i> <span class="hidden sm:inline">Edit</span>';
        editButton.onclick = () => enableEditMode(guest.id);
        buttonsDiv.appendChild(editButton);

        // Toggle RSVP button
        const toggleRsvpButton = document.createElement('button');
        toggleRsvpButton.className = 'action-button toggle-button';
        toggleRsvpButton.innerHTML = guest.attending ? '<i class="fas fa-user-check"></i> <span class="hidden sm:inline">Attending</span>' : '<i class="fas fa-user-times"></i> <span class="hidden sm:inline">Not Attending</span>';
        toggleRsvpButton.onclick = () => toggleRsvp(guest.id);
        buttonsDiv.appendChild(toggleRsvpButton);

        // Remove button
        const removeButton = document.createElement('button');
        removeButton.className = 'action-button delete-button';
        removeButton.innerHTML = '<i class="fas fa-trash-alt"></i> <span class="hidden sm:inline">Remove</span>';
        removeButton.onclick = () => removeGuest(guest.id);
        buttonsDiv.appendChild(removeButton);

        li.appendChild(guestInfo);
        li.appendChild(buttonsDiv);
        guestList.appendChild(li);
    });
}

/**
* Adds a new guest to the list.
* @param {Event} event - The form submission event.
*/
function addGuest(event) {
    event.preventDefault(); // Prevent page reload

    const guestName = guestNameInput.value.trim();
    const guestCategory = guestCategorySelect.value;

    if (!guestName) {
        showMessage('Please enter a guest name.', 'error');
        return;
    }

    if (guests.length >= MAX_GUESTS) {
        showMessage(`The guest list is limited to ${MAX_GUESTS} people.`, 'error');
        return;
    }

    // Generate a unique ID for the guest
    const newGuest = {
        id: Date.now().toString(), // Simple unique ID
        name: guestName,
        category: guestCategory,
        attending: true, // Default to attending
        addedTime: new Date().toISOString() // Store ISO string for consistency
    };

    guests.push(newGuest);
    guestNameInput.value = ''; // Clear input
    renderGuestList();
}

/**
* Removes a guest from the list by their ID.
* @param {string} id - The unique ID of the guest to remove.
*/
function removeGuest(id) {
    guests = guests.filter(guest => guest.id !== id);
    renderGuestList();
}

/**
* Toggles the RSVP status of a guest.
* @param {string} id - The unique ID of the guest to toggle.
*/
function toggleRsvp(id) {
    guests = guests.map(guest => guest.id === id ? { ...guest, attending: !guest.attending } : guest);
    renderGuestList();
}

/**
* Enables edit mode for a specific guest item.
* @param {string} id - The unique ID of the guest to edit.
*/
function enableEditMode(id) {
    const guestItem = document.getElementById(`guest-${id}`);
    if (!guestItem) return;

    const guest = guests.find(g => g.id === id);
    if (!guest) return;

    // Save current content
    const originalGuestInfo = guestItem.querySelector('div:first-child');
    const originalButtonsDiv = guestItem.querySelector('div:last-child');
    const originalGuestNameDisplay = originalGuestInfo.querySelector('.text-lg');

    // Create edit elements
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.value = guest.name;
    editInput.className = 'flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400';

    const saveButton = document.createElement('button');
    saveButton.className = 'action-button save-button';
    saveButton.innerHTML = '<i class="fas fa-save"></i> <span class="hidden sm:inline">Save</span>';
    saveButton.onclick = () => saveEditedGuest(id, editInput.value);

    const cancelButton = document.createElement('button');
    cancelButton.className = 'action-button cancel-button';
    cancelButton.innerHTML = '<i class="fas fa-times"></i> <span class="hidden sm:inline">Cancel</span>';
    cancelButton.onclick = () => renderGuestList(); // Re-render to revert

    // Replace content in the guest item
    guestItem.innerHTML = ''; // Clear existing content
    const editContainer = document.createElement('div');
    editContainer.className = 'flex items-center flex-grow gap-2 sm:gap-4 flex-wrap';
    editContainer.appendChild(guest.category ? originalGuestInfo.querySelector('.category-tag').cloneNode(true) : document.createElement('span')); // Re-add category tag
    editContainer.appendChild(editInput);

    const editButtons = document.createElement('div');
    editButtons.className = 'flex gap-2 flex-wrap justify-end';
    editButtons.appendChild(saveButton);
    editButtons.appendChild(cancelButton);

    guestItem.appendChild(editContainer);
    guestItem.appendChild(editButtons);

    editInput.focus(); // Focus the input field
}

/**
* Saves the edited guest name.
* @param {string} id - The unique ID of the guest.
* @param {string} newName - The new name for the guest.
*/
function saveEditedGuest(id, newName) {
    const trimmedName = newName.trim();
    if (!trimmedName) {
        showMessage('Guest name cannot be empty.', 'error');
        return;
    }

    guests = guests.map(guest => guest.id === id ? { ...guest, name: trimmedName } : guest); renderGuestList();
        showMessage('Guest name updated successfully!', 'info');
}

// Event Listeners
guestForm.addEventListener('submit', addGuest);

// Initial render on page load
window.onload = renderGuestList;