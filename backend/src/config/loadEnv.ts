import { config } from 'dotenv';
// Stable from root, workspace, source and compiled entry points. Process env wins.
config({ path: new URL('../../.env', import.meta.url), quiet: true });
