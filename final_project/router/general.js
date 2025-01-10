const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Function to validate request body
const validateRequestBody = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ message: "Username and password are required" });
    return false;
  }
  return true;
};

// Function to check if user already exists
const checkUserExists = (username, res) => {
  if (isValid(username)) {
    res.status(400).json({ message: "User already exists" });
    return true;
  }
  return false;
};

// Register a new user
public_users.post("/register", (req, res) => {
  if (!validateRequestBody(req, res)) return;
  const { username, password } = req.body;
  if (checkUserExists(username, res)) return;

  users.push({ username, password });
  res.status(200).json({ message: "User created" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(300).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if(!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }
  return res.status(300).json(books);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const booksByAuthor = [];

  const bookKeys = Object.keys(books);

  for (let i = 0; i < bookKeys.length; i++) {
    const book = books[bookKeys[i]];
    if (book.author === author) {
      booksByAuthor.push(book);
    }
  }
  return res.status(300).json(books);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const booksByTitle = [];

  const bookKeys = Object.keys(books);

  for (let i = 0; i < bookKeys.length; i++) {
    const book = books[bookKeys[i]];
    if (book.title === title) {
      booksByTitle.push(book);
    }
  }

  if (booksByTitle.length === 0) {
    return res.status(404).json({message: "No books found with this title"});
  }
  return res.status(300).json(booksByTitle);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.review);
  }

  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;
