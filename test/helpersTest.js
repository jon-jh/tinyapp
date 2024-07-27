const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });
  it('should return undefined with an invalid email', function() {
    const user = getUserByEmail("nonnonbiyori@example.com", testUsers);
    assert.isUndefined(user);
  });
});

const urlsForUser = (user_id, urlDatabase) => {
  const userFilter = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].nestedObjectID === user_id) {
      userFilter[shortURL] = urlDatabase[shortURL];
    }
  }
  return userFilter;
};

const testUrlDatabase = {
  "b2xVn2": { nestedObjectID: "userRandomID", longURL: "http://www.lighthouselabs.ca" },
  "9sm5xK": { nestedObjectID: "user2RandomID", longURL: "http://www.google.com" }
};

describe('urlsForUser', function() {
  it('should return urls that belong to the specified user', function() {
    const userUrls = urlsForUser("userRandomID", testUrlDatabase);
    const expectedUrls = {
      "b2xVn2": { nestedObjectID: "userRandomID", longURL: "http://www.lighthouselabs.ca" }
    };
    assert.deepEqual(userUrls, expectedUrls);
  });

  it('should return an empty object if the user has no urls', function() {
    const userUrls = urlsForUser("nonexistentUser", testUrlDatabase);
    assert.deepEqual(userUrls, {});
  });

  it('should return an empty object if there are no urls in the urlDatabase', function() {
    const userUrls = urlsForUser("userRandomID", {});
    assert.deepEqual(userUrls, {});
  });

  it('should not return urls that don\'t belong to the specified user', function() {
    const userUrls = urlsForUser("userRandomID", testUrlDatabase);
    const unexpectedUrls = {
      "9sm5xK": { nestedObjectID: "user2RandomID", longURL: "http://www.google.com" }
    };
    assert.notDeepEqual(userUrls, unexpectedUrls);
  });
});
