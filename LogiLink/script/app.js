// Paste your Firebase Config here from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCNaPOvbyCJ1RhZM2UyF0JrfOAEndItC6o",
  authDomain:"logilink-e9773.firebaseapp.com",
  databaseURL: "https://logilink-e9773-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "logilink-e9773",
  storageBucket: "logilink-e9773.firebasestorage.app",
  messagingSenderId: "112066077154",
  appId: "1:112066077154:web:07d60273f85f3855bed9bb"
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

// Reference to our slots
const historyRef = database.ref('slots');

historyRef.on('value', (snapshot) => {
    const historyLog = document.getElementById('historyLog');
    historyLog.innerHTML = ""; // Clear list before reloading
    
    const data = snapshot.val();
    
    for (let id in data) {
        const truck = data[id];
        
        // Only show trucks that have been processed by the guard
        if (truck.status === "Verified" || truck.status === "Completed") {
            const entryDiv = document.createElement('div');
            entryDiv.style.borderBottom = "1px solid #ccc";
            entryDiv.style.padding = "10px 0";
            
            entryDiv.innerHTML = `
                <span style="color: green; font-weight: bold;">✔</span> 
                <strong>${truck.registration}</strong> 
                <span style="margin-left: 15px; color: #666;">
                    Checked in at: ${truck.entryTime || 'Time not logged'}
                </span>
          
            `;
            historyLog.prepend(entryDiv); // Newest at the top
        }
    }
});

// Listen for all trucks and filter for "Scheduled" ones
database.ref('slots').on('value', (snapshot) => {
    const activeList = document.getElementById('activeTrucksList');
    activeList.innerHTML = ""; // Clear the list
    
    const data = snapshot.val();
    
    for (let id in data) {
        const truck = data[id];
        
        // ONLY show trucks that haven't been scanned yet
        if (truck.status === "Scheduled") {
            const truckDiv = document.createElement('div');
            truckDiv.className = "card"; // Using your existing card style
            truckDiv.style.borderLeft = "5px solid #ff8c00";
            
            truckDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${truck.registration}</strong><br>
                     
                </div>
                <div style="display: flex; gap: 8px;">
                    <button onclick="window.open('driver.html?id=${id}', '_blank')" 
                    style="width: auto; background: #555; padding: 8px 12px;">View</button>
            
                  
            
                    <button onclick="removeTruck('${id}')" 
                    style="width: auto; background: #dc3545; padding: 8px 12px;">Remove</button>
                </div>
                </div>

            `;
            activeList.appendChild(truckDiv);

        }
    }



});



function removeTruck(id) {
    if (confirm("Are you sure you want to delete this appointment?")) {
        database.ref('slots/' + id).remove()
        .then(() => {
            console.log("Truck removed successfully");
        })
        .catch((error) => {
            alert("Error removing truck: " + error.message);
        });
    }
}