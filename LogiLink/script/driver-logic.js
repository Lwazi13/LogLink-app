// 1. USE THE SAME FIREBASE CONFIG FROM YOUR APP.JS
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://logilink-e9773-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-id",
  appId: "your-app-id"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 2. Get the Truck ID from the URL (e.g. ?id=KNP-123-GP)
const urlParams = new URLSearchParams(window.location.search);
const truckId = urlParams.get('id');

if (truckId) {
    database.ref('slots/' + truckId).on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            document.getElementById('truckReg').innerText = data.registration;
            document.getElementById('slotTime').innerText = new Date(data.appointmentTime).toLocaleString();
            document.getElementById('status').innerText = data.status;

            // 3. Generate QR Code containing only the Truck ID
            document.getElementById('qrcode').innerHTML = ""; // Clear old one
            new QRCode(document.getElementById("qrcode"), {
                text: truckId,
                width: 200,
                height: 200
            });
        } else {
            document.body.innerHTML = "<h1>Error: Pass not found</h1>";
        }
    });
}