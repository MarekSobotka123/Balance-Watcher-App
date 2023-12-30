// Global variable to store the selected day
var selectedDay;

// Function to get the selected day from IndexedDB
function getSelectedDayFromIndexedDB() {
    return new Promise((resolve, reject) => {
        if (!('indexedDB' in window)) {
            reject(new Error('IndexedDB not supported'));
        }

        // Open the main_db database or create it if it doesn't exist
        // console.log('Opening IndexedDB database');
        var dbRequest = window.indexedDB.open('main_db');

        dbRequest.onerror = function (event) {
            console.error('Error opening IndexedDB database');
            reject(new Error('Error opening IndexedDB database'));
        };

        dbRequest.onsuccess = function (event) {
            // console.log('Opened IndexedDB successfully');
            // Get the database reference
            var db = event.target.result;

            // Start a transaction
            var transaction = db.transaction(['config'], 'readwrite');

            // Access the 'config' object store
            var configStore = transaction.objectStore('config');

            // Get the 'selected_day' key
            var getSelectedDayRequest = configStore.get('selected_day');

            // Event listener for successful retrieval of selected day
            getSelectedDayRequest.onsuccess = function (event) {
                // Retrieve the selected day value
                selectedDay = event.target.result ? event.target.result.value : null;

                // If selectedDay is null, it means the key is not present or the value is null
                if (selectedDay === null) {
                    console.log('No selected_day found in IndexedDB. Creating default value.');
                    
                    // Set a default value for selected_day (you can modify this as needed)
                    selectedDay = new Date().toLocaleDateString('cs-CZ');
                    // console.log(selectedDay)

                    // Update the 'selected_day' key with the default value
                    configStore.put({
                        key: 'selected_day',
                        value: selectedDay
                    });

                    // console.log('Default value for selected_day set:', selectedDay);
                }

                // console.log('Selected Day from IndexedDB:', selectedDay);

                // Resolve the promise after successful retrieval
                resolve(selectedDay);
            };

            getSelectedDayRequest.onerror = function (event) {
                console.error('Error in getSelectedDayRequest:', event.target.error);
                // Reject the promise in case of an error
                reject(new Error('Error loading selected day from IndexedDB'));
            };
        };

        dbRequest.onupgradeneeded = function (event) {
            // console.log('Upgrading IndexedDB');
            // Create the 'config' object store if it doesn't exist
            var db = event.target.result;
            db.createObjectStore('config', { keyPath: 'key' });
        };
    });
}

// offline data
db.enablePersistence()
    .catch(err => {
        if (err.code == 'failed-precondition') {
            // probably multiple tabs open at once
            console.log('Persistence failed');
        } else if (err.code == 'unimplemented') {
            // lack of browser support
            console.log('Persistence is not available');
        }
    });

// Modify the function to return a Promise
function addDataToBalance(formType, amount, comment, selectedDay) {

    // console.log('addData... function being called rn');
    // console.log('selectedDay: ', selectedDay, '-----------------------------')
    return new Promise((resolve, reject) => {
        // Reference to the "balance" collection for the selected date
        var balanceDocRef = db.collection('balance').doc(selectedDay);

        // Declare balanceDocRef and dataType outside the scope of the promise chain
        var dataType;

        // Set the value of dataType here, COMPLETE MAGIC↓
        dataType = formType === 'earning_form' ? 'individual_earnings' : 'individual_spendings';

        // Reference to the "individual_earnings" or "individual_spendings" subcollection
        var subcollectionRef = balanceDocRef.collection(dataType);

        // Get the number of elements in the subcollection
        subcollectionRef.get().then((subcollectionSnapshot) => {
            // Calculate the new name for the earning/spending based on the number of elements
            var elementCount = subcollectionSnapshot.size;
            var newDataName = formType === 'earning_form' ? 'earning_' + (elementCount + 1) : 'spending_' + (elementCount + 1);

            // Reference to the new document in the subcollection
            var newDataDocRef = balanceDocRef.collection(dataType).doc(newDataName);

            // Add the data to the document
            return newDataDocRef.set({
                amount: amount,
                comment: comment || null
            });
        }).then(() => {
            // console.log('Data added successfully.');
            resolve(); // Resolve the promise when data is added
        }).catch((error) => {
            console.error('Error adding data:', error);
            reject(error); // Reject the promise if there's an error
        });
        // console.log('!!!! ADDING DATA DONE !!!!');
    });
}

// Function to get earnings and spendings for the current date
function getEarningsAndSpendingsForDate(selectedDay) {
    return new Promise((resolve, reject) => {
        // Arrays to store earnings and spendings data
        var earningsData = [];
        var spendingsData = [];

        // Reference to the "balance" collection for the specified date
        var balanceDocRef = db.collection('balance').doc(selectedDay);

        // Get earnings for the specified date
        balanceDocRef.collection('individual_earnings').get().then((earningsSnapshot) => {
            earningsSnapshot.forEach((earningDoc) => {
                var earningData = earningDoc.data();
                earningsData.push(earningData);
            });

            // Get spendings for the specified date
            return balanceDocRef.collection('individual_spendings').get();
        }).then((spendingsSnapshot) => {
            spendingsSnapshot.forEach((spendingDoc) => {
                var spendingData = spendingDoc.data();
                spendingsData.push(spendingData);
            });

            // Get sum of earnings and spendings for that date
            var sumOfEarnings = earningsData.reduce((total, earning) => total + earning.amount, 0);
            var sumOfSpendings = spendingsData.reduce((total, spending) => total + spending.amount, 0);

            // Resolve with the results
            resolve({ selectedDay, sumOfEarnings, sumOfSpendings });
        }).catch((error) => {
            // Reject with the error
            reject(error);
        });
    });
}

// Function to update the selected day in the config table
function updateSelectedDay(selectedDate) {
    // Start a transaction
    var transaction = db.transaction(['config'], 'readwrite');

    // Access the 'config' object store
    var configStore = transaction.objectStore('config');

    // Update the 'selected_day' key with the selected date in DD. MM. YYYY format
    var selectedDayObject = {
        key: 'selected_day',
        value: selectedDate
    };

    // Add or update the 'selected_day' key in the config table
    configStore.put(selectedDayObject);

    // console.log('Selected Day updated successfully');
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Load the selected day from IndexedDB
    getSelectedDayFromIndexedDB().then((selectedDate) => {
        // Check if this is the first launch or a reopening
        const isFirstLaunch = !localStorage.getItem('appLaunched');

        if (isFirstLaunch) {
            // First launch or reopening after force close
            console.log('First launch or reopening after force close');

            // Update the selected day to the current day
            const currentDay = new Date().toLocaleDateString('cs-CZ');
            updateSelectedDay(currentDay);

            // Set the flag to indicate that the app has been launched
            localStorage.setItem('appLaunched', 'true');
        }

        // Set the global selectedDay variable
        selectedDay = selectedDate;

        // Add other initialization tasks as needed
        
        
        // Now you can safely call functions that depend on selectedDay
        // For example, you can call addDataToBalance or getEarningsAndSpendingsForDate here
        // because selectedDay has been properly initialized
    });
});

