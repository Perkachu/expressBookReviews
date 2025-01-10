const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

const users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(400).json({ message: "User does not exist" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(400).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign({ username }, 'your_jwt_secret', { expiresIn: '1h' });
  return res.status(200).json({ message: "Login successful", token });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token.split(' ')[1], 'your_jwt_secret');
    const username = decoded.username;
    const { review } = req.body;
    const { isbn } = req.params;

    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review added/modified successfully" });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token.split(' ')[1], 'your_jwt_secret');
    const username = decoded.username;
    const { isbn } = req.params;

    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
      return res.status(404).json({ message: "Review not found" });
    }

    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
