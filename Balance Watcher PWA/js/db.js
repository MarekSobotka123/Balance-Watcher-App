// offline data
db.enablePersistence()
  .catch(err => {
    if(err.code == 'failed-precondition'){
      // probably multiple tabs open at once
      console.log('persistance failed')
    } else if(err.code == 'unimplemented'){
      // lack of browser support
      console.log('persistence is not available')
    }
  });


//db.js

function getEarningsAndSpendingsForDate() {
  // Reference to the "config" collection
  var configDocRef = db.collection('config').doc('Rg3Rzq5VOBvrGKMR2W3Q');

  // Get the selected date from the config collection
  configDocRef.get().then((configSnapshot) => {
    var selectedDate = configSnapshot.data().selected_day;
    console.log('selected day for get func:', selectedDate);

    // Reference to the "balance" collection for the specified date
    var balanceDocRef = db.collection('balance').doc(selectedDate);

    // Arrays to store earnings and spendings data
    var earningsData = [];
    var spendingsData = [];

    // Get earnings for the specified date
    return balanceDocRef.collection('individual_earnings').get().then((earningsSnapshot) => {
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

      // Log or use the earningsData and spendingsData arrays as needed
      console.log('Earnings for ' + selectedDate + ':', earningsData);
      console.log('Spendings for ' + selectedDate + ':', spendingsData);
      // Get sum of earnings and spenings for that date
      var sumOfEarnings = earningsData.reduce((total, earning) => total + earning.amount, 0);
      console.log('Sum of Earnings for ' + selectedDate + ':', sumOfEarnings);
      var sumOfSpendings = spendingsData.reduce((total, spending) => total + spending.amount, 0);
      console.log('Sum of Spendings for ' + selectedDate + ':', sumOfSpendings);

    }).catch((error) => {
      console.error('Error getting data for ' + selectedDate + ':', error);
    });
  }).catch((error) => {
    console.error('Error getting selected date:', error);
  });
}

// Function to add earning or spending data...WORKIKNG!!!!!!!!, DONT EVER TOUCH IT 
function addDataToBalance(formType, amount, comment) {
  // Reference to the "config" collection
  var configDocRef = db.collection('config').doc('Rg3Rzq5VOBvrGKMR2W3Q');

  // Declare balanceDocRef and dataType outside the scope of the promise chain
  var balanceDocRef;
  var dataType;

  // Get the selected date from the config collection
  configDocRef.get().then((configSnapshot) => {
    var selectedDate = configSnapshot.data().selected_day;
    console.log('selected day for balance purpose:', selectedDate);

    // Reference to the "balance" collection for the selected date
    balanceDocRef = db.collection('balance').doc(selectedDate);

    // Check if the document for the selected date exists
    return balanceDocRef.get();
  }).then((balanceSnapshot) => {
    // If the document doesn't exist, create it
    if (!balanceSnapshot.exists) {
      return balanceDocRef.set({});
    } else {
      return Promise.resolve();
    }
  }).then(() => {
    // Set the value of dataType here
    dataType = formType === 'earning_form' ? 'individual_earnings' : 'individual_spendings';

    // Reference to the "individual_earnings" or "individual_spendings" subcollection
    var subcollectionRef = balanceDocRef.collection(dataType);

    // Get the number of elements in the subcollection
    return subcollectionRef.get();
  }).then((subcollectionSnapshot) => {
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
    console.log('Data added successfully.');
  }).catch((error) => {
    console.error('Error adding data:', error);
  });
}

// Example usage for earning_form
//addDataToBalance('earning_form', 150, 'Received from client');
// working ↑