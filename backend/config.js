// Set NODE_ENV=production in the deployed environment; anything else = local dev.
const isProduction = process.env.NODE_ENV === 'production';

const CLIENT_URL = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '');

export { isProduction, CLIENT_URL };
