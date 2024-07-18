const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

console.log(generateRandomString());

// Math.random returns a random value between 0 and 1, so the first 2 digits are always 0. (zero decimal) meaning we need to use .substring(2) to begin at index 2 [counting from 0] and end with substring(8) [6 characters later]