// 1. USE YOUR SAME FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://logilink-e9773-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-id",
  appId: "your-app-id"
    // ...
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let currentTruckId = "";

// 2. Setup the Scanner
const html5QrCode = new Html5Qrcode("reader");

const qrConfig = { fps: 10, qrbox: { width: 250, height: 250 } };

html5QrCode.start(
    { facingMode: "environment" }, // Use back camera
    qrConfig,
    (decodedText) => {
        // SCANNED SUCCESSFULLY
        currentTruckId = decodedText;
        fetchTruckDetails(decodedText);
        html5QrCode.stop(); // Stop camera once we have a hit
    }
);

// 3. Fetch details from Firebase to show the Guard
function fetchTruckDetails(id) {
    database.ref('slots/' + id).once('value', (snapshot) => {
        const data = snapshot.val();
        
        if (data) {
            // Check if already used
            if (data.status === "Verified") {
                alert("❌ SECURITY ALERT: This pass was already used at " + new Date(data.entryTime).toLocaleTimeString());
                location.reload(); // Reset the scanner
                return;
            }

            // If not used, show the details to the guard
            document.getElementById('displayReg').innerText = data.registration;
            document.getElementById('displayTime').innerText = "Slot: " + new Date(data.appointmentTime).toLocaleTimeString();
            document.getElementById('result-card').style.display = 'block';
            document.getElementById('reader').style.display = 'none';
        } else {
            alert("❌ INVALID PASS: This QR code is not in the LogiLink system.");
            location.reload();
        }
    });
}

// 4. Update Status to "Verified"
function verifyEntry() {
    if (currentTruckId) {
        database.ref('slots/' + currentTruckId).update({
            status: "Verified",
            entryTime: new Date().toISOString()
        }).then(() => {
            alert("Entry Authorized! Gate Opening...");
            location.reload(); // Reset for next truck
        });
    }
}

const SECRET_PIN = "4085"; 

function checkPin() {
    const pinInput = document.getElementById('gatePin');
    const confirmBtn = document.getElementById('confirmBtn');
    const msg = document.getElementById('pinMessage');

    if (pinInput.value === SECRET_PIN) {
        // PIN is correct
        confirmBtn.disabled = false;
        confirmBtn.style.backgroundColor = "#28a745"; // Turns Green
        confirmBtn.style.cursor = "pointer";
        msg.innerText = "✓ PIN Verified";
        msg.style.color = "green";
        pinInput.style.borderColor = "green";
    } else {
        // PIN is wrong or incomplete
        confirmBtn.disabled = true;
        confirmBtn.style.backgroundColor = "#ccc";
        confirmBtn.style.cursor = "not-allowed";
        msg.innerText = pinInput.value.length >= 4 ? "❌ Incorrect PIN" : "";
        msg.style.color = "red";
    }
}

function confirmEntry() {
    // ... your existing logic to update Firebase to "Verified" ...
    
    // Clear the security field for the next truck
    document.getElementById('gatePin').value = "";
    document.getElementById('confirmBtn').disabled = true;
    document.getElementById('confirmBtn').style.backgroundColor = "#ccc";
    
    alert("Truck Verified and Entry Logged!");
}