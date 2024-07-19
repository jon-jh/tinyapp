const express = require('express');
const app = express();
const port = 8080;

//  Set up template engine (view folder) and urlencoded option for allowing POST data to be read(like form submission on the website.)
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

//  Generate 6 character string.
const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

//  Init server. homepage: localhost:8080/
app.listen(port, () => {
  console.log(`The example app is listning on port ${port}`);
});

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};


//  PAGES RENDERED WITH EJS
//  We must add routes that are not route parameters (eg. urls/:id) before / above their corresponding route parameter.

//  /urls -Displays current URLs.

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

//  /urls -POST ROUTE

app.post("/urls", (req, res) => {// When this form is submitted (button is pressed) it will make a request to POST /urls, and the response body  will contain one encoded key:value pair with the id and longURL.

  const longURL = req.body.longURL;
  // For the key:value pairs in urlDatabase, id = key, req.body.longURL = value.
  const id = generateRandomString();
  // Now the id is a random number with the value being the longURL.
  urlDatabase[id] = longURL;
  /*
    Adds a new entry to the urlDatabase object with id as the key and longURL as the value. If the key id already exists in the object, it will update the value associated with that key.
  
    Since everything above is done, redirect to the route parameter :id
  */
  res.redirect(`/urls/${id}`);
});


//  /urls/new -Allows a new URL to be shortened.
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

//  /u/:id    -Redirects a request for the shortened url to the matching longURL in the database.
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//  /urls/:id -Route parameter for any & all 'id'.
app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render('urls_show', templateVars);
});

//  /urls/:id/delete -POST ROUTE
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id]; // delete the URL from the database
  res.redirect('/urls'); // redirect back to the URLs list
});



//PAGES NOT EJS RENDERED

//  localhost:8080/
app.get('/', (req, res) => {
  res.send('Hello there!');
});

//  /urls.json
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

//  /hello
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b>, this is an HTML test. <body><html>\n');
});


/*----------End Notes

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

