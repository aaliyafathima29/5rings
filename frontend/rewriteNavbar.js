const fs = require('fs');
const path = require('path');

const navbarPath = path.join(__dirname, 'src', 'components', '5rings', 'components', 'Navbar.js');
if (fs.existsSync(navbarPath)) {
  let content = fs.readFileSync(navbarPath, 'utf8');
  content = content
    .replace(/bgcolor: 'white'/g, "bgcolor: 'background.paper'")
    .replace(/color: '#1a1a1a'/g, "color: 'text.primary'")
    .replace(/color: '#0f172a'/g, "color: 'text.primary'")
    .replace(/bgcolor: scrolled \? 'rgba\(255, 255, 255, 0\.98\)' : 'rgba\(255, 255, 255, 0\.95\)'/g, "bgcolor: scrolled ? 'rgba(11, 17, 32, 0.85)' : 'rgba(11, 17, 32, 0.5)'")
    .replace(/bgcolor: 'rgba\(255, 255, 255, 0\.98\)'/g, "bgcolor: 'rgba(11, 17, 32, 0.95)'")
    .replace(/color: '#445566'/g, "color: 'text.secondary'")
    .replace(/borderLeft: location\.pathname === item\.path \? '3px solid #0f172a' : '3px solid transparent'/g, "borderLeft: location.pathname === item.path ? '3px solid #3b82f6' : '3px solid transparent'")
    .replace(/bgcolor: alpha\('#0f172a'/g, "bgcolor: alpha('#3b82f6'")
    .replace(/bgcolor: '#0f172a'/g, "bgcolor: '#3b82f6'")
    .replace(/bgcolor: '#1a1a1a'/g, "bgcolor: 'background.paper'")
    .replace(/borderColor: 'rgba\(0, 0, 0, 0\.08\)'/g, "borderColor: 'rgba(255, 255, 255, 0.1)'")
    .replace(/borderColor: 'rgba\(0, 0, 0, 0\.05\)'/g, "borderColor: 'rgba(255, 255, 255, 0.05)'")
    .replace(/border: '1px solid rgba\(0, 0, 0, 0\.08\)'/g, "border: '1px solid rgba(255, 255, 255, 0.1)'")
    .replace(/boxShadow: scrolled \? '0 2px 20px rgba\(0, 0, 0, 0\.05\)' : 'none'/g, "boxShadow: scrolled ? '0 8px 32px rgba(0, 0, 0, 0.3)' : 'none'")
    .replace(/boxShadow: '0 8px 32px rgba\(0, 0, 0, 0\.08\)'/g, "boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'")
    .replace(/alpha\('#1a1a1a'/g, "alpha('#fff'")
    .replace(/bgcolor: 'linear-gradient\(135deg, #1a1a1a 0%, #2a2a2a 100%\)'/g, "bgcolor: 'primary.main'")
    .replace(/color: 'rgba\(0, 0, 0, 0\.1\)'/g, "color: 'rgba(255, 255, 255, 0.1)'");

  fs.writeFileSync(navbarPath, content, 'utf8');
  console.log('Updated Navbar.js');
}

const footerPath = path.join(__dirname, 'src', 'components', '5rings', 'components', 'Footer.js');
if (fs.existsSync(footerPath)) {
  let content = fs.readFileSync(footerPath, 'utf8');
  // Footer already has bgcolor: '#1a1a1a' and color: 'white', which is decent, but let's make it match the dark theme background
  content = content
    .replace(/bgcolor: '#1a1a1a'/g, "bgcolor: 'background.default'")
    .replace(/borderTop: '1px solid rgba\(255, 255, 255, 0\.1\)'/g, "borderTop: '1px solid rgba(255, 255, 255, 0.05)'")

  fs.writeFileSync(footerPath, content, 'utf8');
  console.log('Updated Footer.js');
}
