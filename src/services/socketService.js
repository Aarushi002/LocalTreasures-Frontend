import { io } from 'socket.io-client';
import { store } from '../store/store';
import {
  setConnected,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  addMessage,
  addTypingUser,
  removeTypingUser,
  markChatAsRead,
  setError,
} from '../store/slices/chatSlice';
import { addNotification } from '../store/slices/uiSlice';

let socket = null;

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const initializeSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: {
      token: token,
    },
    autoConnect: true,
  });

  // Connection events
  socket.on('connect', () => {
    store.dispatch(setConnected(true));
  });

  socket.on('disconnect', () => {
    store.dispatch(setConnected(false));
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    store.dispatch(setConnected(false));
    store.dispatch(setError('Failed to connect to chat server'));
  });

  // User status events
  socket.on('online_users', (users) => {
    store.dispatch(setOnlineUsers(users));
  });

  socket.on('user_online', (user) => {
    store.dispatch(addOnlineUser(user));
  });

  socket.on('user_offline', (user) => {
    store.dispatch(removeOnlineUser(user.userId));
  });

  // Chat events
  socket.on('new_message', (data) => {
    const { chatId, message } = data;
    store.dispatch(addMessage({ chatId, message }));

    // Show notification if not in active chat
    const state = store.getState();
    const { user } = state.auth;
    const { activeChat } = state.chat;

    if (message.sender._id !== user?.id && (!activeChat || activeChat._id !== chatId)) {
      store.dispatch(addNotification({
        type: 'message',
        title: 'New Message',
        message: `${message.sender.name}: ${message.content}`,
        chatId: chatId,
      }));
    }
  });

  socket.on('messages_read', (data) => {
    const { chatId } = data;
    store.dispatch(markChatAsRead(chatId));
  });

  // Typing events
  socket.on('user_typing', (data) => {
    store.dispatch(addTypingUser(data));
  });

  socket.on('user_stopped_typing', (data) => {
    store.dispatch(removeTypingUser(data));
  });

  // Location events
  socket.on('location_shared', (data) => {
    // Handle location sharing
  });

  // Order events
  socket.on('order_updated', (data) => {
    // Handle order updates
    store.dispatch(addNotification({
      type: 'order',
      title: 'Order Update',
      message: `Your order has been ${data.status}`,
      orderId: data.orderId,
    }));
  });

  // Error events
  socket.on('error', (error) => {
    console.error('Socket error:', error);
    store.dispatch(setError(error.message));
  });

  // Notification events
  socket.on('notification', (notification) => {
    store.dispatch(addNotification(notification));
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    store.dispatch(setConnected(false));
  }
};

// Chat functions
export const joinChat = (chatId) => {
  if (socket) {
    socket.emit('join_chat', chatId);
  }
};

export const leaveChat = (chatId) => {
  if (socket) {
    socket.emit('leave_chat', chatId);
  }
};

export const sendMessage = (data) => {
  if (socket) {
    socket.emit('send_message', data);
  }
};

export const markMessagesAsRead = (chatId) => {
  if (socket) {
    socket.emit('mark_read', { chatId });
  }
};

export const startTyping = (chatId) => {
  if (socket) {
    socket.emit('typing_start', { chatId });
  }
};

export const stopTyping = (chatId) => {
  if (socket) {
    socket.emit('typing_stop', { chatId });
  }
};

export const shareLocation = (chatId, location) => {
  if (socket) {
    socket.emit('share_location', {
      chatId,
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address,
    });
  }
};

export const updateOrderStatus = (orderId, status, message) => {
  if (socket) {
    socket.emit('order_update', {
      orderId,
      status,
      message,
    });
  }
};

export const getSocket = () => socket;

// Add convenience methods for the Chat component
export const connect = (token) => {
  return initializeSocket(token);
};

export const on = (event, callback) => {
  if (socket) {
    socket.on(event, callback);
  }
};

export const off = (event, callback) => {
  if (socket) {
    socket.off(event, callback);
  }
};

const socketService = {
  initializeSocket,
  disconnectSocket,
  connect,
  on,
  off,
  joinChat,
  leaveChat,
  sendMessage,
  markMessagesAsRead,
  startTyping,
  stopTyping,
  shareLocation,
  updateOrderStatus,
  getSocket,
};

export default socketService;
