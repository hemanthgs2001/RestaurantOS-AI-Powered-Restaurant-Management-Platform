const notifications = [];

const createNotification = ({ type, title, message, meta = {} }) => {
  const notification = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    type,
    title,
    message,
    meta,
    read: false,
    createdAt: new Date().toISOString(),
  };

  notifications.unshift(notification);
  if (notifications.length > 50) {
    notifications.pop();
  }

  return notification;
};

const getNotifications = () => notifications;

const getUnreadCount = () => notifications.filter((notification) => !notification.read).length;

const markAllRead = () => {
  notifications.forEach((notification) => {
    notification.read = true;
  });
  return getUnreadCount();
};

const emitNotification = (io, type, title, message, meta = {}) => {
  const notification = createNotification({ type, title, message, meta });
  if (io) {
    io.emit('notification:new', notification);
    io.emit('notification:count', getUnreadCount());
  }
  return notification;
};

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAllRead,
  emitNotification,
};
