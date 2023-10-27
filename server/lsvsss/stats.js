'use strict';

const fs = require('fs');

function incrementVote(fileName) {
  let value = 0;
  try {
    const fileValue = fs.readFileSync(fileName, 'utf-8');
    const fileValueParsed = parseInt(fileValue);
    if (fileValueParsed != fileValue) {
      throw new Error('File ' + JSON.stringify(fileName) + ' doesn\'t contain expected data.');
    }
    value = fileValueParsed;
  } catch (err) {
    if (err.code != 'ENOENT') {
      throw err;
    }
  }
  ++value;
  fs.writeFileSync(fileName, '' + value);
}

module.exports = {
  incrementVote,
};
