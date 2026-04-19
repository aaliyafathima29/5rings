const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'components', '5rings', 'pages');

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.js'));

const replacements = [
  { regex: /background:\s*'linear-gradient\(135deg, #FAFAFA 0%, #EEEEEE 100%\)'/g, replacement: "background: 'radial-gradient(circle at top right, rgba(37, 99, 235, 0.15) 0%, transparent 60%), radial-gradient(circle at bottom left, rgba(245, 158, 11, 0.1) 0%, transparent 60%)'" },
  { regex: /bgcolor:\s*'#FAFAFA'/g, replacement: "bgcolor: 'transparent'" },
  { regex: /bgcolor:\s*'#f8fafc'/g, replacement: "bgcolor: 'transparent'" },
  { regex: /bgcolor:\s*'white'/g, replacement: "bgcolor: 'background.paper'" },
  { regex: /bgcolor:\s*'#1a1a1a'/g, replacement: "bgcolor: 'background.paper'" },
  { regex: /color:\s*'#1a1a1a'/g, replacement: "color: 'text.primary'" },
  { regex: /color:\s*'#666'/g, replacement: "color: 'text.secondary'" },
  { regex: /color:\s*'#333'/g, replacement: "color: 'text.primary'" },
  { regex: /borderColor:\s*'rgba\(0,\s*0,\s*0,\s*0\.08\)'/g, replacement: "borderColor: 'rgba(255, 255, 255, 0.08)'" },
  { regex: /borderColor:\s*'rgba\(0,\s*0,\s*0,\s*0\.2\)'/g, replacement: "borderColor: 'rgba(255, 255, 255, 0.2)'" },
  { regex: /borderColor:\s*'rgba\(0,\s*0,\s*0,\s*0\.1\)'/g, replacement: "borderColor: 'rgba(255, 255, 255, 0.1)'" },
  { regex: /boxShadow:\s*'0 4px 12px rgba\(0,\s*0,\s*0,\s*0\.05\)'/g, replacement: "boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'" },
  { regex: /bgcolor:\s*alpha\('#1a1a1a',\s*0\.05\)/g, replacement: "bgcolor: alpha('#fff', 0.05)" },
  { regex: /bgcolor:\s*alpha\('#000',\s*0\.03\)/g, replacement: "bgcolor: alpha('#fff', 0.03)" },
  { regex: /bgcolor:\s*alpha\('#000',\s*0\.02\)/g, replacement: "bgcolor: alpha('#fff', 0.02)" },
  { regex: /background:\s*'#FAFAFA'/g, replacement: "background: 'transparent'" },
  { regex: /color:\s*'#000'/g, replacement: "color: 'text.primary'" },
  { regex: /sx=\{\{\s*color:\s*'#1a1a1a',\s*mb:/g, replacement: "sx={{ color: 'text.primary', mb:" },
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

// Also update Layout.js if it exists in components/
const layoutPath = path.join(__dirname, 'src', 'components', 'Layout.js');
if (fs.existsSync(layoutPath)) {
  let layoutContent = fs.readFileSync(layoutPath, 'utf8');
  let layoutChanged = false;
  replacements.forEach(({ regex, replacement }) => {
    if (regex.test(layoutContent)) {
      layoutContent = layoutContent.replace(regex, replacement);
      layoutChanged = true;
    }
  });
  if (layoutChanged) {
    fs.writeFileSync(layoutPath, layoutContent, 'utf8');
    console.log(`Updated Layout.js`);
  }
}
