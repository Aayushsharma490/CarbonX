import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

export function useFirebaseLogs() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        // Check if Firebase is actually configured
        const isConfigured = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.includes('YOUR_API_KEY');

        if (!isLive && !isConfigured) {
            // Mock Real-time Feed if not configured
            const interval = setInterval(() => {
                const mockLog = {
                    timestamp: new Date().toISOString(),
                    node_id: "TX-" + Math.floor(Math.random() * 5 + 1),
                    telemetry: {
                        active_power_kw: (Math.random() * 50 + 10).toFixed(2),
                        temperature_c: (Math.random() * 20 + 30).toFixed(1),
                    },
                    status: Math.random() > 0.9 ? "WARNING" : "OPERATIONAL"
                };
                setLogs(prev => [mockLog, ...prev].slice(0, 20));
                setLoading(false);
            }, 3000);
            return () => clearInterval(interval);
        }

        // Real Firebase listener
        try {
            const q = query(collection(db, "AI_Logs"), orderBy("timestamp", "desc"), limit(20));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setLogs(data);
                setLoading(false);
                setIsLive(true);
            }, (error) => {
                // Silently fallback to mock data
                setIsLive(false);
            });
            return () => unsubscribe();
        } catch (e) {
            // Silently fallback
            setIsLive(false);
        }
    }, []);

    return { logs, loading, isLive };
}
