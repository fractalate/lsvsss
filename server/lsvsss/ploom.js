'use strict';

const crypto = require('crypto');
const fs = require('fs');

// Reference calculations.
const NUMBER_OF_FILES = 256;
const NUMBER_OF_BITS_PER_FILE = 64 * 4096 * 8; // 64 typical 4096 byte blocks on storage.
const TOTAL_STORAGE_BYTES = NUMBER_OF_FILES * NUMBER_OF_BITS_PER_FILE / 8; // Should be 64 MB.
const MAX_ATTEMPTS = 5;

// value: string
// attempt: number
// returns [fileNumber: number, bitNumber: number]
function calculateHash(value, attempt) {
  const hash = crypto.createHash('sha256');
  hash.update(value + ':' + attempt, 'utf-8');
  const raw = hash.digest();
  const fileNumber = raw[0];
  // TODO: Make this mask in terms of the constants defined at the top.
  const bitNumber = 0x1FFFFF & (
    (raw[1]) | (raw[2] << 8) | (raw[3] << 16)
  );
  return [fileNumber, bitNumber];
}

class PloomFile {
  constructor(fileName, numberOfBits) {
    this.fileName = fileName;
    this.buffer = Buffer.alloc(numberOfBits / 8);
    this.loadFileSync();
  }

  loadFileSync() {
    try {
      // Copy the data from the file, zero fill the in-memory buffer if the file is too small.
      const data = fs.readFileSync(this.fileName);
      for (let i = 0; i < this.buffer.length; ++i) {
        this.buffer[i] = i < data.length ? data[i] : 0;
      }
    } catch (err) {
      if (err.code == 'ENOENT') {
        // Not a problem!
      } else {
        throw err;
      }
    }
  }

  getFileSizeOnDisk() {
    try {
      const stat = fs.statSync(this.fileName);
      return stat.size;
    } catch (err) {
      if (err.code == 'ENOENT') {
        return 0; // It wouldn't have a size in this case.
      }
      throw err;
    }
  }

  openFile() {
    let fd = null;
    try {
      fd = fs.openSync(this.fileName, 'r+');
    } catch (err) {
      if (err.code == 'ENOENT') {
        fd = fs.openSync(this.fileName, 'w');
      } else {
        throw err;
      }
    }
    this.padFile(fd);
    return fd;
  }

  padFile(fd) {
    const fileSize = this.getFileSizeOnDisk();
    const bytesToAdd = this.buffer.length - fileSize;
    if (bytesToAdd) {
      fs.writeSync(fd, this.buffer, fileSize, bytesToAdd, fileSize);
    }
  }

  isSet(bitNumber) {
    const index = Math.floor(bitNumber / 8);
    const mask = 1 << (bitNumber & 0x7);
    return (this.buffer[index] & mask) != 0;
  }

  setBitHigh(bitNumber) {
    const index = Math.floor(bitNumber / 8);
    const mask = 1 << (bitNumber & 0x7);
    this.buffer[index] = this.buffer[index] | mask;
    const fout = this.openFile();
    fs.writeSync(fout, this.buffer, index, 1, index);
    fs.closeSync(fout);
  }
}

class Ploom {
  constructor() {
    this.files = new Map(); // key is file number, value is PloomFile object.
  }

  getFile(fileNumber) {
    let file = this.files.get(fileNumber);
    if (file == null) {
      file = new PloomFile('__ploom_' + fileNumber + '.dat', NUMBER_OF_BITS_PER_FILE);
      this.files.set(fileNumber, file);
    }
    return file;
  }

  count(value) {
    let attempt;
    for (attempt = 0; attempt < MAX_ATTEMPTS; ++attempt) {
      const [fileNumber, bitNumber] = calculateHash(value, attempt);
      const file = this.getFile(fileNumber);
      if (!file.isSet(bitNumber)) {
        break; // The current attempt number is the current count.
      } 
    }
    return attempt;
  }

  insert(value) {
    let attempt;
    for (attempt = 0; attempt < MAX_ATTEMPTS; ++attempt) {
      const [fileNumber, bitNumber] = calculateHash(value, attempt);
      const file = this.getFile(fileNumber);
      if (!file.isSet(bitNumber)) {
        file.setBitHigh(bitNumber);
        break; // The current attempt number is the current count.
      } 
    }
    return attempt;
  }
}

module.exports = {
  Ploom,
  MAX_ATTEMPTS,
};
