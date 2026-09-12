const fs = require('fs');
const path = require('path');

function save(relPath, content) {
  const full = path.resolve(relPath);
  const dir = path.dirname(full);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('Saved:', relPath);
}

module.exports = { save };