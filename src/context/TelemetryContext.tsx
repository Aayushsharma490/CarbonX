'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { db, realtimeDb } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { ref, onValue, query as rtdbQuery, limitToLast } from 'firebase/database';
import { useSystem } from './SystemContext';
import { useGlobalNotifications } from '@/context/NotificationContext';
import type { RXEnergyUnit, TXEnergyUnit } from '@/types/energy';

interface TelemetryContextType {
    latestLogs: any[];
    loading: boolean;
    isLive: boolean;
    gatewayData: RXEnergyUnit | null;
    nodeData: TXEnergyUnit[];
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
    const { config } = useSystem();
    const { addNotification } = useGlobalNotifications();
    const [latestLogs, setLatestLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLive, setIsLive] = useState(false);
    const [simulatedNodes, setSimulatedNodes] = useState<Map<string, any>>(new Map());
    const [csvData, setCsvData] = useState<any[]>([]);
    const [tick, setTick] = useState(0);

    const prevStatuses = useRef<Map<string, boolean>>(new Map());
    const lastAlertTime = useRef<Map<string, number>>(new Map());

    // --- CSV Loader ---
    useEffect(() => {
        fetch(`/data/jms_eboot_sara_daily.csv?t=${Date.now()}`)
            .then(res => res.text())
            .then(text => {
                const lines = text.split('\n');
                const headers = lines[0].split(',').map(h => h.trim());
                const data = lines.slice(1).filter(l => l.trim()).map(line => {
                    const values = line.split(',');
                    return headers.reduce((obj, header, i) => {
                        obj[header] = values[i]?.trim();
                        return obj;
                    }, {} as any);
                });
                setCsvData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load telemetry CSV:", err);
                setLoading(false);
            });
    }, []);

    // --- CSV Sampling Interval (5 seconds) with XT2 Crane Real-Time Alerts ---
    useEffect(() => {
        if (csvData.length === 0) return;

        const updateSimulated = () => {
            const newSimulated = new Map();
            // Dynamically load ALL machine IDs from System Config
            const machineIds = config.txUnits.flatMap(tx => tx.devices.map(d => d.id));
            
            machineIds.forEach(id => {
                const machineRows = csvData.filter(r => r.node_id === id);
                let rowData;
                
                if (machineRows.length > 0) {
                    rowData = machineRows[Math.floor(Math.random() * machineRows.length)];
                } else if (id.startsWith('XT2-')) {
                    // Generate synthetic data for XT2 devices
                    rowData = {
                        node_id: id,
                        active_power_kw: (Math.random() * 30 + 15).toFixed(2),
                        temperature: (Math.random() * 25 + 45).toFixed(1),
                        temperature_c: (Math.random() * 25 + 45).toFixed(1),
                        vibration: (Math.random() * 2.5 + 0.3).toFixed(2),
                        vibration_v_rms: (Math.random() * 2.5 + 0.3).toFixed(2),
                        voltage_l1: (Math.random() * 20 + 390).toFixed(1),
                        voltage_l2: (Math.random() * 20 + 390).toFixed(1),
                        voltage_l3: (Math.random() * 20 + 390).toFixed(1),
                        current_l1: (Math.random() * 15 + 30).toFixed(1),
                        current_l2: (Math.random() * 15 + 30).toFixed(1),
                        current_l3: (Math.random() * 15 + 30).toFixed(1),
                        pf: (Math.random() * 0.15 + 0.85).toFixed(2),
                        kwh: (Math.random() * 100 + 500).toFixed(2),
                        kvarh: (Math.random() * 50 + 100).toFixed(2),
                        co2_ppm: Math.floor(Math.random() * 100 + 400)
                    };
                } else {
                    // Simulate a running active device (like the a.js script) for unknown/new nodes
                    const powerKw = (0.2 + Math.random() * 0.3).toFixed(2);
                    const current = (parseFloat(powerKw) * 1000 / 230).toFixed(2);
                    const voltage = (220 + Math.random() * 10).toFixed(1);

                    rowData = {
                        node_id: id,
                        active_power_kw: powerKw,
                        temperature: (35 + Math.random() * 10).toFixed(1),
                        temperature_c: (35 + Math.random() * 10).toFixed(1),
                        vibration: "0.00",
                        vibration_v_rms: "0.00",
                        voltage_l1: voltage,
                        voltage_l2: voltage,
                        voltage_l3: voltage,
                        current_l1: current,
                        current_l2: current,
                        current_l3: current,
                        pf: (0.95 + Math.random() * 0.04).toFixed(2),
                        kwh: (Math.random() * 50).toFixed(2),
                        kvarh: (Math.random() * 5).toFixed(2),
                        co2_ppm: Math.floor(400 + Math.random() * 50),
                        status: "OPERATIONAL"
                    };
                }
                
                newSimulated.set(id, rowData);

                // Real-Time Alert System (5-second monitoring) with throttling
                const temp = parseFloat(rowData.temperature || rowData.temperature_c || 0);
                const vibration = parseFloat(rowData.vibration || rowData.vibration_v_rms || 0);
                const power = parseFloat(rowData.active_power_kw || 0);
                const isXT2 = id.startsWith('XT2-');
                const now = Date.now();
                
                // Throttle alerts to prevent spam (30 seconds between same alert type)
                const canAlert = (alertKey: string) => {
                    const lastTime = lastAlertTime.current.get(alertKey) || 0;
                    if (now - lastTime > 30000) {
                        lastAlertTime.current.set(alertKey, now);
                        return true;
                    }
                    return false;
                };
                
                const deviceName = config.txUnits.flatMap(tx => tx.devices).find(d => d.id === id)?.name || id;

                // XT2 Crane-specific critical alerts
                if (isXT2) {
                    if (temp > 70 && canAlert(`${id}-temp-critical`)) {
                        addNotification({
                            severity: 'critical',
                            title: `🚨 XT2 CRITICAL: ${deviceName}`,
                            message: `EMERGENCY! Temperature: ${temp}°C - Immediate shutdown required!`,
                            nodeId: id
                        });
                    } else if (temp > 65 && canAlert(`${id}-temp-warning`)) {
                        addNotification({
                            severity: 'warning',
                            title: `⚠️ XT2 Alert: ${deviceName}`,
                            message: `High temperature detected: ${temp}°C`,
                            nodeId: id
                        });
                    }

                    if (vibration > 3.0 && canAlert(`${id}-vib-critical`)) {
                        addNotification({
                            severity: 'critical',
                            title: `🚨 XT2 VIBRATION: ${deviceName}`,
                            message: `Critical vibration: ${vibration.toFixed(1)} mm/s - Check crane structure!`,
                            nodeId: id
                        });
                    } else if (vibration > 2.2 && canAlert(`${id}-vib-warning`)) {
                        addNotification({
                            severity: 'warning',
                            title: `📳 XT2 Vibration: ${deviceName}`,
                            message: `Elevated vibration: ${vibration.toFixed(1)} mm/s`,
                            nodeId: id
                        });
                    }

                    if (power > 40 && canAlert(`${id}-power-warning`)) {
                        addNotification({
                            severity: 'warning',
                            title: `⚡ XT2 Overload: ${deviceName}`,
                            message: `Power spike detected: ${power} kW - Check load capacity`,
                            nodeId: id
                        });
                    }
                } else {
                    // TX2 devices alerts
                    if (temp > 65 && canAlert(`${id}-temp-critical`)) {
                        addNotification({
                            severity: 'critical',
                            title: `🔥 TX2 Critical: ${deviceName}`,
                            message: `Critical temperature detected: ${temp}°C`,
                            nodeId: id
                        });
                    } else if (temp > 62 && canAlert(`${id}-temp-warning`)) {
                        addNotification({
                            severity: 'warning',
                            title: `⚠️ TX2 Warning: ${deviceName}`,
                            message: `Temperature rising: ${temp}°C`,
                            nodeId: id
                        });
                    }

                    if (vibration > 2.0 && canAlert(`${id}-vib-warning`)) {
                        addNotification({
                            severity: 'warning',
                            title: `📳 TX2 Vibration: ${deviceName}`,
                            message: `High vibration detected: ${vibration.toFixed(1)} mm/s`,
                            nodeId: id
                        });
                    }
                }

                // Online/Offline status monitoring
                const isOnline = true;
                if (prevStatuses.current.get(id) === false && isOnline === true) {
                    if (canAlert(`${id}-online`)) {
                        addNotification({
                            severity: 'info',
                            title: `📡 ${isXT2 ? 'XT2' : 'TX2'} Node Online`,
                            message: `${deviceName} has reconnected to the protocol.`,
                            nodeId: id
                        });
                    }
                }
                prevStatuses.current.set(id, isOnline);
            });
            setSimulatedNodes(newSimulated);
            setTick(t => t + 1);
        };
        
        // Run immediately, then every 5 seconds
        updateSimulated();
        const interval = setInterval(updateSimulated, 5000);

        return () => clearInterval(interval);
    }, [csvData, addNotification]);

    useEffect(() => {
        setLoading(true);
        // --- 1. Firestore Listener (Legacy/Backup) ---
        let unsubscribeFirestore = () => { };
        if (db) {
            const q = query(collection(db, "AI_Logs"), orderBy("timestamp", "desc"), limit(50));
            unsubscribeFirestore = onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setLatestLogs(prev => {
                    const combined = [...data, ...prev].slice(0, 100);
                    return Array.from(new Map(combined.map(item => [item.id || item.Time, item])).values());
                });
                setIsLive(true);
                setLoading(false);
            }, (error) => {
                // Silently ignore permission errors in Simulation mode
                setIsLive(false);
                setLoading(false);
            });
        }

        // --- 2. Realtime Database Listener (Primary) ---
        let unsubscribeRTDB = () => { };
        if (realtimeDb) {
            const logsRef = rtdbQuery(ref(realtimeDb, 'AI_Logs'), limitToLast(50));
            unsubscribeRTDB = onValue(logsRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const logsArray = Object.keys(data).map(key => ({
                        id: key,
                        ...data[key]
                    })).reverse(); 

                    setLatestLogs(prev => {
                        const combined = [...logsArray, ...prev].slice(0, 100);
                        return Array.from(new Map(combined.map(item => [item.id || item.Time || Math.random(), item])).values());
                    });
                    setIsLive(true);
                }
                setLoading(false);
            }, (error) => {
                // Silently ignore permission errors in Simulation mode
                setIsLive(false);
                setLoading(false);
            });
        } else {
            setLoading(false);
        }

        return () => {
            unsubscribeFirestore();
            if (realtimeDb) unsubscribeRTDB();
        };
    }, []);

    // Transform raw logs into high-level energy units
    const { gatewayData, nodeData } = useMemo(() => {
        // 1. Latest per node for Firebase
        const latestPerNode = new Map<string, any>();
        latestLogs.forEach(log => {
            const id = log.node_id || log.nodeId;
            if (id && !latestPerNode.has(id)) {
                latestPerNode.set(id, log);
            }
        });

        const txNodes: TXEnergyUnit[] = config.txUnits.flatMap(tx =>
            tx.devices.map(device => {
                let log: any;
                let source = 'firebase';
                const firebaseLog = latestPerNode.get(tx.id) || latestPerNode.get(device.id);

                if (firebaseLog) {
                    log = firebaseLog;
                    source = 'firebase';
                } else if (tx.id === 'TX-2' || tx.id === 'XT-2' || simulatedNodes.has(device.id)) {
                    log = simulatedNodes.get(device.id);
                    source = 'csv';
                }

                if (!log) {
                    return {
                        nodeId: device.id,
                        name: device.name,
                        zone: tx.name,
                        phaseType: device.phaseType,
                        targetKw: (device.power || 15000) / 1000,
                        kwh: 0, kvarh: 0, currentKw: 0,
                        phaseVoltages: [400, 400, 400],
                        phaseCurrents: [0, 0, 0],
                        powerFactor: 0.95, temperature: 45, vibration: 0.5, ppm: 420,
                        isOnline: false, timestamp: new Date().toISOString()
                    };
                }

                // --- Extraction Mapping ---
                const rawTel = log.telemetry || {};
                const timestamp = log.Time || log.timestamp || new Date().toISOString();
                
                let currentKw = source === 'csv' ? parseFloat(log.active_power_kw) : parseFloat(rawTel.active_power_kw ?? log.active_power_kw ?? 0);
                if (currentKw === 0 && log.R_A && source === 'firebase') {
                    const phasePower = ((log.R_V ?? 230) * (log.R_A ?? 0) + (log.Y_V ?? 230) * (log.Y_A ?? 0) + (log.B_V ?? 230) * (log.B_A ?? 0));
                    currentKw = parseFloat((phasePower / 1000).toFixed(2));
                }

                return {
                    nodeId: device.id,
                    name: device.name,
                    zone: tx.name,
                    phaseType: device.phaseType,
                    targetKw: (device.power || 15000) / 1000,
                    kwh: parseFloat(log.kwh ?? rawTel.kwh ?? 0),
                    kvarh: parseFloat(log.kvarh ?? rawTel.kvarh ?? 0),
                    currentKw: currentKw ?? 0,
                    phaseVoltages: source === 'csv' 
                        ? [parseFloat(log.voltage_l1), parseFloat(log.voltage_l2), parseFloat(log.voltage_l3)]
                        : [log.R_V ?? 0, log.Y_V ?? 0, log.B_V ?? 0],
                    phaseCurrents: source === 'csv'
                        ? [parseFloat(log.current_l1), parseFloat(log.current_l2), parseFloat(log.current_l3)]
                        : [log.R_A ?? 0, log.Y_A ?? 0, log.B_A ?? 0],
                    powerFactor: parseFloat(log.pf ?? log.PF ?? rawTel.power_factor ?? 0.92),
                    temperature: parseFloat(log.temperature ?? log.temperature_c ?? log.Temp ?? rawTel.temperature_c ?? 45),
                    vibration: typeof log.vibration === 'string' ? (log.vibration === 'NORM' ? 0.45 : 3.2) : parseFloat(log.vibration ?? log.vibration_v_rms ?? log.Vib ?? 0.5),
                    ppm: parseFloat(log.co2_ppm ?? log.ppm ?? log.CO2 ?? 420),
                    isOnline: source === 'csv' ? true : (Date.now() - new Date(timestamp).getTime() < 45000),
                    timestamp
                };
            })
        );

        // Aggregation logic
        const totalKwh = txNodes.reduce((acc, n) => acc + n.kwh, 0);
        const gateway: RXEnergyUnit = {
            gatewayId: config.id,
            name: config.name,
            totalKwh: totalKwh * 1.02, 
            totalKvarh: txNodes.reduce((acc, n) => acc + n.kvarh, 0),
            voltage: txNodes[0]?.phaseVoltages[0] || 400,
            current: txNodes.reduce((acc, n) => acc + n.phaseCurrents[0], 0),
            powerFactor: 0.92,
            timestamp: new Date().toISOString(),
            txNodes: txNodes
        };

        return { gatewayData: gateway, nodeData: txNodes };
    }, [latestLogs, simulatedNodes, config, tick]);

    return (
        <TelemetryContext.Provider value={{ latestLogs, loading, isLive, gatewayData, nodeData }}>
            {children}
        </TelemetryContext.Provider>
    );
}

export function useTelemetry() {
    const context = useContext(TelemetryContext);
    if (!context) throw new Error('useTelemetry must be used within TelemetryProvider');
    return context;
}
