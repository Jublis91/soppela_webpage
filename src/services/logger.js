import fs from 'fs';
import path from 'path';

const logFilePath = path.join(process.cwd(), 'logs', 'activity.log');

export function logEvent(event) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ${event}\n`;

    fs.appendFile(lofFilePath, Linter, (err) => {
        if (err) console.error('❌ Virhe lokitiedoston kirjoituksessa:', err.message);
    })
}