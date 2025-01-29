import { config } from 'dotenv';
import { resolve } from 'path';

const envPath = resolve(__dirname, '../../.env');
config({ path: envPath }); 