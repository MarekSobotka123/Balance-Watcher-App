// Fuction to load the config from indexedDB database, no idea what's happening
function loadConfig() {
    // Start a transaction
    const transaction = db.transaction('config', 'readonly');

    // Access the 'config' object store
    const configStore = transaction.objectStore('config');

    // Get the 'current_date' key
    const getDateRequest = configStore.get('current_date');

    getDateRequest.onsuccess = function (event) {
        const currentDate = event.target.result;

        if (currentDate) {
            console.log('Current Date:', currentDate.value.split('/')[2]);

            // Update the UI with the current date
            const currentDateDisplay = document.getElementById('current_date_display');
            if (currentDateDisplay) {
                currentDateDisplay.textContent = currentDate.value;
            }
        } else {
            console.log('Current Date not found');
        }
    };

    getDateRequest.onerror = function (event) {
        console.error('Error loading current date:', event.target.error);
    };

    // Get the 'avatar_path' key (as before)
    const getAvatarRequest = configStore.get('avatar_path');

    getAvatarRequest.onsuccess = function (event) {
        const avatarPath = event.target.result;

        if (avatarPath) {
            console.log('Avatar Path:', avatarPath.value);

            // Update the UI with the avatar path
            const avatarImage = document.getElementById('avatar_image');
            if (avatarImage) {
                avatarImage.src = avatarPath.value;
            }
        } else {
            console.log('Avatar Path not found');
        }
    };

    getAvatarRequest.onerror = function (event) {
        console.error('Error loading avatar path:', event.target.error);
    };
    
}
// Function to load the current date and update date_button text, kinda know how it should work
function loadCurrentDate() {
    // Get the current date
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1; // Months are zero-indexed
    const year = currentDate.getFullYear();

    // Load the day, month, and year spinners
    loadSpinner('daySpinner', 1, 31, day);
    loadSpinner('monthSpinner', 1, 12, month);
    loadSpinner('yearSpinner', 2020, 2050, year);

    // Format the current date in DD/MM/YYYY
    const formattedCurrentDate = formatDateForDisplay(day, month, year);

    // Update the date_button text with the formatted current date
    const currentDateDisplay = document.getElementById('currentDateDisplay');
    if (currentDateDisplay) {
        currentDateDisplay.textContent = formattedCurrentDate;
    }

}

// Now, the next functions will be used in homescreen.html only
// Function to open the date selection popup
function openDateSelectionPopup() {
    console.log("Data Selection Popup successfully opened in HomeScreen")
    document.getElementById('dateSelectionPopup').style.display = 'block';
    loadCurrentDate(); // Load the current date when the popup is opened
}
// Function to hide the date selection popup
function hideDateSelectionPopup() {
    console.log("Data Selection Popup successfully closed in HomeScreen")
    document.getElementById('dateSelectionPopup').style.display = 'none';
}
// Function to load Avatar Grid (in ), no idea what's happening, but it works so don't touch it!!!
function loadAvatarGrid() {
    const avatarGrid = document.getElementById('avatarGrid');

    // Array of avatar paths
    const avatarPaths = [
        '/img/man_1.png',
        '/img/man_2.png',
        '/img/man_3.png',
        '/img/man_4.png',
        '/img/man_5.png',
        '/img/man_6.png',
        '/img/man_7.png',
        '/img/woman_1.png',
        '/img/woman_2.png',
        '/img/woman_3.png',
        '/img/woman_4.png',
        '/img/woman_5.png',
        '/img/woman_6.png',
        '/img/woman_7.png',
        '/img/woman_8.png'                
    ];

    // Clear existing grid content
    avatarGrid.innerHTML = '';

    // Dynamically create grid elements
    avatarPaths.forEach(path => {
        const avatarImage = document.createElement('img');
        avatarImage.src = path;
        avatarImage.onclick = () => selectAvatar(path);
        avatarGrid.appendChild(avatarImage);
    });
}
// Open Avatar Popup (in )
function openAvatarPopup() {
    document.getElementById('avatarPopup').style.display = 'block';
    loadAvatarGrid(); // Load avatar grid when the popup is opened
}
// Also the closing (in )
function closeAvatarPopup() {
    document.getElementById('avatarPopup').style.display = 'none';
}
// End of the functions for the  only

// TODO: make the same thing for the balance screen
// End of the functions for the BS only


// Function to format the date for display in DD. MM. YYYY format
function formatDateForDisplay(day, month, year) {
    // Format the date as DD/MM/YYYY
    return `${day.toString().padStart(2)}. ${month.toString().padStart(2)}. ${year}`;
}
// Function to load a spinner
function loadSpinner(spinnerId, start, end, selectedValue) {
    const spinner = document.getElementById(spinnerId);

    // Create a select element
    const select = document.createElement('select');

    // Load options for each value in the range
    for (let i = start; i <= end; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.text = i;
        select.appendChild(option);
    }

    // Set the selected value
    select.value = selectedValue;

    // Append the select element to the spinner
    spinner.innerHTML = '';
    spinner.appendChild(select);
}
// Function to update the 'current_date' key in the config table
function updateCurrentDate(selectedDate) {
    // Start a transaction
    const transaction = db.transaction('config', 'readwrite');

    // Access the 'config' object store
    const configStore = transaction.objectStore('config');

    // Update the 'current_date' key with the selected date in DD/MM/YYYY format
    const formattedDate = formatDateForStorage(selectedDate);
    console.log('formated date:',formattedDate.split('/')[2])
    const currentDateObject = {
        key: 'current_date',
        value: formattedDate
    };

    // Add or update the 'current_date' key in the config table
    configStore.put(currentDateObject);

    console.log('Current Date updated successfully');
}
// Function to format the date for storage in DD/MM/YYYY format
function formatDateForStorage(selectedDate) {
    const parts = selectedDate.split('-');
    const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    return formattedDate;
}
// Function to update the selected date
function updateSelectedDate() {
    const selectedDay = document.getElementById('daySpinner').getElementsByTagName('select')[0].value;
    const selectedMonth = document.getElementById('monthSpinner').getElementsByTagName('select')[0].value;
    const selectedYear = document.getElementById('yearSpinner').getElementsByTagName('select')[0].value;

    // Construct the selected date string
    const selectedDate = `${selectedDay}. ${selectedMonth}. ${selectedYear}`;

    // Update the button label with the selected date
    document.getElementById('date_button').innerText = `${selectedDate}`;

    // Update the 'current_date' key in the config table
    updateCurrentDate(selectedDate);

    // Hide the date selection popup
    hideDateSelectionPopup();
}


// Function to update the avatar path with selected avatar
function selectAvatar(path) {
    // Update the UI with the selected avatar
    const avatarImage = document.getElementById('avatar_image');
    if (avatarImage) {
        avatarImage.src = path;
    }

    // Update the 'avatar_path' in the database
    addAvatarPath(path);

    // Close the avatar popup (in )
    closeAvatarPopup();
}
// Adding Avatar Path to Database (works for both Screens)
function addAvatarPath(path) {
    // Start a transaction
    const transaction = db.transaction('config', 'readwrite');

    // Access the 'config' object store
    const configStore = transaction.objectStore('config');

    // Check if the 'avatar_path' key already exists (in config)
    const getRequest = configStore.get('avatar_path');
    getRequest.onsuccess = function (event) {
        const existingAvatar = event.target.result;

        if (!existingAvatar) {
            // Add the 'avatar_path' key
            const addRequest = configStore.add({
                key: 'avatar_path',
                value: path
            });

            addRequest.onsuccess = function (event) {
                console.log('Avatar Path added successfully');
                loadAvatar(); // Update the UI with the new avatar path
            };

            addRequest.onerror = function (event) {
                console.error('Error adding avatar path:', event.target.error);
            };
        } else {
            // Update the existing 'avatar_path' key
            existingAvatar.value = path;
            configStore.put(existingAvatar);

            console.log('Avatar Path updated successfully');
            loadAvatar(); // Update the UI with the new avatar path
        }
    };
}
// 
function loadAvatar() {
    // Start a transaction
    const transaction = db.transaction('config', 'readonly');

    // Access the 'config' object store
    const configStore = transaction.objectStore('config');

    // Get the 'avatar_path' key
    const getRequest = configStore.get('avatar_path');

    getRequest.onsuccess = function (event) {
        const avatarPath = event.target.result;

        if (avatarPath) {
            console.log('Avatar Path:', avatarPath.value);

            // Update the UI with the avatar path
            const avatarImage = document.getElementById('avatar_image');
            if (avatarImage) {
                avatarImage.src = avatarPath.value;
            }
        } else {
            console.log('Avatar Path not found');
        }
    };

    getRequest.onerror = function (event) {
        console.error('Error loading avatar path:', event.target.error);
    };
}


// Showing and Hiding the Settins Screen, works only in , because there's no button for it in BS
function showSettingsScreen() {
    // Slide up the settings screen
    document.querySelector('.settings-screen').style.transform = 'translateY(0)';

    // Load content from settingsscreen.html
    fetch('/pages/settings_screen.html')
        .then(response => response.text())
        .then(html => {
            document.querySelector('.settings-screen .screen-content').innerHTML = html;
        })
        .catch(error => console.error('Error fetching settings_screen.html:', error));
}
function hideSettingsScreen() {
    // Slide down the settings screen
    document.querySelector('.settings-screen').style.transform = 'translateY(100%)';
}