const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src', 'app', 'api'));
let changed = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Revert _request to request
  content = content.replace(/export async function (GET|POST|PUT|DELETE)\(_request: NextRequest\)/g, 'export async function $1(request: NextRequest)');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    changed++;
    console.log(`Reverted ${file}`);
  }
}

console.log(`Done. Reverted ${changed} files.`);
