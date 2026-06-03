const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const keyPath = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(keyPath)) {
    console.error('\x1b[31m%s\x1b[0m', 'CRITICAL ERROR: serviceAccountKey.json is missing!');
    process.exit(1);
}

const serviceAccount = require(keyPath);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://techfusion-930cf-default-rtdb.firebaseio.com"
});

const db = admin.firestore();
const rtdb = admin.database();

// Make sure these match exactly what you named the bulbs on the web dashboard!
const bulbIDs = ["bulb1", "bulb2", "bulb3"]; 

async function pushZeros() {
    for (const bulbId of bulbIDs) {
        const packet = {
            nodeId: bulbId,
            R_V: 0,
            Y_V: 0,
            B_V: 0,
            R_A: 0,
            Y_A: 0,
            B_A: 0,
            Temp: 0,
            CO2: 0,
            Vib: "OFFLINE",
            Time: new Date().toISOString(),
            timestamp: new Date().toISOString(),
            kwh: 0,
            kvarh: 0,
            status: "OFFLINE",
            active_power_kw: 0,
            current_l1: 0,
            voltage_l1: 0,
            temperature: 0,
            pf: 0
        };

        try {
            // Push to both databases just like the main system
            await db.collection('AI_Logs').add(packet);
            await rtdb.ref('AI_Logs').push(packet);
            console.log(`[${new Date().toLocaleTimeString()}] Successfully sent ZERO values to Firebase for: ${bulbId}`);
        } catch (error) {
            console.error(`Firebase Sync Error for ${bulbId}:`, error);
        }
    }
}

console.log("Starting Firebase Zero Value Sender for Bulbs (TX-3)...");
setInterval(pushZeros, 5000);
pushZeros(); // Send first batch immediately
