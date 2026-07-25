import axios from './axios';

export const getNotifications = () => axios.get('/notifications');
export const markAllNotificationsRead = () => axios.patch('/notifications/read-all');
