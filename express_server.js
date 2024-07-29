const express = require('express');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');

const { urlDatabase, users } = require('./database');
const {
  urlsForUser,
  getUserByEmail,
  register,
  validateEmailPassword,
  isEmailInUse,
  loggedIn,
  generateRandomString,
} = require('./helpers');
const {
  notFoundResponse,
  newUserResponse,
  emailInUseResponse,
  cantBeEmptyResponse,
} = require('./response');

const app = express();
const port = 8080;

// Configuration
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true })); // Allow reading POST data.
app.use(cookieSession({
  name: 'session',
  keys: [generateRandomString()],
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
}));


//---------------


// Route Handlers
// GET /register
app.get('/register', (req, res) => {
  if (!loggedIn(req)) {
    const user_id = req.session.user_id;
    const user = users[user_id];
    const templateVars = { user, urls: urlDatabase };
    res.render('register', templateVars);
    return;
  }
  console.log('redirect');
  res.redirect('/urls');
});


// POST /register
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!validateEmailPassword(email, password)) {
    cantBeEmptyResponse;
  }
  // Check if email is already in use
  if (isEmailInUse(email, users)) {
    emailInUseResponse;
  }
  const userId = register(email, password, users, generateRandomString);
  req.session.user_id = userId;
  res.redirect('/protected');
});


// GET /login
app.get('/login', (req, res) => {
  if (!loggedIn(req)) {
    const user_id = req.session.user_id;
    const user = users[user_id];
    const templateVars = { user, urls: urlDatabase };
    res.render('login', templateVars);
    return;
  }
  res.redirect('/urls');
});


// POST /login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const foundUser = getUserByEmail(email, users);

  if (foundUser && bcrypt.compareSync(password, foundUser.password)) {
    // If the user exists and the password matches, log them in and create a session
    req.session.user_id = foundUser.id;
    console.log(`${foundUser.id} logged in`);
    res.redirect('/protected');
  } else {
    // If the user doesn't exist or the password doesn't match, show an error and redirect
    return newUserResponse(res);
  }
});


// GET /logout - using POST actually broke this, would not let user log in again after logging out.


app.get('/logout', (req, res) => {
  req.session = null; // Clear the session
  res.redirect('/login'); // Redirect to login page after logout
});


// GET /urls - Displays saved URLs
app.get('/urls', (req, res) => {
  if (!loggedIn(req)) {
    return res.redirect('/trylogin');
  }
  const user_id = req.session.user_id;
  const user = users[user_id];
  const userFilter = urlsForUser(user_id, urlDatabase); // Use the helper function
  const templateVars = { user, urls: userFilter };
  res.render('urls_index', templateVars);
});


// GET /trylogin
app.get('/trylogin', (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = { user, urls: urlDatabase };
  res.render('trylogin', templateVars);
});


// POST /urls
app.post('/urls', (req, res) => {
  // Protected Page - Check for User Login
  const currentUser = req.session.user_id;
  if (!currentUser) { // If currentUser does not exist (nobody logged in)
    return res.send('\nTried to post but was not logged in. Action was cancelled.');
  }
  const longURL = req.body.longURL; // For the key:value pairs in urlDatabase, id = key, req.body.longURL = value.
  const id = generateRandomString(); // Now the id is a random number with the value being the longURL.
  urlDatabase[id] = {
    longURL: longURL,
    nestedObjectID: currentUser // Store the user ID as nestedObjectID
  };
  res.redirect(`/urls/${id}`);
});


// GET /urls/new
app.get('/urls/new', (req, res) => {
  if (!loggedIn(req)) {
    return res.redirect('/trylogin');
  }
  const user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = { user };
  res.render('urls_new', templateVars);
});


// GET /u/:id - Redirects a click on a shortened URL to the normal website
app.get('/u/:id', (req, res) => {
  const id = req.params.id;
  if (!urlDatabase[id]) {
    return notFoundResponse(res);
  }
  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
});


// GET /urls/:id - Route parameter for any & all 'id'
app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  if (!loggedIn(req)) {
    return res.redirect('/trylogin');
  }

  const currentUser = req.session.user_id;
  const urlEntry = urlDatabase[id];
  if (!urlDatabase[id] || !urlEntry || urlEntry.nestedObjectID !== currentUser) {
    return notFoundResponse(res);
  }
  const user = users[currentUser];
  const templateVars = { user, id, longURL: urlDatabase[id].longURL };
  res.render('urls_show', templateVars);
});


// POST /urls/:id
app.post('/urls/:id', (req, res) => {
  const currentUser = req.session.user_id;
  if (!currentUser) {
    return res.send('\nTried to post but was not logged in. Action was cancelled.');
  }
  const id = req.params.id;
  const longURL = req.body.longURL;
  if (urlDatabase[id]) {
    urlDatabase[id] = {
      longURL,
      nestedObjectID: currentUser
    };
  }
  res.redirect('/urls');
});


// POST /urls/:id/delete
app.post('/urls/:id/delete', (req, res) => {
  // Protected Page - Check for User Login
  const currentUser = req.session.user_id; // Use session data

  if (!currentUser) { // If currentUser does not exist (nobody logged in)
    res.send('\n---curl delete attempt---');
    return;
  }

  const id = req.params.id;
  const urlEntry = urlDatabase[id];
  // Check if the URL exists and if the current user is the owner
  if (!urlEntry || urlEntry.nestedObjectID !== currentUser) {
    res.send('\nUser tried to delete a URL they do not own. Action was cancelled.');
    return;
  }
  delete urlDatabase[id]; // delete the URL from the database
  res.redirect('/urls'); // redirect back to the URLs list
});


// GET /protected - only shows when user is logged in
app.get('/protected', (req, res) => {
  const currentUser = req.session.user_id; // Use session data
  if (!currentUser) { // If currentUser does not exist (nobody logged in)
    return res.redirect('/login');
  }
  const user = users[currentUser];
  const templateVars = { user };
  res.render('protected', templateVars);
});


// GET /
app.get('/', (req, res) => {
  const currentUser = req.session.user_id; // Use session data
  if (!currentUser) { // If currentUser does not exist (nobody logged in)
    return res.redirect('/trylogin');
  }
});


// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}. \nNote - may need to manually delete cookies and restart server if there are issues.\n`);
});