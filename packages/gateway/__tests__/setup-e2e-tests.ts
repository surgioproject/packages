import * as path from 'path';
import './stub-request';

process.env.SURGIO_PROVIDER_CACHE_MAXAGE = '-1';
process.env.SURGIO_PROJECT_DIR = path.join(__dirname, '__fixtures__/gateway');
