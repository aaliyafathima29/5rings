const fs = require('fs');
const path = require('path');

const foodPath = path.join(__dirname, 'src', 'components', '5rings', 'pages', 'Food.js');

if (fs.existsSync(foodPath)) {
  let content = fs.readFileSync(foodPath, 'utf8');

  // Background and Border Fixes
  content = content
    .replace(/bgcolor: '#fff'/g, "className: 'glass-panel', bgcolor: 'transparent'")
    .replace(/bgcolor: '#0f172a'/g, "bgcolor: '#0B1120'")
    .replace(/borderBottom: '1px solid #e2e8f0'/g, "borderBottom: '1px solid rgba(255,255,255,0.05)'")
    .replace(/border: '1px solid #e2e8f0'/g, "border: '1px solid rgba(255,255,255,0.1)'")
    .replace(/borderColor: '#e2e8f0'/g, "borderColor: 'rgba(255,255,255,0.1)'")
    .replace(/borderColor: category === cat \? '#0f172a'/g, "borderColor: category === cat ? '#3B82F6'")
    .replace(/bgcolor: category === cat \? '#0f172a'/g, "bgcolor: category === cat ? '#3B82F6'")
    .replace(/'&:hover': \{ bgcolor: category === cat \? '#1e293b' : '#f8fafc' \}/g, "'&:hover': { bgcolor: category === cat ? '#2563EB' : 'rgba(255,255,255,0.05)' }")
    .replace(/'&:hover': \{ bgcolor: diet === opt\.key \? '#15803d' : '#f8fafc' \}/g, "'&:hover': { bgcolor: diet === opt.key ? '#15803d' : 'rgba(255,255,255,0.05)' }")
    .replace(/bgcolor: '#f1f5f9'/g, "bgcolor: 'rgba(255,255,255,0.03)'");

  // Typography Fixes
  content = content
    .replace(/color: '#0f172a'/g, "color: '#F8FAFC'")
    .replace(/color: '#334155'/g, "color: '#E2E8F0'")
    .replace(/color: '#64748b'/g, "color: '#94A3B8'")
    .replace(/color: '#94a3b8'/g, "color: '#94A3B8'")
    .replace(/color: '#475569'/g, "color: '#CBD5E1'")
    .replace(/color: '#cbd5e1'/g, "color: '#475569'"); // Inverse empty state icon

  // Buttons and Specific Modals
  content = content
    .replace(/bgcolor: '#1e293b'/g, "bgcolor: '#1E293B'")
    .replace(/bgcolor: 'rgba\(0,0,0,0\.45\)'/g, "bgcolor: 'rgba(255,255,255,0.1)'")
    .replace(/boxShadow: '0 8px 32px rgba\(15,23,42,0\.1\)'/g, "boxShadow: '0 12px 32px rgba(0,0,0,0.5)'")
    // Dialog backgrounds
    .replace(/<DialogContent sx=\{\{ pt: 2\.5 \}\}>/g, "<DialogContent sx={{ pt: 2.5, bgcolor: '#0B1120' }}>")
    .replace(/<DialogActions sx=\{\{ px: 3, pb: 3 \}\}>/g, "<DialogActions sx={{ px: 3, pb: 3, bgcolor: '#0B1120' }}>")
    .replace(/<DialogContent sx=\{\{ pt: 3, textAlign: 'center' \}\}>/g, "<DialogContent sx={{ pt: 3, textAlign: 'center', bgcolor: '#0B1120' }}>")
    .replace(/<DialogActions sx=\{\{ px: 3, pb: 3, gap: 1 \}\}>/g, "<DialogActions sx={{ px: 3, pb: 3, gap: 1, bgcolor: '#0B1120' }}>");

  // Fix button text on hover for detail
  content = content
    .replace(/'&:hover': \{ borderColor: '#0f172a', color: '#0f172a', bgcolor: 'transparent' \}/g, "'&:hover': { borderColor: '#3B82F6', color: '#3B82F6', bgcolor: 'transparent' }");

  fs.writeFileSync(foodPath, content, 'utf8');
  console.log('Food.js colors updated.');
}
