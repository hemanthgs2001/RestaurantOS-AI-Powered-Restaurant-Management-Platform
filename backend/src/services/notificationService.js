const notifications = [];

// Global fallback reference to the Socket.IO server instance.
// Some routes/controllers call emitNotification(io, ...) with an `io`
// value pulled from req.app.get('io'), which can come back undefined
// depending on how routers/apps are wired up (this is why stock
// notifications were showing live but order/table notifications were
// silently being dropped until the next page refresh).
// Calling setIO(io) once at server startup guarantees every
// emitNotification call can still broadcast, even if the per-request
// io lookup fails.
let ioInstance = null;

const setIO = (io) => {
  ioInstance = io;
};

const getIO = () => ioInstance;

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

  // Prefer the io passed in by the caller (e.g. req.app.get('io')), but
  // fall back to the globally registered instance if that came back empty.
  // This ensures ALL notification types (stock in/out, order placed,
  // table booked, etc.) broadcast live without needing a page refresh.
  const activeIO = io || ioInstance;

  if (activeIO) {
    activeIO.emit('notification:new', notification);
    activeIO.emit('notification:count', getUnreadCount());
  }
  return notification;
};

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAllRead,
  emitNotification,
  setIO,
  getIO,
};