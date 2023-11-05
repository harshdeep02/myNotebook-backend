const express = require('express')
const router = express.Router()
const User = require('../models/user')
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middelware/fetchuser');

jwtSecret_key = "noteswebkey@112#"  // jwt secret key

//Route 1:- create a user using "apii/auth/createUser"  api. No login required
router.post('/createUser', [
  body('name', 'Enter a valid name').isLength({ min: 3 }),
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Enter a valid password').isLength({ min: 5 }),
], async (req, res) => {
  let success = false;
  // if there is error. Then send the bad request and error
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // find the user by email. If the user already exist then return a error, else create user
    let user = await User.findOne({ email: req.body.email })
    if (user) {
      success = false;
      return res.status(400).json({ success, "error": "email already exists" })
    }

    const userPass = req.body.password
    const salt = await bcrypt.genSalt(10)
    const hashPass = await bcrypt.hash(userPass, salt)

    const newData = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashPass
    })
    // Create the user
    user = await newData.save({writeConcern: { w: 1 }})

    const data = {
      user: {
        id: user.id
      }
    }

    //JWT token
    let authToken = jwt.sign(data, jwtSecret_key)

    // res.json({ authToken })   //we can only send 1 response. that's why we are use "if" condition and "return" below to send response
    if (authToken) {
      success = true
      return res.json({ success, authToken })
    }
  }

  catch (error) {
    console.error(error.message)
    res.status(500).send("internel error found")
  }
})


//Route 2:- Login a user using "apii/auth/login"  api. No login required

router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Enter a valid password').exists(),
], async (req, res) => {
  let success = false
  // if there is error. Then send the bad request and error
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body //use destructing and get "email and password" from req.body
  try {

    // check the email in database that email is exist or not
    let user = await User.findOne({ email })
    if (!user) {
      success = false
      return res.status(400).json({ success, "error": "Please login with correct credentials" })
    }

    // passward is checked by bcrypt that both the password same or not
    const passwordCompare = await bcrypt.compare(password, user.password)
    if (!passwordCompare) {
      success = false
      return res.status(400).json({ success, "error": "Please login with correct credentials" })
    }

    const data = {
      user: {
        id: user.id
      }
    }

    //JWT token
    let authToken = jwt.sign(data, jwtSecret_key)

    // res.json({ authToken })   //we can only send 1 response. that's why we are use "if" condition and "return" below to send response
    if (authToken) {
      success = true
      return res.json({ success, authToken })
    }
  }
  catch (error) {
    console.error(error.message)
    res.status(500).send("internel error found")
  }

})


// Route 3:- Get the user details using "apii/auth/getuser"  api. Login required

router.post('/getuser', fetchuser, async (req, res) => {
  try {
    const userid = req.user.id
    let user = await User.findById(userid).select("-password")
    if (!user) {
      return res.status(400).json({ "error": "can't find the user" })
    }
    else {
      return res.send(user)
    }
  } catch (error) {
    console.error(error.message)
    res.status(500).send("internel error found")
  }
})
module.exports = router