import * as execa from 'execa';
import * as path from 'path';

const project = path.join(__dirname, '..');
const projects = {
  '@surgio/gateway-frontend': path.join(project, 'packages/gateway-frontend'),
  '@surgio/gateway': path.join(project, 'packages/gateway'),
};

(async () => {
  await execa('yarn', ['workspace', '@surgio/gateway-frontend', 'run', 'build'], {
    cwd: project,
  })
    .stdout.pipe(process.stdout);

  await execa('mv', [
    path.join(projects['@surgio/gateway-frontend'], './build/'),
    path.join(projects['@surgio/gateway'], './node_modules/@surgio/gateway-frontend/')
  ])
    .stdout.pipe(process.stdout);
})()
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
