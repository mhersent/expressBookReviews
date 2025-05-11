const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
      // Check if the user does not already exist
      if (!isValid(username)) {
          // Add the new user to the users array
          users.push({"username": username, "password": password});
          return res.status(200).json({message: "User successfully registered. Now you can login"});
      } else {
          return res.status(404).json({message: "User already exists!"});
      }
  }
  // Return error if username or password is missing
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/books');
    res.send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch books.' });
  }
});

public_users.get('/books', async function (req, res) {
    res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
    const bookId = Object.keys(books).find((id) => books[id]["isbn"] === isbn);
    if (bookId) {
      resolve(books[bookId]);
    } else {
      reject("Book not found");
    }
  })
  .then((book) => {
    res.send(book);
  })
  .catch((err) => {
    res.status(404).send({ error: err });
  });
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  new Promise((resolve, reject) => {
    const bookIds = Object.keys(books).filter((id) => books[id]["author"] === author);
    if (bookIds.length > 0) {
      const matchingBooks = bookIds.map(id => books[id]);
      resolve(matchingBooks);
    } else {
      reject("No books found by this author");
    }
  })
  .then((booksByAuthor) => {
    res.send(booksByAuthor);
  })
  .catch((err) => {
    res.status(404).send({ error: err });
  });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  new Promise((resolve, reject) => {
    const bookIds = Object.keys(books).filter((id) => books[id]["title"] === title);
    if (bookIds.length > 0) {
      const matchingBooks = bookIds.map(id => books[id]);
      resolve(matchingBooks);
    } else {
      reject("No books found with this title");
    }
  })
  .then((booksByTitle) => {
    res.send(booksByTitle);
  })
  .catch((err) => {
    res.status(404).send({ error: err });
  });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book_id = Object.keys(books).filter((id) => {
    return books[id]["isbn"] === isbn;
  }) 
  res.send(books[book_id]["reviews"]);
});

module.exports.general = public_users;
