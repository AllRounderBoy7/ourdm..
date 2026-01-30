import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Send,
  Smile,
  Paperclip,
  Mic,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import MessageBubble from './MessageBubble';
import { debounce } from '../utils/performance';

interface ChatWindowOptimizedProps {
  chatId: string;
  onBack: () => void;
}

const ChatWindowOptimized = memo(({ chatId, onBack }: ChatWindowOptimizedProps) => {
  const { currentUser, chats, messages, users, sendMessage, markAsRead } = useApp();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chat = chats.find((c: any) => c.id === chatId);
  const chatMessages = messages[chatId] || [];
  const otherUserId = chat?.participants.find((p: any) => p !== currentUser?.id);
  const otherUser = users.find((u: any) => u.id === otherUserId);

  // Auto-scroll to bottom with performance optimization
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  useEffect(() => {
    // Instant scroll on first load, smooth scroll on new messages
    if (chatMessages.length > 0) {
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }, [chatMessages.length, scrollToBottom]);

  // Mark messages as read instantly
  useEffect(() => {
    if (chatMessages.length > 0 && currentUser) {
      const unreadMessages = chatMessages.filter(
        (m) => m.senderId !== currentUser.id && m.status !== 'read'
      );
      if (unreadMessages.length > 0) {
        markAsRead(chatId);
      }
    }
  }, [chatMessages, chatId, currentUser, markAsRead]);

  // Optimized typing indicator with debounce
  const debouncedStopTyping = useCallback(
    debounce(() => {
      setIsTyping(false);
    }, 1000),
    []
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInput(value);

      if (value.length > 0 && !isTyping) {
        setIsTyping(true);
      }

      debouncedStopTyping();
    },
    [isTyping, debouncedStopTyping]
  );

  // Optimistic message sending (instant UI update)
  const handleSend = useCallback(async () => {
    if (!input.trim() || !currentUser) return;

    const messageContent = input.trim();
    setInput(''); // Clear input instantly
    setIsTyping(false);

    // Vibration feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    // Send to backend
    await sendMessage(chatId, messageContent);

    // Focus back to input for continuous typing
    inputRef.current?.focus();
  }, [input, chatId, currentUser, sendMessage]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleVoiceNote = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
    // Voice note functionality
    alert('Voice note feature coming soon!');
  }, []);

  const handleAttachment = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    // Attachment functionality
    alert('Attachment feature coming soon!');
  }, []);

  if (!chat || !otherUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-500">Chat not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header - Fixed with hardware acceleration */}
      <motion.header
        className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg"
        style={{ transform: 'translateZ(0)' }} // Hardware acceleration
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div
          className="relative cursor-pointer"
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(5);
          }}
        >
          <img
            src={otherUser.avatar}
            alt={otherUser.username}
            className="w-10 h-10 rounded-full object-cover"
            loading="eager" // Prioritize loading
          />
          {otherUser.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold truncate">
            {otherUser.name || otherUser.username}
          </h2>
          <p className="text-xs opacity-90 truncate">
            {otherUser.isOnline ? 'Online' : 'Offline'}
          </p>
        </div>

        <button
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(10);
          }}
          className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"
        >
          <Video className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(10);
          }}
          className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"
        >
          <Phone className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(10);
          }}
          className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </motion.header>

      {/* Messages - Optimized scrolling with will-change */}
      <div
        className="flex-1 overflow-y-auto px-4 py-2 bg-gray-50"
        style={{
          willChange: 'scroll-position',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <AnimatePresence mode="popLayout">
          {chatMessages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30,
                delay: index * 0.01, // Stagger effect
              }}
            >
              <MessageBubble
                message={message}
                isOwn={message.senderId === currentUser?.id}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            className="flex items-center gap-2 text-sm text-gray-500 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>typing...</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input - Fixed with hardware acceleration */}
      <div
        className="border-t bg-white px-4 py-3"
        style={{ transform: 'translateZ(0)' }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={handleAttachment}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all active:scale-90"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              if (navigator.vibrate) navigator.vibrate(5);
            }}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all active:scale-90"
          >
            <Smile className="w-5 h-5" />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Message..."
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-violet-500 transition-all"
            autoFocus
            style={{ WebkitTapHighlightColor: 'transparent' }}
          />

          {input.trim() ? (
            <motion.button
              onClick={handleSend}
              className="p-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-full transition-all active:scale-90 shadow-lg"
              whileTap={{ scale: 0.9 }}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          ) : (
            <button
              onClick={handleVoiceNote}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all active:scale-90"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

ChatWindowOptimized.displayName = 'ChatWindowOptimized';

export default ChatWindowOptimized;
