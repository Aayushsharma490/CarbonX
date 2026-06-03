import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

// Initialize firebase admin globally
if (!admin.apps.length) {
    try {
        const keyPath = path.join(process.cwd(), 'scripts', 'serviceAccountKey.json');
        if (fs.existsSync(keyPath)) {
            const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: "https://techfusion-930cf-default-rtdb.firebaseio.com"
            });
            console.log("Admin initialized successfully in API Route.");
        }
    } catch (e) {
        console.error("Firebase Admin Init Error:", e);
    }
}

export async function GET() {
    if (!admin.apps.length) {
        return NextResponse.json({ error: "Missing serviceAccountKey.json" }, { status: 500 });
    }

    try {
        const rtdb = admin.database();
        const logsRef = rtdb.ref('AI_Logs').limitToLast(50);
        const snapshot = await logsRef.once('value');
        const data = snapshot.val();
        
        if (!data) return NextResponse.json({ logs: [] });

        const logsArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
        })).reverse(); // newest first

        return NextResponse.json({ logs: logsArray });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to read Firebase" }, { status: 500 });
    }
}
