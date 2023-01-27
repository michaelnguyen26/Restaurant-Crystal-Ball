const API_KEY = "nUwsU_s90-gPi9MmYXSxBO1tpLH-4HO93zerjnkeoilYXIN2xqA5iFmkZc59EdL3vWLw2K7x4rpRV1SiVLqPhZFj4oPzJgCWwaMI-69RActy0j4-fovcuiroFx29Y3Yx";
const fetch = require('node-fetch');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const serverless = require('serverless-http')
const app = express();
const router = express.Router();

let url = "https://api.yelp.com/v3/businesses/search?"
let htmlResult = "";


router.use(bodyParser.urlencoded({ extended: false }));
router.use(express.static(path.join(__dirname, '../dist/')));

// Serve the HTML file
router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Need to make an async function since request to API takes time
router.post('/', async function (req, res) {
  let location = req.body.location;
  let food = req.body.food;
  let result = req.body.results;

  // Define headers to API request
  const config = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${API_KEY}`
    }
  };
  // Need to await here since api request takes time
  const data = await fetch(url + `location=${location}&term=${food}&sort_by=best_match&limit=25`, config)
    .then(response => response.json())
    .then(json => json)
    .catch(err => console.error('error:' + err));

  // Get size of response for random count
  var key, count = 0;
  for (key in data.businesses) {
    count++;
  }

  // Length of desired results to be displayed
  let names = new Array(result);
  let images = new Array(result);
  let addressArr = new Array(result);
  let yelpurl = new Array(result);
  let counter = new Array(result);

  for (let r = 0; r < result; r++) {
    // Choose a unique random number
    let randomNumber = Math.floor(Math.random() * count);
    while (counter.includes(randomNumber)) {
      randomNumber = Math.floor(Math.random() * count);
    }
    // Parse out information from data
    counter[r] = randomNumber;
    names[r] = data.businesses[randomNumber].name
    images[r] = data.businesses[randomNumber].image_url;
    addressArr[r] = data.businesses[randomNumber].location.display_address;
    yelpurl[r] = data.businesses[randomNumber].url;

    // Concatenate address
    let address = "";
    for (val of addressArr[r]) {
      address = address + " " + val;
    }
    // console.log(address);

    //set the appropriate HTTP header
    res.setHeader('Content-Type', 'text/html');
    

    //send multiple responses to the client
    htmlResult = htmlResult + `<div class = "result">
        <h1><b>Restaurant: ${names[r]} <b></h1>
        <h2><b>Address: ${address}<b></h2>
        <div class = "image">
        <img src=${images[r]} alt="food-image" width="300" height="300"></img> 
        </div>
        <div class = "tag">
        <a href=${yelpurl[r]}><b>Yelp URL<b></a><br> 
        </div>  </div><br><br> `;
  }

  let html = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <title>Restaurant Crystal Ball</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
      <link rel="stylesheet" href="./results.css">
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.1/jquery.min.js"></script>
      <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
  </head>
  <body>
  ${htmlResult}
  </body>`
  

  res.write(html + "<script>alert(\"RANDOM RESTAURANT HAS BEEN CHOSEN!\")</script>");
  res.end();
  htmlResult = "";
  html = "";

});

app.use('/.netlify/functions/server', router);
module.exports = app
module.exports.handler = serverless(app);

