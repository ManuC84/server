const express = require('express');
const { body } = require('express-validator');
const {
  fetchNotification,
  readNotification,
  readAllNotifications,
  clearAllNotifications,
  fetchNotifications,
} = require('../controllers/notifications');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.get('/:userId', auth, fetchNotification);
router.post('/readNotification/:notificationId', auth, readNotification);
router.put('/readAllNotifications/:userId', auth, readAllNotifications);
router.delete('/clearAllNotifications/:userId', auth, clearAllNotifications);

module.exports = router;
