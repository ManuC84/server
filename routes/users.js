const express = require('express');

const { signin, signup, uploadFile } = require('../controllers/user.js');
const { auth } = require('../middleware/auth.js');

const router = express.Router();

router.post('/signin', signin);
router.post('/signup', signup);
router.post('/uploadFile', auth, uploadFile);

module.exports = router;
