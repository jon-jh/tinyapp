const express = require('express');
const app = express();
const port = 8080;

//Set up template engine (view folder) and urlencoded option for allowing POST data to be read(like form submission on the website.)
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

//generate 6 character string
function generateRandomString() { }



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

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});
// This means when this form is submitted, it will make a request to POST / urls, and the body will contain one URL - encoded name - value pair with the name longURL.

//----------/urls/new
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

//----------/urls/:id
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

