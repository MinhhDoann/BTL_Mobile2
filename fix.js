const fs = require('fs');
let c = fs.readFileSync('D:/Mobile2/src/app/song-detail.tsx', 'utf8');
c = c.replace(/alert\(.*\);/, "Linking.openURL('https://www.facebook.com');");
fs.writeFileSync('D:/Mobile2/src/app/song-detail.tsx', c);
console.log('Fixed');