const bcrypt = require("bcryptjs");
// Global / Helper Functions

//Random String Generator
const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

//URL User Filter
const urlsForUser = (user_id, urlDatabase) => {
  const userFilter = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].nestedObjectID === user_id) {
      userFilter[shortURL] = urlDatabase[shortURL];
    }
  }
  return userFilter;
};

//Lookup User By Email
function getUserByEmail(email, users) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
};

// Function to register user and encrypt the password
const register = (email, password, users, generateRandomString) => {
  const id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[id] = {
    id,
    email,
    password: hashedPassword
  };
  console.log(users);
  return id;
};

// Function to check if email or password are empty before register
const validateEmailPassword = (email, password) => {
  return email && password;
};

// Function to check if email is already in use before register
const isEmailInUse = (email, users) => {
  return Object.values(users).some(user => user.email === email);
};

// Function to check if user is logged in
const loggedIn = (req) => {
  return req.session.user_id ? true : false;
};

module.exports = {
  generateRandomString,
  urlsForUser,
  getUserByEmail,
  register,
  validateEmailPassword,
  isEmailInUse,
  loggedIn
};
