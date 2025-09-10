const express = require('express');
const { query } = require('../config/database');
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

    let whereClause = 'WHERE user_id = $1';
    let queryParams = [userId];

    if (read !== undefined) {
      whereClause += ' AND read = $2';
      queryParams.push(read === 'true');
    }

    const notifications = await query(`
      SELECT * FROM notifications
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `, [...queryParams, limit, offset]);

    res.json({
      success: true,
      data: {
        notifications: notifications.rows,
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

    const result = await query(`
      UPDATE notifications 
      SET read = TRUE, read_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `, [notificationId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Notification not found' }
      });
    }

    res.json({
      success: true,
      data: {
        notification: result.rows[0]
      }
    });
  })
);

module.exports = router;
