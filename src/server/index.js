require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', express.static(path.join(__dirname, '../public')));

// your API calls

app.get('/apod', async (req, res) => {
    try {
      const image = await fetch(
        `https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`
      )
      .then(response => response.json());
      
      res.send({ image });
    } catch (err) {
      console.log('error:', err);
    }
  });

app.get('/rover', async (req, res) => {
    const rovers = `https://api.nasa.gov/mars-photos/api/v1/rovers/?api_key=${process.env.API_KEY}`;
    
    try {
        const roversData = await fetch(rovers).then(response => response.json());

        return res.send(roversData);
    } catch (err) {
        console.log('error:', err);
    }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))