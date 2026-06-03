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
const kwhAccumulator = {};

async function pushActiveData() {
    for (const bulbId of bulbIDs) {
        if (!kwhAccumulator[bulbId]) kwhAccumulator[bulbId] = Math.random() * 50; // Random starting kwh

        // Simulate a running industrial bulb/lighting unit
        const powerKw = parseFloat((0.2 + Math.random() * 0.3).toFixed(2)); // 200W to 500W
        kwhAccumulator[bulbId] += (powerKw / 3600) * 5; // accumulate 5 seconds worth of kwh

        const current = parseFloat((powerKw * 1000 / 230).toFixed(2)); // P = VI -> I = P/V
        const voltage = Math.floor(220 + Math.random() * 10); // 220V to 229V
        
        const packet = {
            nodeId: bulbId,
            R_V: voltage,
            Y_V: voltage,
            B_V: voltage,
            R_A: current,
            Y_A: current,
            B_A: current,
            Temp: parseFloat((35 + Math.random() * 10).toFixed(1)), // 35C to 45C (running warm)
            CO2: 400 + Math.floor(Math.random() * 50),
            Vib: "NORM",
            Time: new Date().toISOString(),
            timestamp: new Date().toISOString(),
            kwh: parseFloat(kwhAccumulator[bulbId].toFixed(3)),
            kvarh: parseFloat((kwhAccumulator[bulbId] * 0.1).toFixed(3)),
            status: "OPERATIONAL",
            active_power_kw: powerKw,
            current_l1: current,
            voltage_l1: voltage,
            temperature: parseFloat((35 + Math.random() * 10).toFixed(1)),
            pf: parseFloat((0.95 + Math.random() * 0.04).toFixed(2)) // High power factor 0.95-0.99
        };

        try {
            await db.collection('AI_Logs').add(packet);
            await rtdb.ref('AI_Logs').push(packet);
            console.log(`[${new Date().toLocaleTimeString()}] Sent ACTIVE values for ${bulbId} | Power: ${powerKw}kW | Temp: ${packet.Temp}°C`);
        } catch (error) {
            console.error(`Firebase Sync Error for ${bulbId}:`, error);
        }
    }
}

console.log("Starting Firebase ACTIVE Telemetry Sender for Bulbs (a.js)...");
setInterval(pushActiveData, 5000);
pushActiveData(); // Send first batch immediately
