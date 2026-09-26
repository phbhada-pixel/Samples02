import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const dbPath = path.join(rootDir, 'data', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Generate self-contained defaultData.js for static GitHub Pages and standalone execution
const code = `// PHC Bhada NVBDCP Client-side Database & Reporting Engine for Standalone / GitHub Pages Mode
window.DEFAULT_DB_SNAPSHOT = ${JSON.stringify(db)};
`;

const outputPath = path.join(rootDir, 'defaultData.js');
fs.writeFileSync(outputPath, code, 'utf8');
console.log('Successfully generated defaultData.js! File size:', fs.statSync(outputPath).size);
