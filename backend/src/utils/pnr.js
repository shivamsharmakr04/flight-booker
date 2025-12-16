const { v4: uuidv4 } = require('uuid');

function generatePNR() {
  // Short uppercase unique string
  return 'PNR-' + uuidv4().split('-')[0].toUpperCase();
}

module.exports = { generatePNR };
