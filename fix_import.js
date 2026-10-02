const fs = require('fs');
let c = fs.readFileSync('D:/Mobile2/src/app/song-detail.tsx', 'utf8');
if (!c.includes('Linking')) {
    c = c.replace(/View\n} from 'react-native';/, "View,\n    Linking\n} from 'react-native';");
    c = c.replace(/View\r\n} from 'react-native';/, "View,\r\n    Linking\r\n} from 'react-native';");
    fs.writeFileSync('D:/Mobile2/src/app/song-detail.tsx', c);
    console.log('Fixed import');
} else {
    console.log('Already imported');
}
