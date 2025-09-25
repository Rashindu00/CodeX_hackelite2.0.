const express = require('express');
const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/notifications/:userId
// @desc    Get user notifications
// @access  Private
router.get('/:userId',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const { read, limit = 20, offset = 0 } = req.query;

    let query = { user: userId };

    if (read !== undefined) {
      query.read = read === 'true';
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      }
    });
  })
);

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const notificationId = req.params.id;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { 
        read: true, 
        readAt: new Date() 
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: { message: 'Notification not found' }
      });
    }

    res.json({
      success: true,
      data: {
        notification
      }
    });
  })
);

module.exports = router;
