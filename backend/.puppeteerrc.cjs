const { join } = require('node:path');

/**
 * Store Chrome inside the project directory so it is downloaded during the
 * build step and still present at runtime. Render (and similar hosts) only
 * persist the project workspace between build and run — the default
 * $HOME/.cache/puppeteer location gets wiped, which makes Puppeteer fail with
 * "Could not find Chrome". Keeping the cache here keeps build and runtime in sync.
 *
 * @type {import('puppeteer').Configuration}
 */
module.exports = {
    cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
