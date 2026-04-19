const fs = require('fs');
const path = require('path');

const navbarPath = path.join(__dirname, 'src', 'components', '5rings', 'components', 'Navbar.js');
if (fs.existsSync(navbarPath)) {
  let content = fs.readFileSync(navbarPath, 'utf8');
  content = content
    .replace(/color: location\.pathname === item\.path \? '#0f172a' : '#445566'/g, "color: location.pathname === item.path ? '#F8FAFC' : '#94A3B8'")
    .replace(/bgcolor: location\.pathname === item\.path \? alpha\('#0f172a', 0\.07\) : 'transparent'/g, "bgcolor: location.pathname === item.path ? 'rgba(59, 130, 246, 0.15)' : 'transparent'")
    .replace(/bgcolor: location\.pathname === item\.path \? alpha\('#0f172a', 0\.06\) : 'transparent'/g, "bgcolor: location.pathname === item.path ? 'rgba(59, 130, 246, 0.15)' : 'transparent'")
    .replace(/color: '#0f172a'/g, "color: '#F8FAFC'")
    .replace(/color: '#445566'/g, "color: '#94A3B8'")
    .replace(/color: '#1a1a1a'/g, "color: '#F8FAFC'")
    // The search modal also had a solid white bg earlier, replace it with glass
    .replace(/bgcolor: 'rgba\(11, 17, 32, 0\.95\)'/g, "bgcolor: 'rgba(11, 17, 32, 0.95)', backdropFilter: 'blur(20px)'")
    .replace(/bgcolor: '#fff'/g, "bgcolor: '#1E293B'");
  
  fs.writeFileSync(navbarPath, content, 'utf8');
  console.log('Navbar colors fixed for dark mode legibility.');
}
