// Set NODE_ENV=production in the deployed environment; anything else = local dev.
const isProduction = process.env.NODE_ENV === 'production';

const CLIENT_URL = isProduction ? 'https://docweave.tarunsumanthpuli.me' : 'http://localhost:5173';

export { isProduction, CLIENT_URL };
