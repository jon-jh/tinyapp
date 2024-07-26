// Config
const express = require('express'); // HTML library.
// const cookieParser = require('cookie-parser'); // Needed to read cookies.
const bcrypt = require("bcryptjs");
const app = express();
const port = 8080;
// app.use(cookieParser()); // Set express app to use this library.
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true })); // Allow reading POST data.

const cookieSession = require('cookie-session');

// (Global)Random String Generator
const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

app.use(cookieSession({
  name: 'session',
  keys: [generateRandomString()],
  maxAge: 24 * 60 * 60 * 1000
}));

// Start
app.listen(port, () => {
  console.log(`Server running on port ${port}. \nNote - may need to manually delete cookies and restart server if there are issues.\n`);
});


// (Global)URL Database
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    nestedObjectID: "rvdedt",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    nestedObjectID: "rvdedt",
  },
};

// (Global)User Database
const users = {};

// (Global)Function register user/password and encrypt the password here at the source using hashSync.
const register = (email, password) => {
  const id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10); // use hashSync
  users[id] = {
    id,
    email,
    password: hashedPassword
  };
  // Encrypted password check
  console.log(users);
  return id;
};

// (Global)Function check email or password are empty before register
function validateEmailPassword(email, password) {
  return email && password;
}

// (Global)Function to check if email is already in use before register
function isEmailInUse(email) {
  return Object.values(users).some(user => user.email === email);
}

// (Global)Function check if user is logged in
function loggedIn(req) {
  return req.session.user_id ? true : false;
} // returns true or false, by checking if user_id session exists. (req.session contains all the session data sent from the client, and (req) lets the function look in the incoming request (req).

// (Route Handlers)

// GET /register
app.get('/register', (req, res) => {
  if (!loggedIn(req)) {
    const user_id = req.session.user_id;
    const user = users[user_id];
    const templateVars = { user, urls: urlDatabase };
    res.render('register', templateVars);
    return;
  }
  console.log('\nDebug - Register clicked but already logged in - Redirect');
  res.redirect('/urls');
  return;
});

// POST /register
app.post('/register', (req, res) => {
  const { email, password } = req.body;

  if (!validateEmailPassword(email, password)) {
    return res.status(400).send(`
        <p>The fields can not be empty. Redirecting!</p>
        <script>
          setTimeout(() => {
            window.location.href = '/register';
          }, 4000);
        </script>
      `);
  }

  // Check if email is already in use
  if (isEmailInUse(email)) {
    return res.status(400).send(`
        <p>That email is already registered. Redirecting!</p>
        <script>
          setTimeout(() => {
            window.location.href = '/register';
          }, 4000);
        </script>
      `);
  }

  const id = register(email, password);
  req.session.user_id = id; // Set session data
  console.log('\nRegistered user_id:', id);
  res.redirect('/urls');
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
  console.log('\nDebug - Login clicked but already logged in - Redirect');
  res.redirect('/urls');
  return;
});

// POST /login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Find the user by email
  let foundUser = null;
  for (const user in users) {
    if (users[user].email === email) {
      foundUser = users[user];
      break;
    }
  }

  if (foundUser && bcrypt.compareSync(password, foundUser.password)) {
    // If the user exists and the password is matching the bcrypt password, log them in, create a user_id session for them.
    req.session.user_id = foundUser.id;
    console.log('\nLogged in user_id:', foundUser.id);
    res.redirect('/protected');
  } else if (!foundUser || foundUser.password !== password) {
    // If the user doesn't exist or the password does not match the user, show an error and redirect
    res.status(403).send(`
      <p>Wrong Username or Password. Redirecting!</p>
      <script>
        setTimeout(() => {
          window.location.href = '/login';
        }, 4000);
      </script>
    `);
  }
});

// POST /logout
app.post('/logout', (req, res) => {
  req.session = null; // Clear the session
  res.redirect('/login');
});

// GET /urls -Displays saved URLs.
app.get('/urls', (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];

  const userFilter = {}; // Loop through the urlDatabase {}
  for (const shortURL in urlDatabase) { // Within urlDatabase
    if (urlDatabase[shortURL].nestedObjectID === user_id) { // If found matching ID
      userFilter[shortURL] = urlDatabase[shortURL]; // Send it to userFilter {}
    } // userFilter will be an object only containing the logged in users URLs.
  }
  const templateVars = { user, urls: userFilter };// render userFilter as urls in the template. So it only will have access to the values from userFilter.
  res.render('urls_index', templateVars);
});

// POST /urls
app.post("/urls", (req, res) => {
  // Protected Page - Check for User Login
  const currentUser = req.session.user_id;
  if (!currentUser) { // If currentUser does not exist (nobody logged in)
    res.send('\nUser tried to post but was not logged in. Action was cancelled.');
    return;
  }

  const longURL = req.body.longURL;// For the key:value pairs in urlDatabase, id = key, req.body.longURL = value.
  const id = generateRandomString(); // Now the id is a random number with the value being the longURL.
  // urlDatabase[id] = longURL; (replaced)
  urlDatabase[id] = {
    longURL: longURL,
    nestedObjectID: currentUser // Store the user ID as nestedObjectID
  };
  //Note: id is referred to shortURL in other functions, but it is the same due to the structure of the urlDatabase Object (may update later)

  res.redirect(`/urls/${id}`);
  return;
});

// GET /urls/new
app.get('/urls/new', (req, res) => {
  if (!loggedIn(req)) {
    console.log('\nDebug - Tried urls/new but not logged in - Redirect to Login');
    res.redirect('/login');
    return;
  }
  const user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = { user };
  res.render('urls_new', templateVars);
  return;
});

// GET /u/:id -Redirects a request for the shortened url to the matching longURL in the database.
app.get('/u/:id', (req, res) => {
  // Check if url exists or not
  const id = req.params.id;
  if (!urlDatabase[id]) {
    res.status(403).send(`
      <p>Not found in your database. Redirecting!</p>
      <script>
        setTimeout(() => {
          window.location.href = '/urls';
        }, 4000);
      </script>
    `);
    return;
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
  return;
});


// GET /urls/:id -Route parameter for any & all 'id'.
app.get('/urls/:id', (req, res) => {
  // Check if url exists or not
  const id = req.params.id;
  if (!urlDatabase[id]) {
    res.status(403).send(`
      <p>Not found in your database. Redirecting!</p>
      <script>
        setTimeout(() => {
          window.location.href = '/urls';
        }, 4000);
      </script>
    `);
    return;
  }
  const user_id = req.session.user_id; // Use session data
  const user = users[user_id];
  const templateVars = { user, id: req.params.id, longURL: urlDatabase[req.params.id].longURL };
  res.render('urls_show', templateVars);
  return;
});

// POST /urls/:id
app.post('/urls/:id', (req, res) => {
  // Protected Page - Check for User Login
  const currentUser = req.session.user_id; // Use session data
  if (!currentUser) { // If currentUser does not exist (nobody logged in)
    res.send('\nUser tried to post but was not logged in. Action was cancelled.');
    return;
  }

  const id = req.params.id;
  const longURL = req.body.longURL;
  if (urlDatabase[id]) {
    urlDatabase[id] = {
      longURL: longURL,
      nestedObjectID: currentUser // Store the user ID as nestedObjectID
    };
  }
  res.redirect('/urls');
});

// POST /urls/:id/delete
app.post('/urls/:id/delete', (req, res) => {
  // Protected Page - Check for User Login
  const currentUser = req.session.user_id; // Use session data

  console.log('---curl delete attempt---');
  console.log('curl found cookies:', req.session); // Debugging log
  console.log('curl found user_id:', currentUser); // Debugging log
  console.log('The curl command keeps saying no user is logged in. Not sure if this means the \'check for ownership of URL\' function will never run');

  if (!currentUser) { // If currentUser does not exist (nobody logged in)
    res.send('\nUser tried to delete but was not logged in. Action was cancelled.');
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