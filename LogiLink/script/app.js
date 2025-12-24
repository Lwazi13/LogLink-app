// Paste your Firebase Config here from the Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://logilink-e9773-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-id",
  appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// FUNCTION: Book a slot
function bookSlot() {
    const reg = document.getElementById('truckReg').value;
    const time = document.getElementById('slotTime').value;

    if(reg && time) {
        // Clean the registration to create a solid ID (e.g., "KNP 123 GP" -> "KNP-123-GP")
        const truckId = reg.replace(/\s+/g, '-').toUpperCase();
        
        database.ref('slots/' + truckId).set({
            registration: reg,
            appointmentTime: time,
            status: "Scheduled",
            bookedAt: new Date().toISOString()
        }).then(() => {
            // SUCCESS: Build the link for the driver page
            const currentPath = window.location.pathname.replace('index.html', '');
            const driverUrl = `${window.location.origin}${currentPath}driver.html?id=${truckId}`;
            
            // Show a success message with a clickable button
            const list = document.getElementById('scanList');
            const successCard = `
                <div class="truck-card" style="border: 2px solid #ff8c00; background: #fff9f0; padding: 15px; margin-bottom: 10px;">
                    <p>✅ <strong>Slot Booked!</strong></p>
                    <p>Registration: ${reg}</p>
                    <button onclick="window.open('${driverUrl}', '_blank')" 
                            style="background: #ff8c00; color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer;">
                        OPEN DRIVER PASS
                    </button>
                    <p style="font-size: 10px; margin-top: 10px; word-break: break-all;">Link: ${driverUrl}</p>
                </div>
            `;
            list.innerHTML = successCard + list.innerHTML;
        });
    } else {
        alert("Please enter Registration and Time");
    }
}