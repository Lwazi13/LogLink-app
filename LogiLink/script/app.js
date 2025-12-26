
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
// 1. --- GET COMPANY ID FROM URL ---
const urlParams = new URLSearchParams(window.location.search);
const currentCompanyID = urlParams.get('id');

// If no ID, block the page
if (!currentCompanyID) {
    document.body.innerHTML = "<div style='text-align:center; margin-top:50px;'><h1>Access Denied</h1><p>Please use your unique company link.</p></div>";
    throw new Error("No Company ID");
}

// 2. --- DATABASE REFERENCES ---
const slotsRef = database.ref(`data/${currentCompanyID}/slots`);
var historyRef = database.ref(`data/${currentCompanyID}/history`);
const companyStatusRef = database.ref(`companies/${currentCompanyID}/isBlocked`);

// 3. --- SECURITY CHECK (KILL-SWITCH) ---
companyStatusRef.on('value', snapshot => {
    if (snapshot.val() === true) {
        document.body.innerHTML = "<h1>Account Suspended. Contact Admin.</h1>";
    }
});

// 4. --- ADD NEW BOOKING & GENERATE QR ---
function addNewEntry() {
    const reg = document.getElementById('regInput').value;
    const time = document.getElementById('timeInput').value;

    if (reg && time) {
        const newRef = slotsRef.push();
        const truckData = {
            registration: reg.toUpperCase(),
            scheduledTime: time,
            status: "Pending",
            company: currentCompanyID,
            createdAt: Date.now()
        };

        newRef.set(truckData).then(() => {
            generateQRCode(newRef.key, reg);
            alert("Booking Saved Successfully!");
            document.getElementById('regInput').value = '';
        });
    } else {
        alert("Please enter Registration and Time.");
    }
}

function generateQRCode(truckId, reg) {
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = ""; // Clear old one
    
    // Data encoded: CompanyID | TruckID
    const qrData = `${currentCompanyID}|${truckId}`;

    new QRCode(qrContainer, {
        text: qrData,
        width: 150,
        height: 150
    });
    document.getElementById('pass-info').innerText = `Pass for: ${reg}`;
}

// 5. --- DISPLAY COMPLETED ENTRIES (30 DAY FILTER) ---
const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

historyRef.orderByChild('timestamp').startAt(thirtyDaysAgo).on('value', snapshot => {
    const tableBody = document.getElementById('historyTableBody');
    tableBody.innerHTML = '';

    snapshot.forEach(child => {
        const data = child.val();
        tableBody.innerHTML += `
            <tr>
                <td>${data.registration}</td>
                <td>${data.bookedTime}</td>
                <td>${data.scannedTime}</td>
                <td><span class="badge">${data.status}</span></td>
            </tr>
        `;
    });
});
            
            // Show a success message with a clickable button
            const list = document.getElementById('scanList');
            const successCard = `
                <div class="truck-card" style="border: 2px solid #ff8c00; background: #fff9f0; padding: 15px; margin-bottom: 10px;">
                    <p>✅ <strong>Slot Booked!</strong></p>
                    <p>Registration: ${reg}</p>
                 
                    <p style="font-size: 15px; margin-top: 10px; word-break: break-all;">Share this link with the driver: ${driverUrl}</p>
                </div>
            `;
            list.innerHTML = successCard + list.innerHTML;


// Reference to our slots
var historyRef = database.ref('slots');

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