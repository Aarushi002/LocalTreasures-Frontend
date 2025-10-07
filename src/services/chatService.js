import api from './api';

const chatService = {
  // Get user's chats
  getChats: async (params = {}) => {
    const response = await api.get('/chat', { params });
    return response;
  },

  // Get or create direct chat
  getOrCreateDirectChat: async (userId) => {
    const response = await api.post('/chat/direct', { userId });
    return response;
  },

  // Get single chat with messages
  getChat: async (chatId, params = {}) => {
    const response = await api.get(`/chat/${chatId}`, { params });
    return response;
  },

  // Send message
  sendMessage: async (chatId, messageData, messageType = 'text', attachments = []) => {
    // Handle both old and new API formats
    let payload;
    if (typeof messageData === 'string') {
      // Old format: sendMessage(chatId, content, messageType, attachments)
      payload = {
        content: messageData,
        messageType: messageType,
        attachments: attachments
      };
    } else {
      // New format: sendMessage(chatId, messageObject)
      payload = {
        content: messageData.content,
        messageType: messageData.messageType || 'text',
        attachments: messageData.attachments || []
      };
    }
    
    const response = await api.post(`/chat/${chatId}/messages`, payload);
    return response;
  },

  // Mark messages as read
  markAsRead: async (chatId) => {
    const response = await api.put(`/chat/${chatId}/read`);
    return response;
  },

  // Block/unblock chat
  toggleBlock: async (chatId) => {
    const response = await api.put(`/chat/${chatId}/block`);
    return response;
  },

  // Delete message
  deleteMessage: async (chatId, messageId) => {
    const response = await api.delete(`/chat/${chatId}/messages/${messageId}`);
    return response;
  },

  // Search chats
  searchChats: async (query, params = {}) => {
    const response = await api.get('/chat/search', { 
      params: { query, ...params } 
    });
    return response;
  },
};

export default chatService;
