
const express = require('express');
const app = express();
const port = 8080;
const cookieParser = require('cookie-parser');
app.use(cookieParser());

//  Set up template engine (view folder) and urlencoded option for allowing     POST data to be read(like form submission on the website.)
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

//  Init server. homepage: localhost:8080/urls
app.listen(port, () => {
  console.log(`The example app is listning on port ${port}`);
});

//  Generate 6 character string.
const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

//  URL Object Database
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//  Users Object Database
const users = {};

//  Add New User To Database Function
const register = (email, password) => {
  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password
  };
  return id;
};

/*--EJS RENDERED PAGES--*/

//  /register ( get / render route )
app.get('/register', (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render('register', templateVars);
});

//  /register ( post route )
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  id = register(email, password);
  res.cookie('user_id', id);
  res.redirect('/urls');
});

//  /login ( post route )
app.post('/login', (req, res) => {
  const { username } = req.body;

  res.cookie('username', username,); // Used by username form found in _header partial.
  res.redirect('/urls');
});

//  /logout ( post route )
app.post('/logout', (req, res) => {
  res.clearCookie('username'); //clear the 'username' cookie
  res.redirect('/urls'); //redirect to /urls for now
});

//  /urls ( get / render route ) -Displays current URLs.
app.get('/urls', (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render('urls_index', templateVars);
});

//  /urls ( post route )
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


//  /urls/new ( get / render route ) -Allows a new URL to be shortened.
app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render('urls_new', templateVars);
});

//  /u/:id ( get / render route )    -Redirects a request for the shortened url to the matching longURL in the database.
app.get('/u/:id', (req, res) => {

  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});


//  /urls/:id ( get / render route ) -Route parameter for any & all 'id'.
app.get('/urls/:id', (req, res) => {
  const templateVars = { username: req.cookies["username"], id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render('urls_show', templateVars);
});

//  /urls/:id ( post route )
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  if (urlDatabase[id]) {
    urlDatabase[id] = longURL;
  }

  res.redirect('/urls');
});

//  /urls/:id/delete ( post route )
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id]; // delete the URL from the database
  res.redirect('/urls'); // redirect back to the URLs list
});

/*--PAGES NOT EJS RENDERED--*/

// //  localhost:8080/
// app.get('/', (req, res) => {
//   res.send('Hello there!');
// });

// //  /urls.json
// app.get('/urls.json', (req, res) => {
//   res.json(urlDatabase);
// });

// //  /hello
// app.get('/hello', (req, res) => {
//   res.send('<html><body>Hello <b>World</b>, this is an HTML test. <body><html>\n');
// });


/*----------End Notes

- a GET route is where the HTML webpage is created / RENDERED.
- a POST route is where the HTML webpage goes when some button is clicked and information needs to be updated or accessed from the server.

HTTP  Method	CRUD  Action
      GET	          Read
      POST	        Create
      PUT	          Update
      DELETE	      Delete
*/

