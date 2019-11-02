'use strict';

// Future server
const express = require('express');
const app = express();
const bodyParser = require("body-parser");

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(3000, function () {
  console.log('Server listening on port 3000!');
});

gameServer.listen(2657)
