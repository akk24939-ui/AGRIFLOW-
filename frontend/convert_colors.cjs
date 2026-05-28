const fs = require('fs');

const files = [
  'src/owner/OwnerApp.tsx',
  'src/agent/AgentApp.tsx',
  'src/agent/AgentTaskDetails.tsx'
];

const colorMap = [
  { regex: /'#0[a-f0-9]{5}'|"#0[a-f0-9]{5}"/gi, replacement: "'var(--bg-base)'" }, // #0f172a, #0b1118, #0a1219
  { regex: /'rgba\(1[0-5], ?[1-3][0-9], ?[2-4][0-9], ?0\.[0-9]+\)'|"rgba\(1[0-5], ?[1-3][0-9], ?[2-4][0-9], ?0\.[0-9]+\)"/gi, replacement: "'var(--bg-surface)'" }, // rgba(10,18,25,0.95), rgba(15,25,35,0.9)
  { regex: /'#1e293b'|"#1e293b"/gi, replacement: "'var(--bg-card)'" },
  { regex: /'#334155'|"#334155"/gi, replacement: "'var(--bg-elevated)'" },
  { regex: /'rgba\(255, ?255, ?255, ?0\.0[2-8]\)'|"rgba\(255, ?255, ?255, ?0\.0[2-8]\)"/gi, replacement: "'var(--glass-bg)'" },
  { regex: /'rgba\(255, ?255, ?255, ?0\.1[0-5]?\)'|"rgba\(255, ?255, ?255, ?0\.1[0-5]?\)"/gi, replacement: "'var(--glass-border)'" },
  { regex: /'#f1f5f9'|"#f1f5f9"|'#fff'|"#fff"|'white'|"white"/gi, replacement: "('var(--text-primary)')" },
  { regex: /'#94a3b8'|"#94a3b8"/gi, replacement: "'var(--text-secondary)'" },
  { regex: /'#64748b'|"#64748b"|'#475569'|"#475569"/gi, replacement: "'var(--text-muted)'" },
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  for (const mapping of colorMap) {
    content = content.replace(mapping.regex, (match) => {
      // Fix for #fff which might be inside an icon or linear-gradient
      if (match.includes('fff') && !match.includes('(')) {
        return "'var(--text-primary)'";
      }
      return mapping.replacement;
    });
  }
  
  // Specific fixes
  content = content.replace(/background: 'var\(--text-primary\)'/g, "background: '#fff'"); // Revert text-primary for backgrounds if needed (mostly avatars etc)
  
  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
}
