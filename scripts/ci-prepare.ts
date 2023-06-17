import * as execa from 'execa';
import { join } from 'path';
import * as fs from 'fs';
import { rimraf } from 'rimraf';

const project = join(__dirname, '..');
const projects = {
  '@surgio/gateway-frontend': join(project, 'packages/gateway-frontend'),
  '@surgio/gateway': join(project, 'packages/gateway'),
};

(async () => {
  const buildTarget = join(projects['@surgio/gateway'], './node_modules/@surgio/gateway-frontend/build');

  const buildProc = execa('pnpm', ['run', 'build'], {
    cwd: project,
  });

  buildProc.stdout.pipe(process.stdout);

  await buildProc;

  if (fs.existsSync(buildTarget)) {
    await rimraf(buildTarget);
  }

  await execa('cp', [
    '-r',
    join(projects['@surgio/gateway-frontend'], './build'),
    join(projects['@surgio/gateway'], './node_modules/@surgio/gateway-frontend')
  ]);
})()
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
