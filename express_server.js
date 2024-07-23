// Config
const express = require('express'); // HTML library.
const app = express();
const port = 8080;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true })); // Allow reading POST data.

const cookieParser = require('cookie-parser'); // Needed to read cookies.
app.use(cookieParser()); // Set express app to use this library.

// Start
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



// (Global)Random String Generator
const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};
// (Global)URL Database
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
// (Global)User Database
const users = {
};
// (Global)Function Add New User
const register = (email, password) => {
  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password
  };
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


// (Route Handlers)
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
  try {
    // Find the user by email
    const user = Object.values(users).find(user => user.email === email);
    if (user && user.password === password) {
      // If the user exists and the password is matching, log them in
      res.cookie('user_id', user.id);
      console.log('Logged in user_id:', user.id);
      res.redirect('/urls');
    } else {
      // If the user doesn't exist or the password does not match the user, show an error and redirect. Need to use some HTML here because you cant send multiple responses.
      res.status(403).send(`
        <p>Wrong Username or Password. Redirecting!</p>
        <script>
          setTimeout(() => {
            window.location.href = '/login';
          }, 4000);
        </script>
      `);
    }
  } catch (error) {
    res.status(500).send('Woopsies');
  }
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
app.post("/urls", (req, res) => {// POST /urls, the response body  will contain one encoded key:value pair with the id and longURL.

  const longURL = req.body.longURL;// For the key:value pairs in urlDatabase, id = key, req.body.longURL = value.

  const id = generateRandomString();// Now the id is a random number with the value being the longURL.

  urlDatabase[id] = longURL;
  /*
    Adds a new entry to the urlDatabase object with id as the key and longURL
    as the value.

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