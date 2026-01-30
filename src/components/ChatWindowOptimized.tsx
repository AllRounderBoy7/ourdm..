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
  Image,
  FileVideo,
  File,
  MapPin,
  X,
  StopCircle,
  Gift,
  Sticker,
  Music,
  Contact,
  Calendar,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import MessageBubble from './MessageBubble';
import { debounce } from '../utils/performance';

interface ChatWindowOptimizedProps {
  chatId: string;
  onBack: () => void;
}

// File size limits in bytes
const FILE_LIMITS = {
  photo: 50 * 1024 * 1024, // 50MB
  video: 50 * 1024 * 1024, // 50MB
  audio: 25 * 1024 * 1024, // 25MB
  document: 100 * 1024 * 1024, // 100MB
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const ChatWindowOptimized = memo(({ chatId, onBack }: ChatWindowOptimizedProps) => {
  const { currentUser, chats, messages, users, sendMessage, markAsRead } = useApp();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'photo' | 'video' | 'audio' | 'document' | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [_showContactPicker, setShowContactPicker] = useState(false);
  const [showScheduleMessage, setShowScheduleMessage] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const chat = chats.find((c: any) => c.id === chatId);
  const chatMessages = messages[chatId] || [];
  const otherUserId = chat?.participants.find((p: any) => p !== currentUser?.id);
  const otherUser = users.find((u: any) => u.id === otherUserId);

  // Popular emojis
  const popularEmojis = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '😍', '🥺', '😭', '🙏', '💪', '✨', '🎂', '🌹', '💕', '😘', '🤗', '😎', '🥳', '💯'];
  
  // Popular GIFs (placeholder URLs)
  const popularGifs = [
    'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
    'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
    'https://media.giphy.com/media/l46CyJmS9KUbokzsI/giphy.gif',
    'https://media.giphy.com/media/3o6Zt6ML6BklcajjsA/giphy.gif',
  ];

  // Popular stickers (placeholder)
  const popularStickers = ['🎈', '🎁', '🎊', '🎀', '🏆', '🎯', '💎', '👑', '🦋', '🌈', '⭐', '🌟'];

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  useEffect(() => {
    if (chatMessages.length > 0) {
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }, [chatMessages.length, scrollToBottom]);

  // Mark messages as read
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

  // Typing indicator with debounce
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

  // File selection handler with validation
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video' | 'audio' | 'document') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);
    
    // Check file size
    const limit = FILE_LIMITS[type];
    if (file.size > limit) {
      setFileError(`File size must be less than ${formatFileSize(limit)}. Your file: ${formatFileSize(file.size)}`);
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
      return;
    }

    // Validate file type
    const validTypes: Record<string, string[]> = {
      photo: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
      audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
      document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/zip'],
    };

    if (!validTypes[type].includes(file.type) && type !== 'document') {
      setFileError(`Invalid file type. Allowed: ${validTypes[type].join(', ')}`);
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
      return;
    }

    setSelectedFile(file);
    setFileType(type);
    setShowAttachMenu(false);

    // Create preview
    if (type === 'photo' || type === 'video') {
      const url = URL.createObjectURL(file);
      setFilePreview(url);
    } else {
      setFilePreview(null);
    }

    if (navigator.vibrate) navigator.vibrate(10);
  }, []);

  // Upload file with progress
  const uploadFile = useCallback(async () => {
    if (!selectedFile) return null;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // In real app, upload to Supabase storage
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Return file URL (in real app, this would be from storage)
      const url = filePreview || URL.createObjectURL(selectedFile);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

      return url;
    } catch (error) {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
      setFileError('Upload failed. Please try again.');
      return null;
    }
  }, [selectedFile, filePreview]);

  // Send message with file
  const handleSend = useCallback(async () => {
    if ((!input.trim() && !selectedFile) || !currentUser) return;

    let messageContent = input.trim();
    let mediaUrl = null;

    // Upload file if selected
    if (selectedFile) {
      mediaUrl = await uploadFile();
      if (!mediaUrl && !messageContent) {
        return; // Upload failed and no text
      }
      
      // Add file info to message
      if (mediaUrl) {
        messageContent = messageContent || `[${fileType?.toUpperCase()}] ${selectedFile.name}`;
      }
    }

    setInput('');
    setSelectedFile(null);
    setFilePreview(null);
    setFileType(null);
    setIsTyping(false);

    if (navigator.vibrate) navigator.vibrate(10);

    // Send message
    await sendMessage(chatId, messageContent);

    inputRef.current?.focus();
  }, [input, chatId, currentUser, sendMessage, selectedFile, uploadFile, fileType]);

  // Schedule message
  const handleScheduleMessage = useCallback(async () => {
    if (!input.trim() || !scheduleDate || !scheduleTime) return;

    const scheduledTime = new Date(`${scheduleDate}T${scheduleTime}`);
    if (scheduledTime <= new Date()) {
      setFileError('Schedule time must be in the future');
      return;
    }

    // In real app, save to database with schedule time
    alert(`Message scheduled for ${scheduledTime.toLocaleString()}`);
    
    setInput('');
    setShowScheduleMessage(false);
    setScheduleDate('');
    setScheduleTime('');
    
    if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
  }, [input, scheduleDate, scheduleTime]);

  // Voice recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        URL.createObjectURL(blob); // For future use
        // Send voice message
        sendMessage(chatId, `🎤 Voice message (${recordingTime}s)`);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      if (navigator.vibrate) navigator.vibrate(20);
    } catch (error) {
      setFileError('Microphone access denied');
    }
  }, [chatId, sendMessage, recordingTime]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
    }
  }, [isRecording]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setRecordingTime(0);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (navigator.vibrate) navigator.vibrate(50);
    }
  }, [isRecording]);

  // Send location
  const handleSendLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
          sendMessage(chatId, `📍 Location: ${locationUrl}`);
          setShowLocationPicker(false);
          if (navigator.vibrate) navigator.vibrate(10);
        },
        () => {
          setFileError('Location access denied');
        }
      );
    }
  }, [chatId, sendMessage]);

  // Send GIF
  const handleSendGif = useCallback((gifUrl: string) => {
    sendMessage(chatId, `[GIF] ${gifUrl}`);
    setShowGifPicker(false);
    if (navigator.vibrate) navigator.vibrate(10);
  }, [chatId, sendMessage]);

  // Send sticker
  const handleSendSticker = useCallback((sticker: string) => {
    sendMessage(chatId, sticker);
    setShowStickerPicker(false);
    if (navigator.vibrate) navigator.vibrate(10);
  }, [chatId, sendMessage]);

  // Add emoji to input
  const handleAddEmoji = useCallback((emoji: string) => {
    setInput(prev => prev + emoji);
    inputRef.current?.focus();
    if (navigator.vibrate) navigator.vibrate(5);
  }, []);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // Clear file selection
  const clearFileSelection = useCallback(() => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileType(null);
    setFileError(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
  }, [filePreview]);

  if (!chat || !otherUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-500">Chat not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, 'photo')}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, 'video')}
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, 'audio')}
      />
      <input
        ref={documentInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.zip"
        className="hidden"
        onChange={(e) => handleFileSelect(e, 'document')}
      />

      {/* Header */}
      <motion.header
        className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg"
        style={{ transform: 'translateZ(0)' }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="relative cursor-pointer">
          <img
            src={otherUser.avatar}
            alt={otherUser.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          {otherUser.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold truncate">
            {otherUser.fullName || otherUser.username}
          </h2>
          <p className="text-xs opacity-90 truncate">
            {otherUser.isOnline ? 'Online' : 'Offline'}
          </p>
        </div>

        <button className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90">
          <Video className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90">
          <Phone className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90">
          <MoreVertical className="w-5 h-5" />
        </button>
      </motion.header>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-2 bg-gray-50"
        style={{ WebkitOverflowScrolling: 'touch' }}
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
                delay: index * 0.01,
              }}
            >
              <MessageBubble
                message={message}
                isOwn={message.senderId === currentUser?.id}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            className="flex items-center gap-2 text-sm text-gray-500 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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

      {/* File Error */}
      <AnimatePresence>
        {fileError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mx-4 mb-2 p-3 bg-red-100 border border-red-300 rounded-lg flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-red-700 flex-1">{fileError}</span>
            <button onClick={() => setFileError(null)} className="text-red-500">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Preview */}
      <AnimatePresence>
        {selectedFile && filePreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mb-2 p-3 bg-gray-100 rounded-lg"
          >
            <div className="flex items-center gap-3">
              {fileType === 'photo' && (
                <img src={filePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
              )}
              {fileType === 'video' && (
                <video src={filePreview} className="w-20 h-20 object-cover rounded-lg" controls />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-600">Ready to send</span>
                </div>
              </div>
              <button onClick={clearFileSelection} className="p-2 hover:bg-gray-200 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-violet-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Uploading... {uploadProgress}%</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document Preview */}
      <AnimatePresence>
        {selectedFile && fileType === 'document' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mb-2 p-3 bg-gray-100 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
                <File className="w-6 h-6 text-violet-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
              <button onClick={clearFileSelection} className="p-2 hover:bg-gray-200 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attachment Menu */}
      <AnimatePresence>
        {showAttachMenu && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-20 left-4 right-4 bg-white rounded-2xl shadow-xl border p-4 z-50"
          >
            <div className="grid grid-cols-4 gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-100 rounded-xl transition-all"
              >
                <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
                  <Image className="w-6 h-6 text-violet-600" />
                </div>
                <span className="text-xs">Photo</span>
                <span className="text-[10px] text-gray-400">Max 50MB</span>
              </button>

              <button
                onClick={() => videoInputRef.current?.click()}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-100 rounded-xl transition-all"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileVideo className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs">Video</span>
                <span className="text-[10px] text-gray-400">Max 50MB</span>
              </button>

              <button
                onClick={() => audioInputRef.current?.click()}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-100 rounded-xl transition-all"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Music className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xs">Audio</span>
                <span className="text-[10px] text-gray-400">Max 25MB</span>
              </button>

              <button
                onClick={() => documentInputRef.current?.click()}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-100 rounded-xl transition-all"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <File className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-xs">Document</span>
                <span className="text-[10px] text-gray-400">Max 100MB</span>
              </button>

              <button
                onClick={() => { setShowLocationPicker(true); setShowAttachMenu(false); }}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-100 rounded-xl transition-all"
              >
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-red-600" />
                </div>
                <span className="text-xs">Location</span>
              </button>

              <button
                onClick={() => { setShowContactPicker(true); setShowAttachMenu(false); }}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-100 rounded-xl transition-all"
              >
                <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                  <Contact className="w-6 h-6 text-cyan-600" />
                </div>
                <span className="text-xs">Contact</span>
              </button>

              <button
                onClick={() => { setShowGifPicker(true); setShowAttachMenu(false); }}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-100 rounded-xl transition-all"
              >
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <Gift className="w-6 h-6 text-pink-600" />
                </div>
                <span className="text-xs">GIF</span>
              </button>

              <button
                onClick={() => { setShowScheduleMessage(true); setShowAttachMenu(false); }}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-100 rounded-xl transition-all"
              >
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
                <span className="text-xs">Schedule</span>
              </button>
            </div>
            
            <button
              onClick={() => setShowAttachMenu(false)}
              className="w-full mt-4 py-2 text-gray-500 text-sm"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mx-4 mb-2 p-3 bg-white rounded-2xl shadow-lg border"
          >
            <div className="flex flex-wrap gap-2">
              {popularEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleAddEmoji(emoji)}
                  className="text-2xl hover:scale-125 transition-transform p-1"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GIF Picker */}
      <AnimatePresence>
        {showGifPicker && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mx-4 mb-2 p-3 bg-white rounded-2xl shadow-lg border max-h-60 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">GIFs</h3>
              <button onClick={() => setShowGifPicker(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {popularGifs.map((gif, index) => (
                <button
                  key={index}
                  onClick={() => handleSendGif(gif)}
                  className="rounded-lg overflow-hidden hover:ring-2 ring-violet-500"
                >
                  <img src={gif} alt="GIF" className="w-full h-24 object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticker Picker */}
      <AnimatePresence>
        {showStickerPicker && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mx-4 mb-2 p-3 bg-white rounded-2xl shadow-lg border"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Stickers</h3>
              <button onClick={() => setShowStickerPicker(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {popularStickers.map((sticker) => (
                <button
                  key={sticker}
                  onClick={() => handleSendSticker(sticker)}
                  className="text-4xl hover:scale-125 transition-transform p-2"
                >
                  {sticker}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Location Picker */}
      <AnimatePresence>
        {showLocationPicker && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mx-4 mb-2 p-4 bg-white rounded-2xl shadow-lg border"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Share Location</h3>
              <button onClick={() => setShowLocationPicker(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <button
              onClick={handleSendLocation}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <MapPin className="w-5 h-5" />
              Send Current Location
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Message */}
      <AnimatePresence>
        {showScheduleMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mx-4 mb-2 p-4 bg-white rounded-2xl shadow-lg border"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Schedule Message</h3>
              <button onClick={() => setShowScheduleMessage(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                min={new Date().toISOString().split('T')[0]}
              />
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <button
                onClick={handleScheduleMessage}
                disabled={!input.trim() || !scheduleDate || !scheduleTime}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium disabled:opacity-50"
              >
                Schedule
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Recording UI */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mx-4 mb-2 p-4 bg-red-50 rounded-2xl border border-red-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-600 font-medium">Recording... {recordingTime}s</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={cancelRecording}
                  className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={stopRecording}
                  className="p-2 bg-red-500 rounded-full hover:bg-red-600"
                >
                  <StopCircle className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="border-t bg-white px-4 py-3" style={{ transform: 'translateZ(0)' }}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all active:scale-90"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowStickerPicker(false);
              setShowGifPicker(false);
            }}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all active:scale-90"
          >
            <Smile className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              setShowStickerPicker(!showStickerPicker);
              setShowEmojiPicker(false);
              setShowGifPicker(false);
            }}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all active:scale-90"
          >
            <Sticker className="w-5 h-5" />
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
          />

          {input.trim() || selectedFile ? (
            <motion.button
              onClick={handleSend}
              disabled={isUploading}
              className="p-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-full transition-all active:scale-90 shadow-lg disabled:opacity-50"
              whileTap={{ scale: 0.9 }}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          ) : (
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`p-2 rounded-full transition-all active:scale-90 ${
                isRecording ? 'bg-red-500 text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* File size info */}
        <p className="text-[10px] text-gray-400 text-center mt-2">
          📷 Photo: 50MB | 🎥 Video: 50MB | 🎵 Audio: 25MB | 📄 Document: 100MB
        </p>
      </div>

      {/* Made by footer */}
      <div className="text-center py-1 bg-gray-50 border-t">
        <p className="text-[10px] text-gray-400">Made with ❤️ by Sameer Shah</p>
      </div>
    </div>
  );
});

ChatWindowOptimized.displayName = 'ChatWindowOptimized';

export default ChatWindowOptimized;
