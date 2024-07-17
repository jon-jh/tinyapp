const express = require('express');
const app = express();
const port = 8080;

app.set('view engine', 'ejs');

//init server
app.listen(port, () => {
  console.log(`The example app is listning on port ${port}`);
});

//home page - localhost:8080
app.get('/', (req, res) => {
  res.send('Hello there!');
});

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//pages rendered with EJS
//-/urls
app.get('/urls', (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render('urls_index', templateVars);
});
//-/urls/:id
app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render('urls_show', templateVars);
});

//pages not EJS rendered
//-/urls.json
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});
//-/hello
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b>, this is an HTML test. <body><html>\n');
});



