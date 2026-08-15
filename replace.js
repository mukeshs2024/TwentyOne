const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.ts') || file.endsWith('.tsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Replace getProfile with getRequireProfile from @/lib/auth
  if (content.includes('getProfile()') || content.includes('getProfile }')) {
    content = content.replace(/import \{ getProfile \} from [^\n]+;/g, 'import { getRequireProfile as getProfile } from "@/lib/auth";');
    
    if (content.includes('async function getProfile()')) {
       content = content.replace(/async function getProfile\(\) \{[\s\S]*?return profile;\n\}/, '');
       content = 'import { getRequireProfile as getProfile } from "@/lib/auth";\n' + content;
    }
    changed = true;
  }
  
  if (content.includes('async function getClientDateBoundaries()')) {
    content = content.replace(/async function getClientDateBoundaries\(\) \{[\s\S]*?return getDayBoundaries\(clientDate\);\n\}/, '');
    content = 'import { getClientDateBoundaries } from "@/lib/auth";\n' + content;
    changed = true;
  }

  const newContent = content
    .replace(/'\/dashboard'/g, "'/today'")
    .replace(/\"\/dashboard\"/g, '"/today"')
    .replace(/'\/analytics'/g, "'/insights'")
    .replace(/\"\/analytics\"/g, '"/insights"')
    .replace(/'\/challenges'/g, "'/journey'")
    .replace(/\"\/challenges\"/g, '"/journey"')
    .replace(/@\/app\/dashboard\/actions/g, '@/app/today/actions')
    .replace(/@\/app\/challenges\/actions/g, '@/app/journey/actions')
    .replace(/@\/app\/analytics\/actions/g, '@/app/insights/actions');

  if (newContent !== content || changed) {
    fs.writeFileSync(file, newContent);
    console.log('Updated:', file);
  }
});
