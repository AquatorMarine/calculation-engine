import fs from 'fs';
import path from 'path';

function fix(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      fix(full);
    } else if (full.endsWith('.cjs')) {
      let content = fs.readFileSync(full, 'utf8');
      content = content.replace(/require\((['"])(.+?)\.js\1\)/g, "require($1$2.cjs$1)");
      fs.writeFileSync(full, content);
    }
  }
}

fix('dist/cjs');
