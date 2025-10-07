import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  chats: [],
  activeChat: null,
  messages: [],
  onlineUsers: [],
  isTyping: false,
  typingUsers: [],
  unreadCounts: {},
  isConnected: false,
  isLoading: false,
  isError: false,
  message: '',
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Socket connection
    setConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    
    // Online users
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    addOnlineUser: (state, action) => {
      const user = action.payload;
      if (!state.onlineUsers.find(u => u.userId === user.userId)) {
        state.onlineUsers.push(user);
      }
    },
    removeOnlineUser: (state, action) => {
      const userId = action.payload;
      state.onlineUsers = state.onlineUsers.filter(u => u.userId !== userId);
    },
    
    // Chats
    setChats: (state, action) => {
      state.chats = action.payload;
    },
    addChat: (state, action) => {
      const newChat = action.payload;
      const existingIndex = state.chats.findIndex(c => c._id === newChat._id);
      if (existingIndex !== -1) {
        state.chats[existingIndex] = newChat;
      } else {
        state.chats.unshift(newChat);
      }
    },
    updateChat: (state, action) => {
      const updatedChat = action.payload;
      const index = state.chats.findIndex(c => c._id === updatedChat._id);
      if (index !== -1) {
        state.chats[index] = { ...state.chats[index], ...updatedChat };
      }
    },
    
    // Active chat
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
      if (action.payload) {
        // Reset unread count for active chat
        state.unreadCounts[action.payload._id] = 0;
      }
    },
    
    // Messages
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      const { chatId, message } = action.payload;
      
      // Add to messages if it's for the active chat
      if (state.activeChat && state.activeChat._id === chatId) {
        state.messages.push(message);
      }
      
      // Update last message in chat
      const chatIndex = state.chats.findIndex(c => c._id === chatId);
      if (chatIndex !== -1) {
        state.chats[chatIndex].lastMessage = {
          content: message.content,
          sender: message.sender,
          timestamp: message.createdAt || new Date()
        };
        
        // Move chat to top
        const chat = state.chats[chatIndex];
        state.chats.splice(chatIndex, 1);
        state.chats.unshift(chat);
        
        // Update unread count if not active chat
        if (!state.activeChat || state.activeChat._id !== chatId) {
          state.unreadCounts[chatId] = (state.unreadCounts[chatId] || 0) + 1;
        }
      }
    },
    
    // Typing indicators
    setTyping: (state, action) => {
      state.isTyping = action.payload;
    },
    addTypingUser: (state, action) => {
      const { chatId, userId, name } = action.payload;
      if (state.activeChat && state.activeChat._id === chatId) {
        const existingIndex = state.typingUsers.findIndex(u => u.userId === userId);
        if (existingIndex === -1) {
          state.typingUsers.push({ userId, name });
        }
      }
    },
    removeTypingUser: (state, action) => {
      const { userId } = action.payload;
      state.typingUsers = state.typingUsers.filter(u => u.userId !== userId);
    },
    
    // Unread counts
    setUnreadCounts: (state, action) => {
      state.unreadCounts = action.payload;
    },
    updateUnreadCount: (state, action) => {
      const { chatId, count } = action.payload;
      state.unreadCounts[chatId] = count;
    },
    markChatAsRead: (state, action) => {
      const chatId = action.payload;
      state.unreadCounts[chatId] = 0;
      
      // Mark messages as read in active chat
      if (state.activeChat && state.activeChat._id === chatId) {
        state.messages = state.messages.map(msg => ({
          ...msg,
          readBy: msg.readBy || []
        }));
      }
    },
    
    // Error handling
    setError: (state, action) => {
      state.isError = true;
      state.message = action.payload;
    },
    clearError: (state) => {
      state.isError = false;
      state.message = '';
    },
    
    // Loading
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    // Reset
    reset: (state) => {
      return initialState;
    },
  },
});

export const {
  setConnected,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  setChats,
  addChat,
  updateChat,
  setActiveChat,
  setMessages,
  addMessage,
  setTyping,
  addTypingUser,
  removeTypingUser,
  setUnreadCounts,
  updateUnreadCount,
  markChatAsRead,
  setError,
  clearError,
  setLoading,
  reset,
} = chatSlice.actions;

export default chatSlice.reducer;
