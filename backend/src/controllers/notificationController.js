const notificationService = require('../services/notificationService');

const getNotifications = (req, res) => {
  res.status(200).json({
    success: true,
    data: notificationService.getNotifications(),
    unreadCount: notificationService.getUnreadCount(),
  });
};

const markAllNotificationsRead = (req, res) => {
  notificationService.markAllRead();
  const io = req.app.get('io');
  if (io) {
    io.emit('notification:count', notificationService.getUnreadCount());
  }
  res.status(200).json({
    success: true,
    message: 'Notifications marked as read',
    unreadCount: notificationService.getUnreadCount(),
  });
};

module.exports = {
  getNotifications,
  markAllNotificationsRead,
};