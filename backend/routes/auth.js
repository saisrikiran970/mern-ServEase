const express = require('express');
const router = express.Router();
const { register, login, googleLogin, setRole, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

router.post('/register', [
  body('name', 'Name is required').not().isEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], validate, register);

router.post('/login', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists()
], validate, login);

router.post('/google', googleLogin);

router.put('/set-role', protect, setRole);

router.get('/me', protect, getMe);

module.exports = router;
