import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  TextField,
  IconButton,
  Divider,
  Badge,
  Chip,
  Card,
  CardContent,
  InputAdornment,
  Menu,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  AttachFile as AttachIcon,
  EmojiEmotions as EmojiIcon,
  Image as ImageIcon,
  Store as StoreIcon,
  Person as PersonIcon,
  Circle as OnlineIcon,
} from '@mui/icons-material';

import socketService from '../../services/socketService';
import chatService from '../../services/chatService';

const Chat = () => {
  const [searchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);
  
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [creatingChat, setCreatingChat] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  // const [messageQueue, setMessageQueue] = useState([]); // For future message queuing
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Helper function to get sender ID from either populated or non-populated sender
  const getSenderId = (sender) => {
    return typeof sender === 'object' ? sender._id : sender;
  };

  // Initialize chat on component mount
  const initializeChat = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get token for socket connection
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found for socket connection');
        setLoading(false);
        return;
      }
      
      // Connect to socket
      await socketService.connect(token);
      
      // Set up socket event listeners
      const setupSocketListeners = () => {
        socketService.on('new_message', handleNewMessage);
        socketService.on('typing_start', handleTypingStart);
        socketService.on('typing_stop', handleTypingStop);
        socketService.on('user_online', handleUserOnline);
        socketService.on('user_offline', handleUserOffline);
      };
      
      setupSocketListeners();
      
      // Load conversations
      const chatData = await chatService.getChats();
      
      const chats = chatData.chats || [];
      
      // Filter out any invalid chats
      const validChats = chats.filter(chat => 
        chat && chat._id && chat.participants && Array.isArray(chat.participants)
      );
      
      setConversations(validChats);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    initializeChat();
    
    return () => {
      socketService.disconnectSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle URL parameters for direct chat
  useEffect(() => {
    const sellerId = searchParams.get('sellerId'); // For backward compatibility
    const userId = searchParams.get('userId'); // New parameter name
    const productId = searchParams.get('productId');
    const orderId = searchParams.get('orderId');
    
    const otherUserId = userId || sellerId; // Use userId first, fallback to sellerId
    
    // Prevent duplicate calls by checking if we already have this chat
    if (otherUserId && user && user._id) {
      const existingChat = conversations.find(conv => 
        conv.participants && conv.participants.some(p => 
          p.user && (p.user._id === otherUserId || p.user === otherUserId)
        )
      );
      
      if (!existingChat) {
        startChatWithUser(otherUserId, productId, orderId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, user, conversations]);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewMessage = (message) => {
    console.log('handleNewMessage - Content:', message?.content, 'Type:', typeof message?.content);
    
    // Validate message before adding
    if (!message || !message._id || !message.sender || !message.content) {
      console.log('Invalid message, skipping');
      return;
    }
    
    // Normalize message content to ensure it's a string
    const normalizedMessage = {
      ...message,
      content: typeof message.content === 'string' 
        ? message.content 
        : typeof message.content === 'object'
          ? message.content.text || message.content.content || JSON.stringify(message.content)
          : String(message.content)
    };
    
    console.log('Normalized content:', normalizedMessage.content);
    
    // Get sender ID for consistent usage
    const senderId = getSenderId(normalizedMessage.sender);
    
    setMessages(prev => {
      // Check if this message replaces an optimistic message
      const tempId = normalizedMessage.tempId || `temp_${normalizedMessage.content}_${senderId}`;
      const optimisticIndex = prev.findIndex(msg => 
        msg._id === tempId || 
        (msg.isOptimistic && msg.content === normalizedMessage.content && getSenderId(msg.sender) === senderId)
      );
      
      if (optimisticIndex !== -1) {
        // Replace optimistic message with real one
        const updatedMessages = [...prev];
        updatedMessages[optimisticIndex] = { 
          ...normalizedMessage, 
          status: 'delivered',
          isOptimistic: false 
        };
        return updatedMessages;
      }
      
      // Check if message already exists (avoid duplicates)
      const messageExists = prev.some(msg => 
        msg._id === normalizedMessage._id || 
        (msg._id && msg._id.toString() === normalizedMessage._id.toString())
      );
      if (messageExists) {
        return prev;
      }
      
      // For own messages, update status if it's an optimistic message
      if (senderId === user._id) {
        const optimisticIndex = prev.findIndex(msg => 
          msg.isOptimistic && msg.content === normalizedMessage.content && 
          Math.abs(new Date(msg.createdAt) - new Date(normalizedMessage.createdAt)) < 5000
        );
        
        if (optimisticIndex !== -1) {
          const updatedMessages = [...prev];
          updatedMessages[optimisticIndex] = { ...normalizedMessage, status: 'delivered' };
          return updatedMessages;
        }
      }
      
      // Add new message
      return [...prev, { ...normalizedMessage, status: senderId === user._id ? 'delivered' : 'received' }];
    });
    
    // Update conversation list only for messages from other users
    if (senderId !== user._id) {
      setConversations(prev => {
        const updated = prev.map(conv => 
          conv._id === normalizedMessage.chatId 
            ? { ...conv, lastMessage: normalizedMessage, unreadCount: conv.unreadCount + 1 }
            : conv
        );
        return updated.sort((a, b) => new Date(b.lastMessage?.createdAt) - new Date(a.lastMessage?.createdAt));
      });
    }
    
    // Scroll to bottom after new message (only if from other user or if it's replacing optimistic message)
    if (senderId !== user._id || message.tempId) {
      setTimeout(() => scrollToBottom(), 50);
    }
  };

  const handleTypingStart = ({ userId, chatId }) => {
    if (selectedChat?._id === chatId && userId !== user._id) {
      setTypingUsers(prev => [...prev.filter(id => id !== userId), userId]);
    }
  };

  const handleTypingStop = ({ userId, chatId }) => {
    if (selectedChat?._id === chatId) {
      setTypingUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleUserOnline = (userId) => {
    setOnlineUsers(prev => [...prev.filter(id => id !== userId), userId]);
  };

  const handleUserOffline = (userId) => {
    setOnlineUsers(prev => prev.filter(id => id !== userId));
  };

  const startChatWithUser = async (otherUserId, productId, orderId) => {
    if (creatingChat) {
      console.log('Chat creation already in progress, skipping...');
      return;
    }
    
    try {
      setCreatingChat(true);
      const response = await chatService.getOrCreateDirectChat(otherUserId);
      
      if (response && response.success && response.chat) {
        // Add the chat to conversations list if it's not already there
        setConversations(prev => {
          const existingChat = prev.find(conv => conv._id === response.chat._id);
          if (!existingChat) {
            return [response.chat, ...prev];
          }
          return prev;
        });
        
        // Select the chat
        await selectChat(response.chat);
      } else {
        console.error('Invalid chat response:', response);
      }
    } catch (error) {
      console.error('Failed to start chat with user:', error);
    } finally {
      setCreatingChat(false);
    }
  };

  const selectChat = async (chat) => {
    try {
      if (!chat || !chat._id) {
        console.error('Invalid chat object:', chat);
        return;
      }
      
      setSelectedChat(chat);
      
      // Load messages for this chat
      const messagesData = await chatService.getChat(chat._id);
      
      const messages = messagesData.messages || [];
      
      // Filter out invalid messages and normalize content
      const validMessages = messages
        .filter(msg => {
          // Check basic message structure
          if (!msg || !msg._id || !msg.content) return false;
          
          // Check sender - it can be either ObjectId string or populated object
          if (!msg.sender) return false;
          
          // If sender is populated object, it should have _id
          // If sender is just ObjectId string, that's also valid
          if (typeof msg.sender === 'object' && !msg.sender._id) return false;
          
          return true;
        })
        .map(msg => ({
          ...msg,
          content: typeof msg.content === 'string' 
            ? msg.content 
            : typeof msg.content === 'object'
              ? msg.content.text || msg.content.content || JSON.stringify(msg.content)
              : String(msg.content)
        }));
      
      setMessages(validMessages);
      
      // Join chat room
      socketService.joinChat(chat._id);
      
      // Mark messages as read
      await chatService.markAsRead(chat._id);
      
      // Update conversation unread count
      setConversations(prev => 
        prev.map(conv => 
          conv._id === chat._id 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error('Failed to select chat:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const messageContent = newMessage.trim();
      const tempId = `temp_${Date.now()}_${Math.random()}`;
      
      // Clear input immediately for better UX
      setNewMessage('');
      
      // Create optimistic message object
      const optimisticMessage = {
        _id: tempId,
        sender: {
          _id: user._id,
          name: user.name
        },
        content: messageContent,
        messageType: 'text',
        createdAt: new Date().toISOString(),
        isOptimistic: true,
        status: 'sending' // Add status for WhatsApp-like indicators
      };
      
      console.log('Creating optimistic message - Content:', messageContent, 'Type:', typeof messageContent);

      // Add message immediately to UI (optimistic update)
      setMessages(prev => [...prev, optimisticMessage]);
      
      // Force immediate scroll
      setTimeout(() => scrollToBottom(), 0);

      const messageData = {
        chatId: selectedChat._id,
        content: messageContent,
        messageType: 'text',
        tempId: tempId
      };

      // Try to send via socket first (primary method)
      if (socketService.getSocket()?.connected) {
        socketService.sendMessage(messageData);
        
        // Wait for socket confirmation or timeout
        const socketTimeout = setTimeout(() => {
          console.warn('Socket send timeout, falling back to API');
          sendViaAPI();
        }, 3000);
        
        // Clear timeout if socket succeeds (handled in socket event listener)
        messageData.timeoutId = socketTimeout;
      } else {
        // Socket not connected, use API directly
        console.warn('Socket not connected, using API');
        sendViaAPI();
      }
      
      // API fallback function
      async function sendViaAPI() {
        try {
          const response = await chatService.sendMessage(selectedChat._id, {
            content: messageContent,
            messageType: 'text',
            tempId: tempId
          });
          
          // Update optimistic message to sent status
          setMessages(prev => prev.map(msg => 
            msg._id === tempId ? { ...msg, status: 'sent', _id: response.message._id } : msg
          ));
        } catch (apiError) {
          console.error('API send failed:', apiError);
          // Update message to failed status
          setMessages(prev => prev.map(msg => 
            msg._id === tempId ? { 
              ...msg, 
              status: 'failed',
              retry: () => retryMessage(msg) 
            } : msg
          ));
        }
      }
      
      // Stop typing indicator
      if (isTyping) {
        socketService.stopTyping(selectedChat._id);
        setIsTyping(false);
      }
      
      // Update conversations list with the new message
      setConversations(prev => prev.map(conv => 
        conv._id === selectedChat._id 
          ? { 
              ...conv, 
              lastMessage: {
                content: messageContent,
                createdAt: new Date().toISOString(),
                sender: { _id: user._id, name: user.name }
              },
              updatedAt: new Date().toISOString()
            }
          : conv
      ));
      
    } catch (error) {
      console.error('Failed to send message:', error);
      // Mark the optimistic message as failed
      setMessages(prev => prev.map(msg => 
        msg._id.toString().startsWith('temp_') && msg.status === 'sending' 
          ? { ...msg, status: 'failed' } 
          : msg
      ));
    }
  };

  const retryMessage = async (failedMessage) => {
    if (!failedMessage || !selectedChat) return;
    
    // Update message status to sending
    setMessages(prev => prev.map(msg => 
      msg._id === failedMessage._id ? { ...msg, status: 'sending' } : msg
    ));
    
    try {
      const response = await chatService.sendMessage(selectedChat._id, {
        content: failedMessage.content,
        messageType: 'text',
        tempId: failedMessage._id
      });
      
      // Update to sent status
      setMessages(prev => prev.map(msg => 
        msg._id === failedMessage._id ? { ...msg, status: 'sent', _id: response.message._id } : msg
      ));
      
      // Also send via socket
      socketService.sendMessage({
        chatId: selectedChat._id,
        content: failedMessage.content,
        type: 'text',
        tempId: failedMessage._id
      });
      
    } catch (error) {
      console.error('Retry failed:', error);
      setMessages(prev => prev.map(msg => 
        msg._id === failedMessage._id ? { ...msg, status: 'failed' } : msg
      ));
    }
  };

  const handleMessageInput = (event) => {
    setNewMessage(event.target.value);
    
    // Handle typing indicator
    if (!isTyping && selectedChat) {
      setIsTyping(true);
      socketService.startTyping(selectedChat._id);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping && selectedChat) {
        socketService.stopTyping(selectedChat._id);
        setIsTyping(false);
      }
    }, 1000);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  };

  const getMessageTimestamp = (message) => {
    // Try createdAt first, then extract from ObjectId, fallback to current time
    if (message.createdAt) return message.createdAt;
    if (message._id && typeof message._id === 'string' && message._id.length === 24) {
      try {
        // Extract timestamp from MongoDB ObjectId (first 4 bytes represent timestamp)
        const timestamp = parseInt(message._id.substring(0, 8), 16) * 1000;
        return new Date(timestamp);
      } catch (e) {
        console.warn('Could not extract timestamp from ObjectId:', message._id);
      }
    }
    return new Date(); // Fallback to current time
  };

  const formatTime = (date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSafeMessageContent = (message) => {
    // Debug logging
    console.log('Rendering message:', message._id, 'Content:', message.content, 'Type:', typeof message.content);
    
    if (typeof message.content === 'string') {
      return message.content;
    } else if (typeof message.content === 'object' && message.content !== null) {
      return message.content.text || message.content.content || JSON.stringify(message.content);
    } else {
      return String(message.content || 'Empty message');
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const messageDate = new Date(date);
    if (isNaN(messageDate.getTime())) return '';
    
    const today = new Date();
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return messageDate.toLocaleDateString();
  };

  const getOtherUser = (chat) => {
    if (!chat || !chat.participants || !Array.isArray(chat.participants)) {
      return null;
    }
    
    if (!user || !user._id) {
      return null;
    }
    
    // The participant structure is { user: { _id, name, ... }, joinedAt, ... }
    const participant = chat.participants.find(participant => 
      participant && participant.user && participant.user._id && participant.user._id !== user._id
    );
    
    return participant ? participant.user : null;
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  const filteredConversations = conversations.filter(conv => {
    // Only process valid conversations
    if (!conv || !conv._id || !conv.participants) {
      return false;
    }
    
    const otherUser = getOtherUser(conv);
    if (!otherUser) return false; // Skip conversations without valid other user
    
    const searchLower = searchQuery.toLowerCase();
    return (
      otherUser?.name?.toLowerCase().includes(searchLower) ||
      otherUser?.businessInfo?.businessName?.toLowerCase().includes(searchLower) ||
      conv.lastMessage?.content?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Box sx={{ 
      height: 'calc(100vh - 56px)', 
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden',
      [`@media (min-width: 600px)`]: {
        height: 'calc(100vh - 64px)',
      },
    }}>
      {/* Header */}
      <Box sx={{ 
        px: 3, 
        py: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        flexShrink: 0
      }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Messages
        </Typography>
      </Box>

      {/* Chat Layout */}
      <Box sx={{ flex: 1, display: 'flex', minHeight: 0, maxWidth: '1200px', mx: 'auto', width: '100%' }}>
        {/* Conversations List */}
        <Box sx={{ 
          width: '350px', 
          borderRight: 1, 
          borderColor: 'divider',
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: 'background.paper'
        }}>
            {/* Search */}
            <Box sx={{ p: 2, flexShrink: 0 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Divider />

            {/* Conversations */}
            <Box 
              sx={{ 
                flex: 1, 
                overflowY: 'auto',
                overflowX: 'hidden',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#c1c1c1',
                  borderRadius: '3px',
                  '&:hover': {
                    background: '#a8a8a8',
                  },
                },
              }}
            >
              {filteredConversations.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {filteredConversations.map((chat) => {
                    // Skip invalid chat objects
                    if (!chat || !chat._id) {
                      return null;
                    }

                    const otherUser = getOtherUser(chat);
                    const isSelected = selectedChat?._id === chat._id;
                    
                    // Skip chat if otherUser is not found
                    if (!otherUser) {
                      return null;
                    }
                    
                    return (
                      <ListItem
                        key={chat._id}
                        button
                        selected={isSelected}
                        onClick={() => selectChat(chat)}
                        sx={{
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                      >
                        <ListItemAvatar>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                              otherUser && isUserOnline(otherUser._id) ? (
                                <OnlineIcon sx={{ color: 'success.main', fontSize: 12 }} />
                              ) : null
                            }
                          >
                            <Avatar>
                              {otherUser?.role === 'seller' ? <StoreIcon /> : <PersonIcon />}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle2" noWrap>
                                {otherUser?.businessInfo?.businessName || otherUser?.name}
                              </Typography>
                              {chat.unreadCount > 0 && (
                                <Chip
                                  label={chat.unreadCount}
                                  size="small"
                                  color="primary"
                                  sx={{ minWidth: 20, height: 20, fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {chat.lastMessage?.content || 'No messages yet'}
                              </Typography>
                              <Typography variant="caption" color="text.disabled">
                                {chat.lastMessage && chat.lastMessage.createdAt && formatTime(chat.lastMessage.createdAt)}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery ? 'No conversations found' : 'No conversations yet'}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

        {/* Chat Area */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: 'background.paper'
        }}>
            {selectedChat && getOtherUser(selectedChat) ? (
              <>
                {/* Chat Header */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          isUserOnline(getOtherUser(selectedChat)?._id) ? (
                            <OnlineIcon sx={{ color: 'success.main', fontSize: 12 }} />
                          ) : null
                        }
                      >
                        <Avatar>
                          {getOtherUser(selectedChat)?.role === 'seller' ? <StoreIcon /> : <PersonIcon />}
                        </Avatar>
                      </Badge>
                      
                      <Box>
                        <Typography variant="h6">
                          {getOtherUser(selectedChat)?.businessInfo?.businessName || getOtherUser(selectedChat)?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {isUserOnline(getOtherUser(selectedChat)?._id) ? 'Online' : 'Offline'}
                        </Typography>
                      </Box>
                    </Box>

                    <IconButton 
                      onClick={(e) => setMenuAnchor(e.currentTarget)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </Box>

                {/* Messages */}
                <Box 
                  sx={{ 
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    p: 2,
                    backgroundColor: '#e5ddd5',
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Cpath d="M20 20c0-16.569-13.431-30-30-30s-30 13.431-30 30 13.431 30 30 30 30-13.431 30-30zM0 40c0-22.091 17.909-40 40-40s40 17.909 40 40-17.909 40-40 40S0 62.091 0 40z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'rgba(0,0,0,0.2)',
                      borderRadius: '3px',
                      '&:hover': {
                        background: 'rgba(0,0,0,0.3)',
                      },
                    },
                  }}
                >
                  {Array.isArray(messages) && messages.length > 0 ? (
                    <>
                      {messages.map((message, index) => {
                        // Skip invalid messages - but allow optimistic messages
                        if (!message || !message.sender || (!message._id && !message.isOptimistic)) {
                          return null;
                        }
                        
                        // Handle both populated sender (object with _id) and non-populated sender (ObjectId string)
                        const senderId = getSenderId(message.sender);
                        const isOwn = senderId === user._id;
                        const prevMessage = messages[index - 1];
                        const messageTimestamp = getMessageTimestamp(message);
                        const prevMessageTimestamp = prevMessage ? getMessageTimestamp(prevMessage) : null;
                        const showDate = index === 0 || 
                          !prevMessage || 
                          !prevMessageTimestamp ||
                          formatDate(messageTimestamp) !== formatDate(prevMessageTimestamp);
                        
                        return (
                          <Box key={message._id || `temp-${index}`}>
                            {showDate && (
                              <Box sx={{ textAlign: 'center', py: 2 }}>
                                <Chip 
                                  label={formatDate(messageTimestamp)} 
                                  size="small" 
                                  color="default"
                                />
                              </Box>
                            )}
                            
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: isOwn ? 'flex-end' : 'flex-start',
                                mb: 1,
                              }}
                            >
                              <Card
                                sx={{
                                  maxWidth: '70%',
                                  bgcolor: isOwn ? '#dcf8c6' : '#ffffff',
                                  color: isOwn ? '#000000' : 'text.primary',
                                  borderRadius: '18px',
                                  borderTopRightRadius: isOwn ? '4px' : '18px',
                                  borderTopLeftRadius: isOwn ? '18px' : '4px',
                                  boxShadow: '0 1px 0.5px rgba(0,0,0,.13)',
                                  opacity: message.isOptimistic ? 0.7 : 1,
                                  border: message.isOptimistic ? '1px dashed' : 'none',
                                  borderColor: message.isOptimistic ? (isOwn ? '#b8e6a0' : 'grey.400') : 'transparent',
                                }}
                              >
                                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                  <Typography variant="body2">
                                    {getSafeMessageContent(message)}
                                  </Typography>
                                  <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'flex-end',
                                    mt: 0.5,
                                    gap: 0.5
                                  }}>
                                    <Typography 
                                      variant="caption" 
                                      sx={{ opacity: 0.7, fontSize: '0.7rem' }}
                                    >
                                      {formatTime(messageTimestamp)}
                                    </Typography>
                                    {isOwn && (
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        {message.status === 'sending' && (
                                          <Box sx={{ 
                                            width: 12, 
                                            height: 12, 
                                            borderRadius: '50%',
                                            border: '2px solid #999',
                                            borderTopColor: 'transparent',
                                            animation: 'spin 1s linear infinite',
                                            '@keyframes spin': {
                                              '0%': { transform: 'rotate(0deg)' },
                                              '100%': { transform: 'rotate(360deg)' }
                                            }
                                          }} />
                                        )}
                                        {message.status === 'sent' && (
                                          <Typography sx={{ fontSize: '0.8rem', color: '#999' }}>✓</Typography>
                                        )}
                                        {message.status === 'delivered' && (
                                          <Typography sx={{ fontSize: '0.8rem', color: '#4fc3f7' }}>✓✓</Typography>
                                        )}
                                        {message.status === 'failed' && (
                                          <Typography 
                                            sx={{ 
                                              fontSize: '0.8rem', 
                                              color: '#f44336',
                                              cursor: 'pointer',
                                              '&:hover': { opacity: 0.7 }
                                            }}
                                            onClick={() => message.retry && message.retry()}
                                            title="Click to retry"
                                          >
                                            !
                                          </Typography>
                                        )}
                                      </Box>
                                    )}
                                  </Box>
                                </CardContent>
                              </Card>
                            </Box>
                          </Box>
                        );
                      })}
                      
                      {/* Typing Indicator */}
                      {typingUsers.length > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                          <Card sx={{ bgcolor: 'grey.100' }}>
                            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                              <Typography variant="body2" color="text.secondary">
                                Typing...
                              </Typography>
                            </CardContent>
                          </Card>
                        </Box>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No messages yet. Start the conversation!
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Message Input */}
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: '#f0f0f0',
                  borderTop: 1, 
                  borderColor: 'divider', 
                  flexShrink: 0 
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                    <IconButton size="small" sx={{ color: '#54656f' }}>
                      <EmojiIcon />
                    </IconButton>
                    
                    <TextField
                      fullWidth
                      multiline
                      maxRows={4}
                      placeholder="Type a message"
                      value={newMessage}
                      onChange={handleMessageInput}
                      onKeyPress={handleKeyPress}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '21px',
                          backgroundColor: '#ffffff',
                          fontSize: '0.9rem',
                          '& fieldset': {
                            border: 'none',
                          },
                          '&:hover fieldset': {
                            border: 'none',
                          },
                          '&.Mui-focused fieldset': {
                            border: '1px solid #00a884',
                          },
                        },
                        '& .MuiOutlinedInput-input': {
                          py: 1.2,
                          px: 2,
                        },
                      }}
                    />
                    
                    <IconButton size="small" sx={{ color: '#54656f' }}>
                      <AttachIcon />
                    </IconButton>
                    
                    <IconButton size="small" sx={{ color: '#54656f' }}>
                      <ImageIcon />
                    </IconButton>
                    
                    <IconButton 
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      sx={{
                        backgroundColor: newMessage.trim() ? '#00a884' : 'transparent',
                        color: newMessage.trim() ? '#ffffff' : '#54656f',
                        width: 42,
                        height: 42,
                        '&:hover': {
                          backgroundColor: newMessage.trim() ? '#008c72' : 'rgba(84, 101, 111, 0.1)',
                        },
                      }}
                    >
                      <SendIcon />
                    </IconButton>
                  </Box>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="h6" color="text.secondary">
                  Select a conversation to start messaging
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Chat Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem onClick={() => setMenuAnchor(null)}>
            View Profile
          </MenuItem>
          <MenuItem onClick={() => setMenuAnchor(null)}>
            Block User
          </MenuItem>
          <MenuItem onClick={() => setMenuAnchor(null)}>
            Report
          </MenuItem>
        </Menu>
      </Box>
  );
};

export default Chat;
