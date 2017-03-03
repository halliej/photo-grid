const configFile = process.env.NODE_ENV || 'development';
module.exports = require(`./${configFile}.json`);
