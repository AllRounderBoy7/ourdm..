import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Phone, Video, MoreVertical, Send, Smile, Paperclip,
  Mic, Image, File, MapPin, X, Reply, Copy, Star,
  Trash2, Edit2, Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDistanceToNow, format } from 'date-fns';
import { Message as MessageType } from '../types';

export const ChatWindow: React.FC = () => {
  const {
    currentUser,
    users,
    chats,
    messages,
    selectedChatId,
    typingUsers,
    onlineUsers,
    selectChat,
    sendMessage,
    deleteMessage,
    editMessage,
    reactToMessage,
    startCall,
    setTyping,
    starMessage,
    setCurrentScreen,
  } = useApp();

  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [replyingTo, setReplyingTo] = useState<MessageType | null>(null);
  const [editingMessage, setEditingMessage] = useState<MessageType | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chat = chats.find(c => c.id === selectedChatId);
  const chatMessages = selectedChatId ? messages[selectedChatId] || [] : [];

  const otherUserId = chat?.participants.find(id => id !== currentUser?.id);
  const otherUser = users.find(u => u.id === otherUserId);
  const isOnline = otherUser && onlineUsers.has(otherUser.id);
  const typingUserNames = typingUsers[selectedChatId || '']
    ?.filter(id => id !== currentUser?.id)
    .map(id => users.find(u => u.id === id)?.name)
    .filter(Boolean);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (editingMessage) {
      setMessageInput(editingMessage.content);
      inputRef.current?.focus();
    }
  }, [editingMessage]);

  const handleSend = () => {
    if (!selectedChatId || !messageInput.trim()) return;

    if (editingMessage) {
      editMessage(selectedChatId, editingMessage.id, messageInput);
      setEditingMessage(null);
    } else {
      sendMessage(selectedChatId, messageInput);
    }

    setMessageInput('');
    setReplyingTo(null);
  };

  const handleInputChange = (value: string) => {
    setMessageInput(value);
    if (selectedChatId && value.trim()) {
      setTyping(selectedChatId, true);
    }
  };

  const emojis = ['❤️', '😂', '😮', '😢', '🙏', '👍', '🎉', '🔥'];

  if (!chat || !selectedChatId) return null;

  const chatName = chat.type === 'group' ? chat.name : otherUser?.name;
  const chatAvatar = chat.type === 'group' ? chat.avatar : otherUser?.avatar;

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => {
                selectChat(null);
                setCurrentScreen('chats');
              }}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="relative">
              <img
                src={chatAvatar}
                alt={chatName}
                className="w-10 h-10 rounded-full border-2 border-white/50"
              />
              {isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-violet-600"></div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-semibold truncate">{chatName}</h2>
              <p className="text-xs text-violet-100">
                {typingUserNames && typingUserNames.length > 0
                  ? `${typingUserNames.join(', ')} typing...`
                  : isOnline
                  ? 'Online'
                  : otherUser?.lastSeen
                  ? `Last seen ${formatDistanceToNow(otherUser.lastSeen)} ago`
                  : 'Offline'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => startCall(selectedChatId, 'video')}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <Video className="w-5 h-5" />
            </button>
            <button
              onClick={() => startCall(selectedChatId, 'audio')}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-gradient-to-b from-violet-50/30 to-white">
        <AnimatePresence>
          {chatMessages.map((message, index) => {
            const isOwn = message.senderId === currentUser?.id;
            const sender = users.find(u => u.id === message.senderId);
            const showAvatar = !isOwn && (
              index === chatMessages.length - 1 ||
              chatMessages[index + 1]?.senderId !== message.senderId
            );

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`flex gap-2 mb-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {!isOwn && (
                  <div className="flex-shrink-0 w-8">
                    {showAvatar ? (
                      <img
                        src={sender?.avatar}
                        alt={sender?.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8"></div>
                    )}
                  </div>
                )}

                <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  {!isOwn && chat.type === 'group' && (
                    <span className="text-xs text-violet-600 font-medium mb-1 px-1">
                      {sender?.name}
                    </span>
                  )}

                  <div
                    className={`relative group ${
                      message.deleted
                        ? 'opacity-50'
                        : ''
                    }`}
                    onDoubleClick={() => {
                      if (!message.deleted) {
                        reactToMessage(selectedChatId, message.id, '❤️');
                      }
                    }}
                    onClick={() => setSelectedMessage(
                      selectedMessage === message.id ? null : message.id
                    )}
                  >
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isOwn
                          ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      } ${message.deleted ? 'italic' : ''}`}
                    >
                      {message.replyTo && (
                        <div className={`mb-2 pb-2 border-l-2 pl-2 text-xs ${
                          isOwn ? 'border-white/30' : 'border-violet-300'
                        }`}>
                          <p className={isOwn ? 'text-white/70' : 'text-gray-500'}>
                            Replying to message
                          </p>
                        </div>
                      )}

                      <p className="whitespace-pre-wrap break-words">
                        {message.content}
                      </p>

                      {message.edited && !message.deleted && (
                        <span className={`text-xs ml-2 ${isOwn ? 'text-white/60' : 'text-gray-400'}`}>
                          (edited)
                        </span>
                      )}

                      <div className={`flex items-center gap-1.5 mt-1 ${
                        isOwn ? 'justify-end' : 'justify-start'
                      }`}>
                        {message.starred && (
                          <Star className={`w-3 h-3 ${isOwn ? 'text-yellow-300' : 'text-yellow-500'} fill-current`} />
                        )}
                        <span className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                          {format(message.timestamp, 'HH:mm')}
                        </span>
                        {isOwn && (
                          <div className="flex">
                            {message.status === 'read' && (
                              <Check className="w-3.5 h-3.5 text-blue-300" />
                            )}
                            <Check className={`w-3.5 h-3.5 -ml-2 ${
                              message.status === 'read' ? 'text-blue-300' : 'text-white/70'
                            }`} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className={`flex gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        {Object.entries(
                          message.reactions.reduce((acc, r) => {
                            acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([emoji, count]) => (
                          <button
                            key={emoji}
                            onClick={() => reactToMessage(selectedChatId, message.id, emoji)}
                            className="px-2 py-0.5 bg-white rounded-full shadow-sm border border-gray-200 text-xs flex items-center gap-1 hover:scale-110 transition-transform"
                          >
                            <span>{emoji}</span>
                            <span className="text-gray-600">{count}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Message Actions */}
                    <AnimatePresence>
                      {selectedMessage === message.id && !message.deleted && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={`absolute ${
                            isOwn ? 'right-0' : 'left-0'
                          } -bottom-2 translate-y-full bg-white rounded-xl shadow-2xl border border-gray-200 p-2 flex gap-1 z-10`}
                        >
                          <button
                            onClick={() => {
                              setReplyingTo(message);
                              setSelectedMessage(null);
                              inputRef.current?.focus();
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Reply"
                          >
                            <Reply className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => {
                              reactToMessage(selectedChatId, message.id, '❤️');
                              setSelectedMessage(null);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="React"
                          >
                            <Smile className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(message.content);
                              setSelectedMessage(null);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Copy"
                          >
                            <Copy className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => {
                              starMessage(selectedChatId, message.id);
                              setSelectedMessage(null);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Star"
                          >
                            <Star className="w-4 h-4 text-gray-600" />
                          </button>
                          {isOwn && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingMessage(message);
                                  setSelectedMessage(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4 text-gray-600" />
                              </button>
                              <button
                                onClick={() => {
                                  deleteMessage(selectedChatId, message.id);
                                  setSelectedMessage(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
      <AnimatePresence>
        {(replyingTo || editingMessage) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 py-2 bg-violet-50 border-t border-violet-100 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              {editingMessage ? (
                <Edit2 className="w-4 h-4 text-violet-600" />
              ) : (
                <Reply className="w-4 h-4 text-violet-600" />
              )}
              <div>
                <p className="text-xs text-violet-600 font-medium">
                  {editingMessage ? 'Editing message' : 'Replying to'}
                </p>
                <p className="text-sm text-gray-600 truncate max-w-[200px]">
                  {(replyingTo || editingMessage)?.content}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setReplyingTo(null);
                setEditingMessage(null);
                setMessageInput('');
              }}
              className="p-1 hover:bg-violet-100 rounded-full"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-end gap-2">
          {/* Attach Button */}
          <div className="relative">
            <button
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="p-2 text-violet-600 hover:bg-violet-50 rounded-full transition-colors"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <AnimatePresence>
              {showAttachMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute bottom-full mb-2 left-0 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 w-48"
                >
                  <button className="w-full px-3 py-2 flex items-center gap-3 hover:bg-violet-50 rounded-lg transition-colors text-left">
                    <Image className="w-5 h-5 text-violet-600" />
                    <span className="text-sm text-gray-700">Photo</span>
                  </button>
                  <button className="w-full px-3 py-2 flex items-center gap-3 hover:bg-violet-50 rounded-lg transition-colors text-left">
                    <File className="w-5 h-5 text-violet-600" />
                    <span className="text-sm text-gray-700">Document</span>
                  </button>
                  <button className="w-full px-3 py-2 flex items-center gap-3 hover:bg-violet-50 rounded-lg transition-colors text-left">
                    <MapPin className="w-5 h-5 text-violet-600" />
                    <span className="text-sm text-gray-700">Location</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Field */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={messageInput}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="w-full bg-gray-100 rounded-full py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-600"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Emoji Picker */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute bottom-full right-0 mb-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 grid grid-cols-4 gap-2"
                >
                  {emojis.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setMessageInput(prev => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="text-2xl hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Send/Record Button */}
          {messageInput.trim() ? (
            <button
              onClick={handleSend}
              className="p-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-full hover:shadow-lg transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`p-3 rounded-full transition-all ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-gray-100 text-gray-600 hover:bg-violet-50 hover:text-violet-600'
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
