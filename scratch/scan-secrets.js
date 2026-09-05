const fs = require('fs');
const path = require('path');

function scanFile(filePath) {
  if (filePath.includes('.git') || filePath.includes('node_modules') || filePath.includes('.next') || filePath.includes('scratch')) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const patterns = [
    { name: 'FB Token (EAAW...)', regex: /EAA[A-Za-z0-9]+/g },
    { name: 'Verify Token hardcode', regex: /BOONDHON_SECRET_\d+/g },
    { name: 'Google API Key (AIza... or AQ...)', regex: /(?:AIza[0-9A-Za-z-_]{35}|AQ\.[A-Za-z0-9_.-]+)/g }
  ];

  patterns.forEach(p => {
    let match;
    while ((match = p.regex.exec(content)) !== null) {
      console.log('Found ' + p.name + ' in ' + filePath + ': ' + match[0].substring(0, 20) + '...');
    }
  });
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full);
    else scanFile(full);
  }
}

console.log('--- Scanning boondhon-git ---');
walk('H:\\Data\\boondhon-git');
console.log('--- Scanning Messenger AI Bot ---');
walk('H:\\Messenger AI Bot');
walk('H:\\Data\\Messenger AI Bot');
