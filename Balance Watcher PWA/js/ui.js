let idb; // for a global use of the database

// Function to initialize the app
function initializeApp() {
    console.log('initializing the app now...');
    console.time('initialization time');

    // Check if this is the first launch or a reopening
    const isFirstLaunch = !localStorage.getItem('appLaunched');
    
    if (isFirstLaunch) {
        // First launch or reopening after force close
        console.log('First launch or reopening after force close');

        // Update the selected day to the current day
        const currentDay = new Date().toLocaleDateString('cs-CZ');
        updateCurrentDate(currentDay);

        // Set the flag to indicate that the app has been launched
        localStorage.setItem('appLaunched', 'true');
    }

    // Load the existing configuration
    loadConfig();
    loadCurrentDate();

    // Call the new function to get the days of the week based on the selected date

    
    // Add other initialization tasks as needed
    console.timeEnd('initialization time');
}

// Function to load the config from IndexedDB database
function loadConfig() {
    if (!idb) {
        console.error('IDB is not initialized!');
        return;
    }

    // Start a transaction
    const transaction = idb.transaction('config', 'readonly');

    // Access the 'config' object store
    const configStore = transaction.objectStore('config');

    // Get the 'selected_day' key
    const getDateRequest = configStore.get('selected_day');

    getDateRequest.onsuccess = function (event) {
        const currentDate = event.target.result;
        // console.log('currentDate = ', currentDate);

        if (currentDate) {
            // console.log('Current Date:', currentDate.value);

            // Update the UI with the current date
            const currentDateDisplay = document.getElementById('currentDateDisplay');
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

    // Get the 'selected_day' key
    const getPeriodRequest = configStore.get('period');

    getPeriodRequest.onsuccess = function (event) {
        const currentPeriod = event.target.result;
        // console.log('currentPeriod = ', currentPeriod);

        if (currentPeriod) {
            // console.log('Current Period:', currentPeriod.value);

            // Update the UI with the current period
            const currentPeriodDisplay = document.getElementById('currentPeriodDisplay');
            if (currentPeriodDisplay) {
                currentPeriodDisplay.textContent = currentPeriod.value;
            }
            
            // Update the UI with the current period
            const currentPeriodDisplayText = document.getElementById('period_for_balance');
            if (currentPeriodDisplayText) {
                currentPeriodDisplayText.textContent = currentPeriod.value;
            }
        // console.log('updating UI with period')
        getDatesFromConfig(currentPeriod.value);
        } else {
            console.log('Current Period not found');
        }
    };

    getPeriodRequest.onerror = function (event) {
        console.error('Error loading current date:', event.target.error);
    };

    // Get the 'avatar_path' key
    const getAvatarRequest = configStore.get('avatar_path');

    getAvatarRequest.onsuccess = function (event) {
        const avatarPath = event.target.result;

        if (avatarPath) {
            // console.log('Avatar Path:', avatarPath.value);
            

            // Update the UI with the avatar path
            const avatarImage = document.getElementById('avatar_image');
            if (avatarImage) {
                avatarImage.src = avatarPath.value;
            }
        } else {
            // console.log('Avatar Path not found');
        }
    };

    getAvatarRequest.onerror = function (event) {
        console.error('Error loading avatar path:', event.target.error);
    };
}

function openPeriodPopup() {
    // console.log("Period Selection Popup successfully opened")
    document.getElementById('periodSelectionPopup').style.display = 'block';
}

function hidePeriodPopup() {
    // console.log("Period Selection Popup successfully closed")
    document.getElementById('periodSelectionPopup').style.display = 'none';
}

// Function to open the date selection popup
function openDateSelectionPopup() {
    // console.log("Data Selection Popup successfully opened")
    document.getElementById('dateSelectionPopup').style.display = 'block';
}

// Function to hide the date selection popup
function hideDateSelectionPopup() {
    // console.log("Data Selection Popup successfully closed")
    document.getElementById('dateSelectionPopup').style.display = 'none';
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

    // Update the 'selected_day' key in the config table
    updateCurrentDate(selectedDate);

    // Hide the date selection popup
    hideDateSelectionPopup();
}

// Function to format the date for display in DD. MM. YYYY format
function formatDateForDisplay(day, month, year) {
    const formatted_date = `${day.toString()}. ${month.toString()}. ${year}`
    return formatted_date;
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

// Function to update the 'selected_day' key in the config table
function updateCurrentDate(selectedDate) {
    // Start a transaction
    const transaction = idb.transaction('config', 'readwrite');

    // Access the 'config' object store
    const configStore = transaction.objectStore('config');

    const currentDateObject = {
        key: 'selected_day',
        value: selectedDate
    };

    // Add or update the 'selected_day' key in the config table
    configStore.put(currentDateObject);

    loadConfig()

    // console.log('Current Date updated successfully');
}

// Function to update the 'selected_day' key in the config table
function updatePeriod(period) {
    // Start a transaction
    const transaction = idb.transaction('config', 'readwrite');

    // Access the 'config' object store
    const configStore = transaction.objectStore('config');

    const currentDateObject = {
        key: 'period',
        value: period
    };

    // Add or update the 'selected_day' key in the config table
    configStore.put(currentDateObject);
    // console.log('Config updated with', currentDateObject)

    // console.log('Period updated successfully');

    loadConfig()  
    // console.log('updating period in config...')
    getDatesFromConfig(period);

    hidePeriodPopup();
}

// Function to calculate balance for display
function balanceForDisplay(dateRange) {
    // Loading text to indicate that it isnt broaken it just takes time
    document.getElementById('balance_for_period').textContent = 'Loading...';
    document.getElementById('balance_for_period').className = 'white-text';
    var balance = 0;
    var earningsForPeriod = 0;
    var spendingForPeriod = 0;

    // Get an array of dates in the specified range
    const dateArray = getDatesInRange(dateRange);

    // Create an array of promises for each date
    const promises = dateArray.map((selectedDay) => {
        // Call the function to get earnings and spendings for the date
        return getEarningsAndSpendingsForDate(selectedDay);
    });

    // Use Promise.all to wait for all promises to resolve
    Promise.all(promises)
        .then((results) => {
            // console.log('=========================================================================================================================');
            // Loop through the results and accumulate earnings and spendings
            results.forEach((result) => {
                // console.log('Earnings for ' + result.selectedDay + ':', result.sumOfEarnings);
                // console.log('Spendings for ' + result.selectedDay + ':', result.sumOfSpendings);

                // Accumulate earnings and spendings for the period
                earningsForPeriod += result.sumOfEarnings;
                spendingForPeriod += result.sumOfSpendings;
            });
            
            // Update the balance variable accordingly
            // console.log('earningsForPeriod:', earningsForPeriod)
            // console.log('spendingsForPeriod:', spendingForPeriod)
            balance = earningsForPeriod - spendingForPeriod;
            // console.log('Balance for the period:', balance);
            
            // console.log('=========================================================================================================================');
            // Update the UI with the current period
            const balanceForPeriod = document.getElementById('balance_for_period');
            if (balanceForPeriod) {
                balanceForPeriod.textContent = balance;
            }
            
            if (balance > 0) {
                balanceForPeriod.className = 'green-text';
            } else if (balance < 0) {
                balanceForPeriod.className = 'red-text';
            } else {
                balanceForPeriod.className = 'blue-text';
            }

        })
        .catch((error) => {
            console.error('Error:', error);
        });
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

    // Close the avatar popup
    closeAvatarPopup();
}

// Adding Avatar Path to Database
function addAvatarPath(path) {
    // Start a transaction
    const transaction = idb.transaction('config', 'readwrite');

    // Access the 'config' object store
    const configStore = transaction.objectStore('config');

    // Check if the 'avatar_path' key already exists
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
                // console.log('Avatar Path added successfully');
                loadAvatar(); // Update the UI with the new avatar path
            };

            addRequest.onerror = function (event) {
                console.error('Error adding avatar path:', event.target.error);
            };
        } else {
            // Update the existing 'avatar_path' key
            existingAvatar.value = path;
            configStore.put(existingAvatar);

            // console.log('Avatar Path updated successfully');
            loadAvatar(); // Update the UI with the new avatar path
        }
    };
}

// Function to load Avatar
function loadAvatar() {
    // Start a transaction
    const transaction = idb.transaction('config', 'readonly');

    // Access the 'config' object store
    const configStore = transaction.objectStore('config');

    // Get the 'avatar_path' key
    const getRequest = configStore.get('avatar_path');

    getRequest.onsuccess = function (event) {
        const avatarPath = event.target.result;

        if (avatarPath) {
            // console.log('Avatar Path:', avatarPath.value);

            // Update the UI with the avatar path
            const avatarImage = document.getElementById('avatar_image');
            if (avatarImage) {
                avatarImage.src = avatarPath.value;
            }
        } else {
            // console.log('Avatar Path not found');
        }
    };

    getRequest.onerror = function (event) {
        console.error('Error loading avatar path:', event.target.error);
    };
}

// Function to load the current date and update date_button text
function loadCurrentDate() {
    // Get the current date
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1; // Months are zero-indexed
    const year = currentDate.getFullYear();

    // Load the day, month, and year spinners
    loadSpinner('daySpinner', 1, 31, day);
    loadSpinner('monthSpinner', 1, 12, month);
    loadSpinner('yearSpinner', 2020, 2100, year);

    const formattedCurrentDate = formatDateForDisplay(day, month, year);
    // console.log('formattedCurrentDate:', formattedCurrentDate);

    // Update the date_button text with the formatted current date
    const currentDateDisplay = document.getElementById('currentDateDisplay');
    if (currentDateDisplay) {
        currentDateDisplay.textContent = formattedCurrentDate;
    }
}

// Function to load Avatar Grid
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

// Function to open Avatar Popup
function openAvatarPopup() {
    document.getElementById('avatarPopup').style.display = 'block';
    loadAvatarGrid(); // Load avatar grid when the popup is opened
}

// Function to close Avatar Popup
function closeAvatarPopup() {
    document.getElementById('avatarPopup').style.display = 'none';
}

// Function to open Error Popup
function openErrorPopup() {
    document.getElementById('errorPopup').style.display = 'block';
}

// Function to close Error Popup
function closeErrorPopup() {
    document.getElementById('errorPopup').style.display = 'none';
}

function openModifyPopup() {
    getDataForModifyTable();
    document.getElementById('modifyPopup').style.display = 'block';
}

function closeModifyPopup() {
    document.getElementById('modifyPopup').style.display = 'none';
    getEarningsAndSpendingsForDateToUpdateChart();
}

function closeRUSPopup() {
    document.getElementById('rusPopup').style.display = 'none';
}

function openSignupPopup() {
    document.getElementById('signupPopup').style.display = 'block';
}

function closeSignupPopup() {
    document.getElementById('signupPopup').style.display = 'none';
    const signupForm = document.querySelector('#signup-form');
    signupForm.reset();
}

function openLoginPopup() {
    document.getElementById('loginPopup').style.display = 'block';
}

function closeLoginPopup() {
    document.getElementById('loginPopup').style.display = 'none';
    const loginForm = document.querySelector('#login-form');
    loginForm.reset();
    document.getElementById('error-login-text').style.display = 'none';
}

function openLogoutPopup() {
    document.getElementById('logoutPopup').style.display = 'block';
}
function closeLogoutPopup() {
    document.getElementById('logoutPopup').style.display = 'none';
}

// Function to get the start and end dates based on the selected date from the config table
function getDatesFromConfig(periodType) {
    if (!idb) {
        console.error('IDB is not initialized!');
        return;
    }

    // Start a transaction
    const transaction = idb.transaction('config', 'readonly');

    // Access the 'config' object store
    const configStore = transaction.objectStore('config');

    // Get the 'selected_day' key
    const getDateRequest = configStore.get('selected_day');

    getDateRequest.onsuccess = function (event) {
        const currentDate = event.target.result;

        if (currentDate) {
            // console.log('Current Date:', currentDate.value);

            // Parse the selected date as a JavaScript Date object
            const dateParts = currentDate.value.split('.').map(part => parseInt(part, 10));
            const selectedDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
            
            // Call the function to get the start and end dates based on the selected date and period type
            const dateRange = getDateRange(selectedDate, periodType);
            balanceForDisplay(dateRange);
            const datesArray = getDatesInRange(dateRange);
            
            // console.log('=========================================================================================================================');
            // console.log('periodType: ', periodType)
            // console.log(`Start of the ${periodType}:`, dateRange.start);
            // // console.log(datesArray);
            // console.log(`End of the ${periodType}:`, dateRange.end);
            // console.log('=========================================================================================================================');
            



            // You can use dateRange.start and dateRange.end as needed
        } else {
            // console.log('Current Date not found');
        }
    };

    getDateRequest.onerror = function (event) {
        console.error('Error loading current date:', event.target.error);
    };
}

// Function to parse date strings in 'DD. MM. YYYY' format
function parseDate(dateString) {
    const dateParts = dateString.split('.').map(part => parseInt(part.trim(), 10));

    // Month is zero-indexed in JavaScript Date, so subtract 1 from the month
    return new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
}

function getDatesInRange(dateRange) {
    const startDate = parseDate(dateRange.start);
    // console.log('startDate:', startDate)
    const endDate = parseDate(dateRange.end);
    // console.log('endDate:', endDate)
    const datesArray = [];

    // Iterate over the days and push each date to the array
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        datesArray.push(formatDateForDisplay(currentDate.getDate(), currentDate.getMonth() + 1, currentDate.getFullYear()));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return datesArray;
}

// Function to get the start and end dates based on the selected date and period type
function getDateRange(selectedDate, periodType) {
    let start, end;

    switch (periodType) {
        case 'week':
            // console.log('parsing the date:', selectedDate);
            const weekDates = getDaysInSameWeek(selectedDate);
            start = weekDates.startOfWeek;
            end = weekDates.endOfWeek;

            break;
        case 'month':
            const monthDates = getStartAndEndOfMonth(selectedDate);
            start = monthDates.startOfMonth;
            end = monthDates.endOfMonth;
            break;
        case 'year':
            const yearDates = getStartAndEndOfYear(selectedDate);
            start = yearDates.startOfYear;
            end = yearDates.endOfYear;
            break;
        default:
            console.error('Invalid period type');
    }

    return { start, end };
}

// Example function to get the days of the week based on a given date
function getDaysInSameWeek(date) {
    const currentDay = date.getDay();
    const diff = date.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // Adjust when the current day is Sunday
    const startOfWeek = new Date(date);
    startOfWeek.setDate(diff);

    const endOfWeek = new Date(date);
    endOfWeek.setDate(diff + 6);

    // Format the dates in DD. MM. YYYY format
    const formattedStartOfWeek = formatDateForDisplay(startOfWeek.getDate(), startOfWeek.getMonth() + 1, startOfWeek.getFullYear());
    const formattedEndOfWeek = formatDateForDisplay(endOfWeek.getDate(), endOfWeek.getMonth() + 1, endOfWeek.getFullYear());

    return { startOfWeek: formattedStartOfWeek, endOfWeek: formattedEndOfWeek };
}

function getStartAndEndOfMonth(date) {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const formattedStartOfMonth = formatDateForDisplay(startOfMonth.getDate(), startOfMonth.getMonth() + 1, startOfMonth.getFullYear());
    const formattedEndOfMonth = formatDateForDisplay(endOfMonth.getDate(), endOfMonth.getMonth() + 1, endOfMonth.getFullYear());

    return { startOfMonth: formattedStartOfMonth, endOfMonth: formattedEndOfMonth };
}

function getStartAndEndOfYear(date) {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const endOfYear = new Date(date.getFullYear(), 12, 0);

    const formattedStartOfYear = formatDateForDisplay(startOfYear.getDate(), startOfYear.getMonth() + 1, startOfYear.getFullYear());
    const formattedEndOfYear = formatDateForDisplay(endOfYear.getDate(), endOfYear.getMonth() + 1, endOfYear.getFullYear());

    return { startOfYear: formattedStartOfYear, endOfYear: formattedEndOfYear };
}





// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Initialize IndexedDB
    idb = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

    if (!idb) {
        console.error('IndexedDB is not supported.');
    } else {
        console.log('IndexedDB is supported.');
        // Open or create the main_db database
        const dbRequest = window.indexedDB.open('main_db');

        dbRequest.onerror = function (event) {
            console.error('Error opening IndexedDB database');
        };

        dbRequest.onsuccess = function (event) {
            // Set the global idb variable
            idb = event.target.result;

            // Initialize the app
            initializeApp();
        };

        dbRequest.onupgradeneeded = function (event) {
            // Create the 'config' object store if it doesn't exist
            const db = event.target.result;
            db.createObjectStore('config', { keyPath: 'key' });
        };
    }
});
