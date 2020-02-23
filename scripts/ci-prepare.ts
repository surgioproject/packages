import * as execa from 'execa';
import { join } from 'path';
import * as fs from 'fs';
import * as rimraf from 'rimraf';
import { promisify } from 'util';

const project = join(__dirname, '..');
const projects = {
  '@surgio/gateway-frontend': join(project, 'packages/gateway-frontend'),
  '@surgio/gateway': join(project, 'packages/gateway'),
};

(async () => {
  const buildTarget = join(projects['@surgio/gateway'], './node_modules/@surgio/gateway-frontend/build');

  // await execa('yarn', ['run', 'build'], {
  //   cwd: project,
  // })
  //   .stdout.pipe(process.stdout);

  if (fs.existsSync(buildTarget)) {
    await promisify(rimraf)(buildTarget);
  }

  await execa('cp', [
    '-r',
    join(projects['@surgio/gateway-frontend'], './build'),
    join(projects['@surgio/gateway'], './node_modules/@surgio/gateway-frontend')
  ])
    .stdout.pipe(process.stdout);
})()
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
