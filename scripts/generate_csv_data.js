const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();

const machines = [
    { name: 'JMS Industrial', id: 'TX-JMS', zone: 'Zone-B' },
    { name: 'EBOOT CNC', id: 'TX-EBOOT', zone: 'Zone-B' },
    { name: 'SARA Mill', id: 'TX-SARA', zone: 'Zone-B' },
    { name: 'Compressor Array', id: 'D-003', zone: 'Zone-B' }
];

const startTime = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 hours ago
const rows = [];

rows.push('machine_name,node_id,timestamp,voltage_l1,voltage_l2,voltage_l3,current_l1,current_l2,current_l3,active_power_kw,kwh,kvarh,pf,temperature,vibration,co2_ppm');

let totalKwh = { 'TX-JMS': 120, 'TX-EBOOT': 85, 'TX-SARA': 150, 'D-003': 45 };

for (let i = 0; i < 288 * 2; i++) { // 2 days, 5 min intervals
    const currentTime = new Date(startTime.getTime() + i * 5 * 60 * 1000);
    const timestamp = currentTime.toISOString();

    machines.forEach(m => {
        const v1 = 400 + Math.random() * 10 - 5;
        const v2 = 400 + Math.random() * 10 - 5;
        const v3 = 400 + Math.random() * 10 - 5;
        const c1 = 15 + Math.random() * 5;
        const c2 = 15 + Math.random() * 5;
        const c3 = 15 + Math.random() * 5;
        const power = (v1 * c1 + v2 * c2 + v3 * c3) / 1000;
        totalKwh[m.id] += power * (5 / 60);
        const kvarh = totalKwh[m.id] * 0.1;
        const pf = 0.85 + Math.random() * 0.1;
        const temp = 40 + Math.random() * 30;
        const vib = 0.2 + Math.random() * 2;
        const co2 = 400 + Math.random() * 100;

        rows.push(`${m.name},${m.id},${timestamp},${v1.toFixed(1)},${v2.toFixed(1)},${v3.toFixed(1)},${c1.toFixed(2)},${c2.toFixed(2)},${c3.toFixed(2)},${power.toFixed(2)},${totalKwh[m.id].toFixed(3)},${kvarh.toFixed(3)},${pf.toFixed(2)},${temp.toFixed(1)},${vib.toFixed(2)},${co2.toFixed(0)}`);
    });
}

fs.writeFileSync(path.join(projectRoot, 'public/data/jms_eboot_sara_daily.csv'), rows.join('\n'));
console.log('Daily CSV generated.');

// Monthly Data
const monthlyRows = [];
monthlyRows.push('machine_name,node_id,month,avg_kwh,total_kwh,avg_pf,peak_temp');
machines.forEach(m => {
    ['Jan', 'Feb', 'Mar'].forEach(month => {
        monthlyRows.push(`${m.name},${m.id},${month},${(300 + Math.random() * 100).toFixed(1)},${(9000 + Math.random() * 2000).toFixed(1)},${(0.88 + Math.random() * 0.05).toFixed(2)},${(65 + Math.random() * 10).toFixed(1)}`);
    });
});
fs.writeFileSync(path.join(projectRoot, 'public/data/monthly_data.csv'), monthlyRows.join('\n'));
console.log('Monthly CSV generated.');
