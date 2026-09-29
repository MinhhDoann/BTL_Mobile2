// Redirect node backend/server.js to run the TypeScript backend server
const { spawn } = require('child_process');
const path = require('path');

const backendDir = path.resolve(__dirname);
const child = spawn('npx', ['tsx', 'src/server.ts'], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
