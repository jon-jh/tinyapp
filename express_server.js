const express = require('express');
const app = express();
const port = 8080;

//Set up template engine (view folder) and urlencoded option for allowing POST data to be read(like form submission on the website.)
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

//generate 6 character string
const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

//init server
app.listen(port, () => {
  console.log(`The example app is listning on port ${port}`);
});

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};



//PAGES RENDERED WITH EJS

// We must add routes that are not route parameters (eg. urls/:id) before / above that route parameter.

//----------/urls
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {// This means when this form is submitted, it will make a request to POST / urls, and the body will contain one URL - encoded name - value pair with the name longURL.

  const longURL = req.body.longURL;
  // For the key-value pairs in urlDatabase, req.body.longURL = value, id = key.
  // req.body.longURL: Require the data posted in the body of longURL.
  const id = generateRandomString();
  // now the id is a random number with the value being the longURL.
  urlDatabase[id] = longURL;
  // JavaScript adds a new entry to the urlDatabase object with id as the key and longURL as the value. If the key id already exists in the object, it will update the value associated with that key.

  res.redirect(`/urls/${id}`); // Since everything above is done, redirect to the route parameter :id
});

//----------/urls/new - page to add a new URL to be shortened. most general in the order so comes first.
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

//----------/u/:id - redirects a request to a shortened url to the actual longURL from the database. more specific than the next.
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//----------/urls/:id - route parameter for all / any 'id', so it is more general and should come last in the order.
app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render('urls_show', templateVars);
});



//PAGES NOT EJS RENDERED

//----------localhost:8080/
app.get('/', (req, res) => {
  res.send('Hello there!');
});

//----------/urls.json
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

//----------/hello
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b>, this is an HTML test. <body><html>\n');
});


/*----------clarification notes

- After our browser renders our new URL form, the user populates the form with a longURL and presses submit.
- Our browser sends a POST request to our server.
- Our server logs the request body to the console, then responds with 200 OK.
- Our browser renders the "Ok" message.

HTTP  Method	CRUD  Action
      GET	          Read
      POST	        Create
      PUT	          Update
      DELETE	      Delete
*/

