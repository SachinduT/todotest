import { spawn } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const processes = [];

function start(name, args) {
  const child = spawn(npmCommand, args, {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: false,
  });

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`${name} stopped with exit code ${code}.`);
      stopAll(code);
    }
  });

  processes.push(child);
}

function stopAll(exitCode = 0) {
  for (const child of processes) {
    if (!child.killed) child.kill('SIGTERM');
  }
  process.exit(exitCode);
}

process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));

console.log('Starting To-Do API and React client...');
start('Server', ['run', 'dev', '--prefix', 'server']);
start('Client', ['run', 'dev', '--prefix', 'client']);
