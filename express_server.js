const express = require('express');
const app = express();
const port = 8080;

app.set('view engine', 'ejs');

//Init Server
app.listen(port, () => {
  console.log(`The example app is listning on port ${port}`);
});

//Home Page---localhost:8080
app.get('/', (req, res) => {
  res.send('Hello there!');
});

//------------/urls.json
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
}); // This adds the web page but does not render it with EJS.

app.get('/urls', (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render('urls_index', templateVars);
}); // New page, rendered with EJS.

//------------/hello
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b>, this is an HTML test. <body><html>\n');
});




