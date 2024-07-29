// Not Found in Database Response
function notFoundResponse(res) {
  res.status(403).send(`
    <style>
      p {
        font-size: 20px;
      }
    </style>
    <p>Sorry, that URL was not found in your database.</p>
    <script>
      setTimeout(() => {
        window.location.href = '/urls';
      }, 3000);
    </script>
  `);
}

// New User Response
function newUserResponse(res) {
  res.status(403).send(`
    <style>
      p {
        font-size: 20px;
      }
    </style>
    <p>The username and password seem to be new. Please register.</p>
    <script>
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    </script>
  `);
}

// Register Response
function emailInUseResponse(res) {
  res.status(400).send(`
    <style>
      p {
        font-size: 20px;
      }
    </style>
    <p>That email seems to be registered already. Please log in.</p>
    <script>
      setTimeout(() => {
        window.location.href = '/register';
      }, 3000);
    </script>
  `);
}

// Cant Be Empty Response
function cantBeEmptyResponse(res) {
  res.status(400).send(`
    <style>
      p {
        font-size: 20px;
      }
    </style>
    <p>The fields can not be empty.</p>
    <script>
      setTimeout(() => {
        window.location.href = '/register';
      }, 3000);
    </script>
  `);
}

module.exports = { notFoundResponse, newUserResponse, emailInUseResponse, cantBeEmptyResponse };
