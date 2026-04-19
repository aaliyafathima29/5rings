const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'components', '5rings', 'pages');

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.js'));

const replacements = [
  // Fix attributes using double quotes that escaped the first regex
  { regex: /color="#1a1a1a"/g, replacement: 'color="text.primary"' },
  { regex: /color="#0f172a"/g, replacement: 'color="text.primary"' },
  { regex: /color="#333"/g, replacement: 'color="text.primary"' },
  { regex: /color="#666"/g, replacement: 'color="text.secondary"' },
  { regex: /bgcolor="#1a1a1a"/g, replacement: 'bgcolor="background.paper"' },
  { regex: /bgcolor="#0f172a"/g, replacement: 'bgcolor="background.paper"' },
  // Fix text shadows making light text invisible
  { regex: /textShadow:\s*'0 1px 0 rgba\(255,\s*255,\s*255,\s*0\.35\)'/g, replacement: "textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'" },
  // Any lingering border colors that might be dark
  { regex: /borderColor:\s*'#1a1a1a'/g, replacement: "borderColor: 'primary.main'" },
  { regex: /bgcolor:\s*'#1a1a1a'/g, replacement: "bgcolor: 'background.paper'" }
];

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  let changed = false;
  replacements.forEach(({ regex, replacement }) => {
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});

// Layout / Navbar
['Navbar.js', 'Footer.js'].forEach(file => {
  const filePath = path.join(__dirname, 'src', 'components', '5rings', 'components', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    replacements.forEach(({ regex, replacement }) => {
      if (regex.test(content)) {
        content = content.replace(regex, replacement);
        changed = true;
      }
    });
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
});
