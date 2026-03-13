'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { PhaseType } from '@/types/energy';

export interface DeviceSpec {
    id: string;
    name: string;
    phaseType: PhaseType;
    power: number; // in Watts
    current: number; // in Amperes
}

export interface TXUnit {
    id: string;
    name: string;
    devices: DeviceSpec[];
}

export interface SystemConfig {
    id: string;
    name: string;
    lossThreshold: number; // Percentage
    unitRate: number; // Cost per kWh basically
    txUnits: TXUnit[];
}

interface SystemContextType {
    config: SystemConfig;
    updateConfig: (updates: Partial<SystemConfig>) => void;
    addTXUnit: (tx: TXUnit) => void;
    updateTXUnit: (id: string, updates: Partial<TXUnit>) => void;
    deleteTXUnit: (id: string) => void;
    addDevice: (txId: string, device: DeviceSpec) => void;
    updateDevice: (txId: string, deviceId: string, updates: Partial<DeviceSpec>) => void;
    deleteDevice: (txId: string, deviceId: string) => void;
}

const DEFAULT_CONFIG: SystemConfig = {
    id: "RX-001",
    name: "Main Receiver",
    lossThreshold: 10,
    unitRate: 8.5, // Default Rs. 8.5 per Unit
    txUnits: [
        {
            id: 'TX-1',
            name: 'Transmitter 1 (Zone-A)',
            devices: [
                { id: 'D-001', name: 'CNC Machine A', phaseType: 'three', power: 15000, current: 22 },
                { id: 'D-002', name: 'Lathe B', phaseType: 'three', power: 10000, current: 15 }
            ]
        },
        {
            id: 'TX-2',
            name: 'Transmitter 2 (Zone-B)',
            devices: [
                { id: 'TX-JMS', name: 'JMS Industrial', phaseType: 'three', power: 25000, current: 35 },
                { id: 'TX-EBOOT', name: 'EBOOT CNC', phaseType: 'three', power: 18000, current: 28 },
                { id: 'TX-SARA', name: 'SARA Mill', phaseType: 'three', power: 22000, current: 32 },
                { id: 'D-003', name: 'Compressor Array', phaseType: 'three', power: 12000, current: 18 }
            ]
        },
        {
            id: 'TX-3',
            name: 'Transmitter 3 (Zone-C)',
            devices: [
                { id: 'TX-ALPHA', name: 'Alpha Grinder', phaseType: 'three', power: 20000, current: 30 },
                { id: 'TX-BETA', name: 'Beta Press', phaseType: 'three', power: 28000, current: 38 },
                { id: 'TX-GAMMA', name: 'Gamma Lathe', phaseType: 'three', power: 16000, current: 25 }
            ]
        },
        {
            id: 'XT-2',
            name: 'XT2 Crane (Zone-D)',
            devices: [
                { id: 'XT2-CRANE-01', name: 'XT2 Main Crane', phaseType: 'three', power: 35000, current: 45 },
                { id: 'XT2-HOIST-01', name: 'XT2 Hoist System', phaseType: 'three', power: 28000, current: 38 },
                { id: 'XT2-MOTOR-01', name: 'XT2 Drive Motor', phaseType: 'three', power: 32000, current: 42 }
            ]
        }
    ]
};

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export function SystemProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('carbonx_advanced_config');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setConfig(parsed);
            } catch (e) {
                console.error('Failed to load config', e);
            }
        }
        setInitialized(true);
    }, []);

    useEffect(() => {
        if (initialized) {
            localStorage.setItem('carbonx_advanced_config', JSON.stringify(config));
        }
    }, [config, initialized]);

    const updateConfig = (updates: Partial<SystemConfig>) => {
        setConfig(prev => ({ ...prev, ...updates }));
    };

    const addTXUnit = (tx: TXUnit) => {
        setConfig(prev => ({ ...prev, txUnits: [...prev.txUnits, tx] }));
    };

    const updateTXUnit = (id: string, updates: Partial<TXUnit>) => {
        setConfig(prev => ({
            ...prev,
            txUnits: prev.txUnits.map(tx => tx.id === id ? { ...tx, ...updates } : tx)
        }));
    };

    const deleteTXUnit = (id: string) => {
        setConfig(prev => ({
            ...prev,
            txUnits: prev.txUnits.filter(tx => tx.id !== id)
        }));
    };

    const addDevice = (txId: string, device: DeviceSpec) => {
        setConfig(prev => ({
            ...prev,
            txUnits: prev.txUnits.map(tx => tx.id === txId
                ? { ...tx, devices: [...tx.devices, device] }
                : tx
            )
        }));
    };

    const updateDevice = (txId: string, deviceId: string, updates: Partial<DeviceSpec>) => {
        setConfig(prev => ({
            ...prev,
            txUnits: prev.txUnits.map(tx => tx.id === txId
                ? { ...tx, devices: tx.devices.map(d => d.id === deviceId ? { ...d, ...updates } : d) }
                : tx
            )
        }));
    };

    const deleteDevice = (txId: string, deviceId: string) => {
        setConfig(prev => ({
            ...prev,
            txUnits: prev.txUnits.map(tx => tx.id === txId
                ? { ...tx, devices: tx.devices.filter(d => d.id !== deviceId) }
                : tx
            )
        }));
    };

    return (
        <SystemContext.Provider value={{
            config, updateConfig,
            addTXUnit, updateTXUnit, deleteTXUnit,
            addDevice, updateDevice, deleteDevice
        }}>
            {children}
        </SystemContext.Provider>
    );
}

export function useSystem() {
    const context = useContext(SystemContext);
    if (!context) throw new Error('useSystem must be used within SystemProvider');
    return context;
}
