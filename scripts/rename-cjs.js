import fs from 'fs';
import path from 'path';

function rename(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      rename(full);
    } else if (full.endsWith('.js')) {
      fs.renameSync(full, full.replace(/\.js$/, '.cjs'));
    }
  }
}

rename('dist/cjs');
