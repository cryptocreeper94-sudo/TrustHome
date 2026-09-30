const fs = require('fs');
let l = fs.readFileSync('D:/trusthome/app/_layout.tsx', 'utf8');

l = l.replace(
  /<\/Stack>\s*<DrawerMenu \/>/m,
  `</Stack>\n      </NavThemeProvider>\n      <DrawerMenu />`
);

fs.writeFileSync('D:/trusthome/app/_layout.tsx', l);
