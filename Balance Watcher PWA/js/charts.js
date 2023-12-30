// Function to update the bar chart based on spendings and earnings
function updateBarChart(spendingsData, earningsData, selectedDay) {
    // console.log('------------------------- updating the chart ------------------------------');
    var ctx = document.getElementById('barchart').getContext('2d');

    // Check if a chart instance already exists
    var existingChart = Chart.getChart(ctx);

    // Destroy the existing chart if it exists
    if (existingChart) {
        existingChart.destroy();
    }

    // Create a bar chart
    var myBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [`Výdaje: ${spendingsData}`, `Příjmy: ${earningsData}`],
            datasets: [{
                label: `Graf: ${selectedDay}`,
                data: [spendingsData, earningsData],
                borderWidth: 1,
                borderRadius: 15, // Rounded edges in CSS
            }],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
            plugins: {
                legend: {
                    onClick: function (e) {
                        e.stopPropagation(); // Prevent the default legend onClick behavior
                    },
                },
            },
        },
    });
}


// Function to get the date from IndexedDB
function getDateFromConfig() {
    // console.log('getDateFromConfig called')
    return new Promise((resolve, reject) => {
        if (!('indexedDB' in window)) {
            reject(new Error('IndexedDB not supported'));
        }

        var dbRequest = window.indexedDB.open('main_db');

        dbRequest.onerror = function (event) {
            console.error('Error opening IndexedDB database');
            reject(new Error('Error opening IndexedDB database'));
        };

        dbRequest.onsuccess = function (event) {
            var db = event.target.result;

            var transaction = db.transaction(['config'], 'readonly');
            var configStore = transaction.objectStore('config');

            var getConfigRequest = configStore.get('selected_day');
            var getPeriodRequest = configStore.get('period');

            getConfigRequest.onsuccess = function (event) {
                var configData = event.target.result;

                if (configData) {
                    var selectedDate = configData.value;
                    // console.log('Selected date from IndexedDB:', selectedDate);
                    resolve(selectedDate);
                } else {
                    // console.log('No selected_day found in IndexedDB');
                    reject(new Error('No selected_day found in IndexedDB'));
                }
            };

            getConfigRequest.onerror = function (event) {
                console.error('Error in getConfigRequest:', event.target.error);
                reject(new Error('Error loading selected day from IndexedDB'));
            };
        };

        dbRequest.onupgradeneeded = function (event) {
            // console.log('Upgrading IndexedDB');
            var db = event.target.result;
            db.createObjectStore('config', { keyPath: 'key' });
        };
    });
}

// Function to get the period from IndexedDB
function getPeriodFromConfig() {
    // console.log('getPeriodFromConfig called')
    return new Promise((resolve, reject) => {
        if (!('indexedDB' in window)) {
            reject(new Error('IndexedDB not supported'));
        }
        
        var dbRequest = window.indexedDB.open('main_db');
        
        dbRequest.onerror = function (event) {
            console.error('Error opening IndexedDB database');
            reject(new Error('Error opening IndexedDB database'));
        };
        
        dbRequest.onsuccess = function (event) {
            var db = event.target.result;
            
            var transaction = db.transaction(['config'], 'readonly');
            var configStore = transaction.objectStore('config');
            
            var getConfigRequest = configStore.get('period');
            
            getConfigRequest.onsuccess = function (event) {
                var configData = event.target.result;
                
                if (configData) {
                    var period = configData.value;
                    // console.log('Selected period from IndexedDB:', period);
                    resolve(period);
                } else {
                    // console.log('No selected_day found in IndexedDB');
                    reject(new Error('No selected_day found in IndexedDB'));
                }
            };
            
            getConfigRequest.onerror = function (event) {
                console.error('Error in getConfigRequest:', event.target.error);
                reject(new Error('Error loading period from IndexedDB'));
            };
        };
        
        dbRequest.onupgradeneeded = function (event) {
            // console.log('Upgrading IndexedDB');
            var db = event.target.result;
            db.createObjectStore('config', { keyPath: 'key' });
        };
    });
}

// Function to get spendings and earnings for the current day
function getEarningsAndSpendingsForDateToUpdateChart() {
    // Get the current date
    return getDateFromConfig().then((selectedDate) => {
        
        // Reference to the "balance" collection for the specified date
        var balanceDocRef = db.collection('balance').doc(selectedDate);
        
        
        // Get earnings for the specified date
        return balanceDocRef.collection('individual_earnings').get().then((earningsSnapshot) => {
            var earningsData = earningsSnapshot.docs.reduce((total, doc) => total + doc.data().amount, 0);
            
            // Get spendings for the specified date
            return balanceDocRef.collection('individual_spendings').get().then((spendingsSnapshot) => {
                var spendingsData = spendingsSnapshot.docs.reduce((total, doc) => total + doc.data().amount, 0);
                
                // Log or use the earningsData and spendingsData as needed
                // console.log('Earnings for ' + selectedDate + ':', earningsData);
                // console.log('Spendings for ' + selectedDate + ':', spendingsData);
                
                // Update the bar chart with the data
                updateBarChart(spendingsData, earningsData, selectedDate);
            });
        });
    }).catch((error) => {
        console.error('Error getting data:', error);
    });
}

// Call the function to get and update the data
// This function is called only at the start
getEarningsAndSpendingsForDateToUpdateChart();







// CHART FOR HOMESCREEN

// Function to update the bar chart based on spendings and earnings
function updateHomeChart(spendingsData, earningsData, chartLabels) {
    // console.log('------------------------- updating the chart ------------------------------');
    var ctx = document.getElementById('barchart-home').getContext('2d');
    // console.log(spendingsData, earningsData, chartLabels)
    // console.log(')))))))))))))))))))))))))))))))')

    // Check if a chart instance already exists
    var existingChart = Chart.getChart(ctx);

    // Destroy the existing chart if it exists
    if (existingChart) {
        existingChart.destroy();
    }

    // Create a bar chart
    var myHomeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartLabels,
            datasets: [
                {
                    label: 'Výdaje',
                    data: spendingsData,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)', // Red color with transparency
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    borderRadius: 15, // Rounded edges in CSS
                },
                {
                    label: 'Příjmy',
                    data: earningsData,
                    backgroundColor: 'rgba(75, 192, 192, 0.5)', // Green color with transparency
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    borderRadius: 15, // Rounded edges in CSS
                }
            ],
        },
        options: {
            scales: {
                x: {
                    ticks: {
                        autoSkip: false,
                        maxRotation: 90,
                        minRotatio: 0
                    }
                },
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
}

function weekChart(valuesForBuilding) {
    var spendingsData = valuesForBuilding.spedningsPerDay
    var earningsData = valuesForBuilding.earningsPerDay
    const chartLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    updateHomeChart(spendingsData, earningsData, chartLabels);
}

function monthChart(valuesForBuilding) {
    var spendingsData = [valuesForBuilding.spendingsForPeriod]
    var earningsData = [valuesForBuilding.earningsForPeriod]
    const chartLabels = ['Month Balance']

    updateHomeChart(spendingsData, earningsData, chartLabels);
}

function yearChart(valuesForBuilding) {
    var spendingsData = valuesForBuilding.monthlySpendings
    var earningsData = valuesForBuilding.monthlyEarnings
    const chartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    updateHomeChart(spendingsData, earningsData, chartLabels)
}

async function getInformationsForBuilding() {
    // console.log('getting Info for Building...');

    try {
        // Wait for both promises to resolve
        const [period, selectedDate] = await Promise.all([
            getPeriodFromConfig(),
            getDateFromConfig()
        ]);

        // console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
        // console.log('period:', period);
        // console.log('selectedDate:', selectedDate);
        // console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');

        const dateRange = getDateRangeForCharts(selectedDate, period);
        const dateArray = getDatesInRangeForCharts(dateRange);

        // console.log('=========================================================================================================================');
        // console.log('periodType: ', period);
        // console.log(`Start of the ${period}:`, dateRange.start);
        // console.log(`End of the ${period}:`, dateRange.end);
        // console.log('=========================================================================================================================');

        // Call the simplified function to get values for building
        const valuesForBuilding = await getValuesForBuilding(dateArray);

        if (period === 'week') {
            weekChart(valuesForBuilding);
        } else if (period === 'month') {
            monthChart(valuesForBuilding);
        } else if (period === 'year') {
            yearChart(valuesForBuilding);
        }
        
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// selectedDate has to be in new Date format
function getDateRangeForCharts(currentDate, periodType) {
    let start, end;

    const dateParts = currentDate.split('.').map(part => parseInt(part, 10));
    const selectedDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);

    switch (periodType) {
        case 'week':
            const weekDates = getDaysInSameWeekForCharts(selectedDate);
            start = weekDates.startOfWeek;
            end = weekDates.endOfWeek;
            break;
        case 'month':
            const monthDates = getStartAndEndOfMonthForCharts(selectedDate);
            start = monthDates.startOfMonth;
            end = monthDates.endOfMonth;
            break;
        case 'year':
            const yearDates = getStartAndEndOfYearForCharts(selectedDate);
            start = yearDates.startOfYear;
            end = yearDates.endOfYear;
            break;
        default:
            console.error('Invalid period type');
    }

    return { start, end };
}

// Example function to get the days of the week based on a given date,
// date parameter has to be new Date format
function getDaysInSameWeekForCharts(date) {
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

function getStartAndEndOfMonthForCharts(date) {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const formattedStartOfMonth = formatDateForDisplayForCharts(startOfMonth.getDate(), startOfMonth.getMonth() + 1, startOfMonth.getFullYear());
    const formattedEndOfMonth = formatDateForDisplayForCharts(endOfMonth.getDate(), endOfMonth.getMonth() + 1, endOfMonth.getFullYear());

    return { startOfMonth: formattedStartOfMonth, endOfMonth: formattedEndOfMonth };
}

function getStartAndEndOfYearForCharts(date) {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const endOfYear = new Date(date.getFullYear(), 12, 0);

    const formattedStartOfYear = formatDateForDisplayForCharts(startOfYear.getDate(), startOfYear.getMonth() + 1, startOfYear.getFullYear());
    const formattedEndOfYear = formatDateForDisplayForCharts(endOfYear.getDate(), endOfYear.getMonth() + 1, endOfYear.getFullYear());

    return { startOfYear: formattedStartOfYear, endOfYear: formattedEndOfYear };
}

// Function to format the date for display in DD. MM. YYYY format
function formatDateForDisplayForCharts(day, month, year) {
    const formatted_date = `${day.toString()}. ${month.toString()}. ${year}`
    return formatted_date;
}

function getDatesInRangeForCharts(dateRange) {
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

function getValuesForBuilding(dateArray) {
    var earningsForPeriod = 0;
    var spendingsForPeriod = 0;
    var earningsPerDay = [];
    var spedningsPerDay = [];
    var monthlyEarnings = [];
    var monthlySpendings = [];

    const promises = dateArray.map((selectedDay) => {
        return getEarningsAndSpendingsForDate(selectedDay);
    });

    return Promise.all(promises)
        .then((results) => {
            results.forEach((result) => {
                // console.log('Earnings for ' + result.selectedDay + ':', result.sumOfEarnings);
                // console.log('Spendings for ' + result.selectedDay + ':', result.sumOfSpendings);
                // console.log('ˇˇˇˇˇˇˇˇˇˇˇˇˇˇˇˇˇˇˇˇ')

                earningsForPeriod += result.sumOfEarnings;
                spendingsForPeriod += result.sumOfSpendings;

                earningsPerDay.push(result.sumOfEarnings);
                spedningsPerDay.push(result.sumOfSpendings);
                // Extract month and year from the selected day
                const [day, month, year] = result.selectedDay.split('.').map(Number);

                // Populate monthlyEarnings and monthlySpendings arrays
                const monthIndex = month - 1; // Adjust month to be 0-based
                monthlyEarnings[monthIndex] = (monthlyEarnings[monthIndex] || 0) + result.sumOfEarnings;
                monthlySpendings[monthIndex] = (monthlySpendings[monthIndex] || 0) + result.sumOfSpendings;
            });

            // Return an object with the accumulated values directly
            return { earningsForPeriod, 
                spendingsForPeriod, 
                earningsPerDay, 
                spedningsPerDay,
                monthlyEarnings,
                monthlySpendings
             };
        });
}

getInformationsForBuilding()