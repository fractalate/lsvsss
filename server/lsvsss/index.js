'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { Ploom, MAX_ATTEMPTS } = require('./ploom');
const { incrementVote } = require('./stats');

const app = express();
const ploom = new Ploom();

let lastTime = 0;

// 1 KB sounds like a reasonable size for a vote submission. It should be MUCH less in practice,
// but the packet carrying the request is likely larger than 1024 bytes anyway.
app.use(bodyParser.json({
  limit: 1024,
}));

// Example Invocation
// curl -v -X POST http://localhost:3000/vote -H 'Content-Type: application/json' --data '{"uuid":"hi","category":"F","classification":"L"}'
app.post('/vote', (req, res, next) => {
  const { uuid, category, classification } = req.body;
  if (typeof uuid !== 'string' ||
      !/^[0-9A-F]$/.test(category) ||
      !/^[LS]$/.test(classification)) {
    return res.status(400).end();
  }
  if (ploom.insert(uuid) < MAX_ATTEMPTS) {
    incrementVote('__stats_' + category + '_' + classification + '.dat');
  } else {
    const now = new Date().getTime();
    if (now - lastTime > 5000) {
      console.log('excess from', uuid);
      lastTime = now;
    }
  }
  res.end();
});

app.listen(3000, '127.0.0.1', () => {
  console.log('listening on 3000');
});
