const express = require('express');
const path = require('path');
const { Client } = require('pg');
const port = process.env.PORT || 5000

const app = express();

const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect();
db = client.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('db connected');
});
client.query('SELECT table_table', (err, res) => {
  if (err) throw err;
  for (let row of res.rows) {
    console.log(JSON.stringify(row));
  }
  client.end();
});

app.use(express.urlencoded({extended: false}))
app.set('viewsForMe', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.listen(port, ()=>{
    console.log("on port " + port);
});