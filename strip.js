const fs = require('fs');
const path = require('path');
const os = require('os');

// Require strip-comments from temp dir
const strip = require(path.join(os.tmpdir(), 'node_modules', 'strip-comments'));

const root = path.join(__dirname, 'apps');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (let file of list) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('dist') && !file.includes('target')) {
        results = results.concat(walk(file));
      }
    } else {
      if (/\.(java|js|jsx|ts|tsx)$/.test(file)) {
        results.push(file);
      }
    }
  }
  return results;
}

const files = walk(root);
let count = 0;
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let stripped = strip(content);
  if (content !== stripped) {
    fs.writeFileSync(file, stripped, 'utf8');
    count++;
  }
}
console.log('Stripped comments from ' + count + ' files.');
