# XT2 Crane System - Real-Time Monitoring

## Overview
XT2 Crane system has been added to Zone-D with 3 devices and real-time alert monitoring.

## Devices Added

### Zone-D: XT2 Crane (Zone-D)
1. **XT2-CRANE-01** - XT2 Main Crane
   - Power: 35 kW
   - Current: 45 A
   - Phase: Three-phase

2. **XT2-HOIST-01** - XT2 Hoist System
   - Power: 28 kW
   - Current: 38 A
   - Phase: Three-phase

3. **XT2-MOTOR-01** - XT2 Drive Motor
   - Power: 32 kW
   - Current: 42 A
   - Phase: Three-phase

## Real-Time Alert System (5-Second Monitoring)

### Critical Alerts (Red)
- **Temperature > 70°C**: Emergency shutdown required
- **Vibration > 3.0 mm/s**: Critical structural check needed
- Triggers immediate notification on web interface

### Warning Alerts (Orange)
- **Temperature > 65°C**: High temperature detected
- **Vibration > 2.2 mm/s**: Elevated vibration levels
- **Power > 40 kW**: Overload condition

### Info Alerts (Blue)
- Device online/offline status changes
- System reconnection notifications

## Features

### Mobile Responsive Design
- Optimized for all screen sizes (mobile, tablet, desktop)
- Touch-friendly notification dismissal
- Adaptive text sizing and spacing
- Full-width notifications on mobile devices

### Real-Time Updates
- 5-second monitoring interval
- Instant alert delivery to web interface
- Live telemetry data streaming
- Automatic status tracking

### Alert Display
- Bottom-right corner on desktop
- Bottom center on mobile
- Maximum 5 alerts visible at once
- Auto-dismiss or manual close options
- High-contrast dark theme for visibility

## Monitoring Parameters

Each XT2 device monitors:
- Active Power (kW)
- Temperature (°C)
- Vibration (mm/s)
- Voltage (3-phase)
- Current (3-phase)
- Power Factor
- Energy Consumption (kWh)
- CO2 PPM levels

## Access Points

1. **Dashboard**: Overview of all zones including XT2
2. **Machines Page**: Detailed XT2 device health and gauges
3. **Notifications**: Real-time alerts overlay on all pages
4. **Reports**: Historical data and trends

## Technical Implementation

- **Context**: SystemContext.tsx (device configuration)
- **Telemetry**: TelemetryContext.tsx (real-time monitoring)
- **Notifications**: NotificationSystem.tsx (alert display)
- **Update Frequency**: 5 seconds
- **Alert Latency**: < 5 seconds from trigger to display
