// Config
const express = require('express'); // HTML library.
const app = express();
const port = 8080;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true })); // Allow reading POST data.

const cookieParser = require('cookie-parser'); // Needed to read cookies.
app.use(cookieParser()); // Set express app to use this library.

// Start server.
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

/* Global Vars */
// Random String Generator
const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};
// URL Database
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
// User Database
const users = {
};
// Function Add New User To Database
const register = (email, password) => {
  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password
  };
  return id;
};


/* Route Handlers */
// GET /register
app.get('/register', (req, res) => {
  const user_id = req.cookies['user_id'];
  const user = users[user_id];
  const templateVars = { user, urls: urlDatabase };
  res.render('register', templateVars);
});

// POST /register
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const id = register(email, password);
  res.cookie('user_id', id);
  console.log('Registered user_id:', id);
  res.redirect('/urls');
});

// GET /login
app.get('/login', (req, res) => {
  const user_id = req.cookies['user_id'];
  const user = users[user_id];
  const templateVars = { user, urls: urlDatabase };
  res.render('login', templateVars);
});

// POST /login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const id = register(email, password);
  res.cookie('user_id', id);
  console.log('Logged in user_id:', id);
  res.redirect('/urls');

  // app.post('/login', (req, res) => {
  //   const { email, password } = req.body;
  //   // Find the user with the given email
  //   const user = Object.values(users).find(user => user.email === email);
  //   if (user && user.password === password) {
  //     // If the user exists and the password is correct, log them in
  //     res.cookie('user_id', user.id);
  //     console.log('Logged in user_id:', user.id);
  //     res.redirect('/urls');
  //   } else {
  //     // If the user doesn't exist or the password is incorrect, show an error
  //     res.status(403).send('Invalid email or password');
  //   }
  // });

});

// POST /logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id'); //clear the 'username' cookie
  res.redirect('/urls');
});

// GET /urls -Displays saved URLs.
app.get('/urls', (req, res) => {
  const user_id = req.cookies['user_id'];
  const user = users[user_id];
  const templateVars = { user, urls: urlDatabase };
  res.render('urls_index', templateVars);
});

// POST /urls
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

// GET /urls/new
app.get('/urls/new', (req, res) => {
  const user_id = req.cookies['user_id'];
  const user = users[user_id];
  const templateVars = { user };
  res.render('urls_new', templateVars);
});

// GET /u/:id -Redirects a request for the shortened url to the matching longURL in the database.
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// GET /urls/:id -Route parameter for any & all 'id'.
app.get('/urls/:id', (req, res) => {
  const user_id = req.cookies['user_id'];
  const user = users[user_id];
  const templateVars = { user, id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render('urls_show', templateVars);
});

// POST /urls/:id
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  if (urlDatabase[id]) {
    urlDatabase[id] = longURL;
  }
  res.redirect('/urls');
});

// POST /urls/:id/delete
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id]; // delete the URL from the database
  res.redirect('/urls'); // redirect back to the URLs list
});