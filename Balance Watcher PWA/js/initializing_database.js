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
const auth = firebase.auth();

const accountSpan = document.getElementById('account-span');

auth.onAuthStateChanged(user => {
    if (user) {
        window.userUid = user.uid;
        console.log('user logged in with uid: ', window.userUid);

        accountSpan.textContent = user.email;
    } else {
        window.userUid = null;
        console.log('user signed out');

        accountSpan.textContent = 'No user logged in';
    }
});

async function waitingForUserUid() {
    return new Promise((resolve) => {
        const checkUserUid = () => {
            if (window.userUid !== undefined && window.userUid !== null) {
                resolve(window.userUid);
            } else {
                setTimeout(checkUserUid, 10);
            }
        };

        checkUserUid();
    });
}

// this function will automatically create the users UID that will be later used for the users collection
const signupForm = document.querySelector('#signup-form');
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = signupForm['signup-email'].value;
    const password = signupForm['signup-password'].value;
    const confirmPasswd = signupForm['signup-password-confirm'].value;

    if (password === confirmPasswd) {
        try {
            // Check if the email is already registered
            const methods = await auth.fetchSignInMethodsForEmail(email);

            if (methods.length === 0) {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);

                const popup = document.querySelector('#signupPopup');
                popup.style.display = 'none';
                signupForm.reset();
            }
        } catch (error) {
            console.log(error);
            document.getElementById('error-message').textContent = error['message'];
            document.getElementById('error-signup-text').style.display = 'block';
        }
    } else {
        console.log('Passwords do not match');
        document.getElementById('error-message').textContent = 'Passwords do not match';
        document.getElementById('error-signup-text').style.display = 'block';
    }
});


const logout = document.querySelector('#logout_button');
logout.addEventListener('click', (e) => {
    e.preventDefault();
    openLogoutPopup();
})


const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = loginForm['login-email'].value;
    const password = loginForm['login-password'].value;

    try {
        // Sign in the user
        const userCredential = await auth.signInWithEmailAndPassword(email, password);

        // Close the login popup and reset the form on successful login
        const popup = document.querySelector('#loginPopup');
        popup.style.display = 'none';
        loginForm.reset();
        document.getElementById('error-login-text').style.display = 'none';
    } catch (error) {
        document.getElementById('error-login-text').style.display = 'block';
    }
});


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
