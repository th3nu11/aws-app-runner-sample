const express = require('express');
const app = express();
const port = process.env.APP_PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World, this is my first app runner application!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});