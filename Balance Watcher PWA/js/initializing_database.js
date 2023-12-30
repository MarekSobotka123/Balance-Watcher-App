console.log('INITIALIZING DATABASE NOW')

const firebaseConfig = {
    apiKey: "AIzaSyDnh7-iR5LxxPUQfenJ_wfTxjwWjI54Ouo",
    authDomain: "balance-app-f99d5.firebaseapp.com",
    databaseURL: "https://balance-app-f99d5-default-rtdb.firebaseio.com",
    projectId: "balance-app-f99d5",
    storageBucket: "balance-app-f99d5.appspot.com",
    messagingSenderId: "289081540262",
    appId: "1:289081540262:web:7da47083d8cdfa9bee3e67",
    measurementId: "G-EXPXWMT643"
};

// Check if Firebase is already initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized now');
} else {
    console.log('Firebase is already initialized');
}

// Get a reference to the Firestore database
const db = firebase.firestore();
console.log('DONE')