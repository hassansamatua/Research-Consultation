const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Next.js development server without Turbo...');

// Start Next.js without turbo
const nextDev = spawn('npx', ['next', 'dev'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

nextDev.on('error', (error) => {
  console.error('Failed to start Next.js:', error);
});

nextDev.on('close', (code) => {
  console.log(`Next.js process exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping Next.js development server...');
  nextDev.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Stopping Next.js development server...');
  nextDev.kill('SIGTERM');
});
