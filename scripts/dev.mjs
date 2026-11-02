import { spawn } from 'node:child_process';

const children = ['frontend', 'backend'].map((workspace) => {
  const child = spawn('npm', ['run', 'dev', '-w', workspace], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  child.on('error', (error) => console.error(`${workspace} failed:`, error));
  return child;
});

let stopped = false;
function stop() {
  if (stopped) return;
  stopped = true;
  for (const child of children) {
    if (child.exitCode === null && child.pid) child.kill('SIGTERM');
  }
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
process.on('exit', stop);
