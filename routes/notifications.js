const express = require('express');
const { body } = require('express-validator');
const { fetchNotificationsTest } = require('../controllers/notifications');
const router = express.Router();

router.get('/:userId', fetchNotificationsTest);

module.exports = router;
