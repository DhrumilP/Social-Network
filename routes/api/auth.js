const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const config = require('config/');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const { check, validation, validationResult } = require('express-validator');

// @route   GET api/auth
// @desc    get user detail
// @access  Public
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.log(err.message);
    res.status();
  }
});

// @route   POST api/auth
// @desc    auth user and get token
// @access  Public
router.post(
  '/',
  [
    check('email', 'Please enter a valid enmail').isEmail(),
    check('password', 'password is required').exists(),
  ],
  async (req, res) => {
    console.log(req.body);
    //errors with fields
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //get user details
    const { email, password } = req.body;

    try {
      //check if user exists
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          errors: [
            {
              msg: 'Invalid credentials',
            },
          ],
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          errors: [
            {
              msg: 'Invalid credentials',
            },
          ],
        });
      }

      //Return jsonwebtoken
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get('jwt'),
        {
          expiresIn: 360000,
        },
        (err, token) => {
          if (err) {
            throw err;
          }
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
