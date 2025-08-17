// routes/users.js
import express from 'express';
import { register } from '../controllers/authController.js';
import { login } from '../controllers/authController.js';
 // Updated path to controllers/users.js

const router = express.Router();


// Route to register a new user
router.post('/register', register);

// Route to login a user
router.post('/login', login);

// Route to get all users
// router.get('/', userControllers.getAllUsers);

// // Route to get a user by ID
// router.get('/:id', userControllers.getUserById);

// // Route to update a user by ID
// router.put('/:id', userControllers.updateUser);

// // Route to delete a user by ID
// router.delete('/:id', userControllers.deleteUser);

export default router;