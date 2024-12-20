const crypto = require('crypto');

console.log("Generated Token:", crypto.randomBytes(16).toString('hex'));
