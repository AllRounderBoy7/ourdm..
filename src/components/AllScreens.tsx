import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Plus, X, User, Lock, Bell, Palette, Globe,
  Moon, Shield, HelpCircle, Info, Star, Archive, MessageSquare,
  Eye, EyeOff, Camera, CheckCircle, Volume2, Vibrate, Download, Trash2,
  Database, Wifi, Smartphone, Monitor, UserCheck, UserX,
  MessageCircle, Image, Video, FileText, PhoneCall,
  Clock, Languages, Type, Zap, Heart,
  Share2, LogOut, ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';

// Stories Screen
export const StoriesScreen: React.FC = () => {
  const { currentUser, users, stories, setCurrentScreen, addStory, deleteStory, friends } = useApp();
  const [viewingStory, setViewingStory] = useState<string | null>(null);
  const [storyIndex, setStoryIndex] = useState(0);
  const [showAddStory, setShowAddStory] = useState(false);
  const [storyText, setStoryText] = useState('');
  const [storyMediaPreview, setStoryMediaPreview] = useState<string | null>(null);
  const [_storyMediaFile, _setStoryMediaFile] = useState<File | null>(null);
  const [storyType, setStoryType] = useState<'text' | 'image' | 'video'>('text');
  const [isUploading, setIsUploading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [storyComments, setStoryComments] = useState<{[key: string]: Array<{id: string, oderId: string, username: string, text: string, createdAt: number}>}>({});

  // Filter stories - only show from friends + own stories
  const friendIds = friends?.map((f: { oderId: string }) => f.oderId) || [];
  const visibleStories = stories.filter(s => 
    s.userId === currentUser?.id || friendIds.includes(s.userId)
  );

  // Group stories by user
  // Use filtered stories for display
  const storyUsersToShow = users.filter(u => visibleStories.some(s => s.userId === u.id));

  // Add comment to story
  const handleAddComment = () => {
    if (!commentText.trim() || !currentStory) return;
    
    const newComment = {
      id: Date.now().toString(),
      oderId: currentUser?.id || '',
      username: currentUser?.username || '',
      text: commentText.trim(),
      createdAt: Date.now()
    };
    
    setStoryComments(prev => ({
      ...prev,
      [currentStory.id]: [...(prev[currentStory.id] || []), newComment]
    }));
    
    setCommentText('');
    setShowComments(false);
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  // Delete story (only owner can delete)
  const handleDeleteStory = async () => {
    if (!currentStory || currentStory.userId !== currentUser?.id) return;
    
    if (confirm('Delete this story?')) {
      try {
        await deleteStory(currentStory.id);
        nextStory();
        
        if ('vibrate' in navigator) {
          navigator.vibrate([10, 50, 10]);
        }
      } catch (error) {
        console.error('Failed to delete story:', error);
        alert('Failed to delete story');
      }
    }
  };

  const userStories = viewingStory 
    ? stories.filter(s => s.userId === viewingStory)
    : [];
  const currentStory = userStories[storyIndex];
  const storyUser = users.find(u => u.id === viewingStory);

  const nextStory = () => {
    if (storyIndex < userStories.length - 1) {
      setStoryIndex(storyIndex + 1);
    } else {
      setViewingStory(null);
      setStoryIndex(0);
    }
  };

  if (viewingStory && currentStory) {
    return (
      <div className="h-screen bg-black text-white relative">
        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-20">
          {userStories.map((_, i) => (
            <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className={`h-full bg-white transition-all duration-300 ${
                  i < storyIndex ? 'w-full' : i === storyIndex ? 'w-1/2 animate-pulse' : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-4 z-20">
          <div className="flex items-center gap-3">
            <img
              src={storyUser?.avatar}
              alt={storyUser?.name}
              className="w-10 h-10 rounded-full border-2 border-white"
            />
            <div>
              <p className="font-semibold">{storyUser?.name}</p>
              <p className="text-xs text-white/70">
                {formatDistanceToNow(currentStory.timestamp)} ago
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setViewingStory(null);
              setStoryIndex(0);
            }}
            className="p-2 hover:bg-white/10 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Story Content */}
        <div
          className="h-full flex items-center justify-center"
          style={{
            background: currentStory.type === 'text' 
              ? currentStory.backgroundColor || '#8B5CF6'
              : 'black',
          }}
        >
          {currentStory.type === 'text' ? (
            <div onClick={nextStory} className="cursor-pointer w-full h-full flex items-center justify-center">
              <p className="text-3xl font-bold text-center px-8">{currentStory.content}</p>
            </div>
          ) : currentStory.type === 'video' ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                src={currentStory.content}
                className="max-h-full max-w-full object-contain"
                autoPlay
                playsInline
                muted={false}
                controls
                onEnded={nextStory}
                onError={(e) => {
                  console.error('Video error:', e);
                }}
              />
              {/* Skip button for video */}
              <button
                onClick={nextStory}
                className="absolute bottom-20 right-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium hover:bg-white/30 transition-colors"
              >
                Skip →
              </button>
            </div>
          ) : (
            <div onClick={nextStory} className="cursor-pointer w-full h-full flex items-center justify-center">
              <img
                src={currentStory.content}
                alt="Story"
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  console.error('Image error:', e);
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x600?text=Image+Error';
                }}
              />
            </div>
          )}
        </div>

        {/* Bottom Bar - Views, Comments, Delete */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          {/* Comment Input */}
          {showComments && (
            <div className="mb-4 bg-white/10 backdrop-blur-sm rounded-2xl p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 bg-white/20 rounded-full px-4 py-2 text-white placeholder-white/50 focus:outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  className="px-4 py-2 bg-violet-600 text-white rounded-full font-medium disabled:opacity-50"
                >
                  Send
                </button>
              </div>
              {/* Show comments for this story */}
              {storyComments[currentStory.id]?.length > 0 && (
                <div className="mt-3 max-h-32 overflow-y-auto space-y-2">
                  {storyComments[currentStory.id].map((comment) => (
                    <div key={comment.id} className="text-sm">
                      <span className="font-semibold text-white">@{comment.username}</span>
                      <span className="text-white/80 ml-2">{comment.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-white/70">
                <Eye className="w-4 h-4" />
                <span className="text-sm">{currentStory.views.length} views</span>
              </div>
              
              {/* Comment button */}
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">
                  {storyComments[currentStory.id]?.length || 0} comments
                </span>
              </button>
            </div>

            {/* Delete button - only for owner */}
            {currentStory.userId === currentUser?.id && (
              <button
                onClick={handleDeleteStory}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setStoryMediaPreview(event.target?.result as string);
        setStoryType(file.type.startsWith('video/') ? 'video' : 'image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostStory = async () => {
    setIsUploading(true);
    try {
      const content = storyType === 'text' ? storyText : storyMediaPreview || '';
      await addStory(content, storyType);
      
      // Reset form
      setShowAddStory(false);
      setStoryText('');
      setStoryMediaPreview(null);
      setStoryType('text');
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }
    } catch (error) {
      console.error('Failed to post story:', error);
      alert('Failed to post story. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Add Story Modal
  if (showAddStory) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-violet-600 to-purple-600">
        <div className="px-4 py-4 flex items-center justify-between text-white">
          <button onClick={() => setShowAddStory(false)}>
            <X className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Create Story</h1>
          <button
            onClick={handlePostStory}
            disabled={isUploading || (!storyText && !storyMediaPreview)}
            className="px-4 py-2 bg-white text-violet-600 rounded-full font-semibold disabled:opacity-50"
          >
            {isUploading ? 'Posting...' : 'Post'}
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-4">
          {storyMediaPreview ? (
            <div className="relative w-full max-w-md">
              {storyType === 'video' ? (
                <video
                  src={storyMediaPreview}
                  className="w-full rounded-2xl max-h-[60vh] object-contain"
                  controls
                  autoPlay
                  muted
                />
              ) : (
                <img
                  src={storyMediaPreview}
                  alt="Preview"
                  className="w-full rounded-2xl max-h-[60vh] object-contain"
                />
              )}
              <button
                onClick={() => {
                  setStoryMediaPreview(null);
                  setStoryType('text');
                }}
                className="absolute top-2 right-2 p-2 bg-black/50 rounded-full"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          ) : (
            <textarea
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full max-w-md h-64 bg-white/20 backdrop-blur-sm border-2 border-white/50 rounded-2xl p-6 text-white text-2xl placeholder-white/70 focus:outline-none focus:ring-4 focus:ring-white/50 resize-none"
            />
          )}
        </div>

        <div className="p-4 flex gap-3 justify-center">
          <label className="flex flex-col items-center gap-2 bg-white/20 backdrop-blur-sm rounded-2xl p-4 cursor-pointer hover:bg-white/30 transition-colors">
            <Image className="w-8 h-8 text-white" />
            <span className="text-white text-sm font-medium">Photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleMediaSelect}
              className="hidden"
            />
          </label>
          <label className="flex flex-col items-center gap-2 bg-white/20 backdrop-blur-sm rounded-2xl p-4 cursor-pointer hover:bg-white/30 transition-colors">
            <Video className="w-8 h-8 text-white" />
            <span className="text-white text-sm font-medium">Video</span>
            <input
              type="file"
              accept="video/*"
              onChange={handleMediaSelect}
              className="hidden"
            />
          </label>
          <button
            onClick={() => {
              setStoryType('text');
              setStoryMediaPreview(null);
            }}
            className="flex flex-col items-center gap-2 bg-white/20 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/30 transition-colors"
          >
            <Type className="w-8 h-8 text-white" />
            <span className="text-white text-sm font-medium">Text</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-4 flex items-center gap-3">
        <button onClick={() => setCurrentScreen('chats')}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">Stories</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Add Story */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddStory(true)}
            className="aspect-[3/4] bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex flex-col items-center justify-center gap-3 text-white shadow-lg"
          >
            <Plus className="w-12 h-12" />
            <span className="font-semibold">Add Story</span>
          </motion.button>

          {/* Story Thumbnails - only show stories from friends */}
          {storyUsersToShow.map(user => {
            const userStoryList = stories.filter(s => s.userId === user.id);
            const latestStory = userStoryList[0];
            const hasViewed = userStoryList.every(s => s.views.includes(currentUser?.id || ''));

            return (
              <motion.button
                key={user.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewingStory(user.id)}
                className="aspect-[3/4] rounded-2xl overflow-hidden relative shadow-lg"
              >
                {latestStory.type === 'text' ? (
                  <div
                    className="w-full h-full flex items-center justify-center p-4"
                    style={{ background: latestStory.backgroundColor || '#8B5CF6' }}
                  >
                    <p className="text-white text-lg font-semibold text-center line-clamp-4">
                      {latestStory.content}
                    </p>
                  </div>
                ) : latestStory.type === 'video' ? (
                  <div className="w-full h-full relative bg-black flex items-center justify-center">
                    <video
                      src={latestStory.content}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                    {/* Video indicator */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                        <Video className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={latestStory.content}
                    alt="Story"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400?text=Image';
                    }}
                  />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />
                
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className={`w-10 h-10 rounded-full border-2 ${
                      hasViewed ? 'border-gray-400' : 'border-violet-500'
                    }`}
                  />
                  <span className="text-white font-semibold text-sm">{user.name}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Settings Screen with 30+ Settings
export const SettingsScreen: React.FC = () => {
  const { setCurrentScreen, logout } = useApp();
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    soundNotifications: true,
    vibration: true,
    autoDownloadPhotos: true,
    autoDownloadVideos: false,
    lowDataMode: false,
    readReceipts: true,
    typingIndicators: true,
    onlineStatus: true,
    lastSeen: true,
    profilePhoto: 'everyone',
    about: 'everyone',
    status: 'contacts',
    groups: 'everyone',
    autoSaveToGallery: false,
    mediaQuality: 'auto',
    textSize: 'medium',
    enterSend: false,
    archiveChats: true,
    keepChatArchived: false,
    backupFrequency: 'daily',
    includeVideos: false,
    chatWallpaper: 'default',
    chatTheme: 'violet',
    bubbleStyle: 'rounded',
    fontSize: 16,
    messagePreview: true,
    groupNotifications: true,
    callRingtone: 'default',
    messageSound: 'default',
  });

  const toggleSetting = (key: string) => {
    setSettings(prev => ({...prev, [key]: !prev[key as keyof typeof prev]}));
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Edit Profile', screen: 'profile', type: 'navigation' },
        { icon: Share2, label: 'Invite Friends', type: 'action' },
        { icon: LogOut, label: 'Logout', action: logout, type: 'action', danger: true },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        { icon: Eye, label: 'Last Seen', value: settings.lastSeen, key: 'lastSeen', type: 'toggle' },
        { icon: User, label: 'Profile Photo Visibility', value: settings.profilePhoto, type: 'select' },
        { icon: Info, label: 'About Visibility', value: settings.about, type: 'select' },
        { icon: CheckCircle, label: 'Read Receipts', value: settings.readReceipts, key: 'readReceipts', type: 'toggle' },
        { icon: Type, label: 'Typing Indicators', value: settings.typingIndicators, key: 'typingIndicators', type: 'toggle' },
        { icon: UserCheck, label: 'Show Online Status', value: settings.onlineStatus, key: 'onlineStatus', type: 'toggle' },
        { icon: UserX, label: 'Blocked Contacts', type: 'navigation' },
        { icon: Lock, label: 'App Lock', type: 'navigation' },
        { icon: EyeOff, label: 'Hidden Chats', type: 'navigation' },
      ],
    },
    {
      title: 'Notifications',
      items: [
        { icon: Bell, label: 'Message Notifications', value: settings.notifications, key: 'notifications', type: 'toggle' },
        { icon: Volume2, label: 'Notification Sound', value: settings.soundNotifications, key: 'soundNotifications', type: 'toggle' },
        { icon: Vibrate, label: 'Vibration', value: settings.vibration, key: 'vibration', type: 'toggle' },
        { icon: MessageCircle, label: 'Group Notifications', value: settings.groupNotifications, key: 'groupNotifications', type: 'toggle' },
        { icon: Eye, label: 'Show Notification Preview', value: settings.messagePreview, key: 'messagePreview', type: 'toggle' },
        { icon: PhoneCall, label: 'Call Ringtone', value: settings.callRingtone, type: 'select' },
        { icon: Bell, label: 'Message Sound', value: settings.messageSound, type: 'select' },
      ],
    },
    {
      title: 'Chats',
      items: [
        { icon: Star, label: 'Starred Messages', type: 'navigation' },
        { icon: Archive, label: 'Archived Chats', type: 'navigation' },
        { icon: MessageSquare, label: 'Chat Wallpaper', value: settings.chatWallpaper, type: 'select' },
        { icon: Palette, label: 'Chat Theme', value: settings.chatTheme, type: 'select' },
        { icon: MessageCircle, label: 'Bubble Style', value: settings.bubbleStyle, type: 'select' },
        { icon: Type, label: 'Text Size', value: settings.textSize, type: 'select' },
        { icon: Zap, label: 'Enter to Send', value: settings.enterSend, key: 'enterSend', type: 'toggle' },
        { icon: Archive, label: 'Auto-Archive Chats', value: settings.archiveChats, key: 'archiveChats', type: 'toggle' },
        { icon: Archive, label: 'Keep Chats Archived', value: settings.keepChatArchived, key: 'keepChatArchived', type: 'toggle' },
      ],
    },
    {
      title: 'Data & Storage',
      items: [
        { icon: Wifi, label: 'Network Usage', type: 'navigation' },
        { icon: Database, label: 'Storage Usage', type: 'navigation' },
        { icon: Download, label: 'Auto-Download Photos', value: settings.autoDownloadPhotos, key: 'autoDownloadPhotos', type: 'toggle' },
        { icon: Video, label: 'Auto-Download Videos', value: settings.autoDownloadVideos, key: 'autoDownloadVideos', type: 'toggle' },
        { icon: Wifi, label: 'Low Data Mode', value: settings.lowDataMode, key: 'lowDataMode', type: 'toggle' },
        { icon: Download, label: 'Media Quality', value: settings.mediaQuality, type: 'select' },
        { icon: Image, label: 'Save to Gallery', value: settings.autoSaveToGallery, key: 'autoSaveToGallery', type: 'toggle' },
        { icon: Trash2, label: 'Clear Cache', type: 'action' },
      ],
    },
    // Backup section removed
    {
      title: 'Appearance',
      items: [
        { icon: Moon, label: 'Dark Mode', value: settings.darkMode, key: 'darkMode', type: 'toggle' },
        { icon: Palette, label: 'App Theme', value: 'violet', type: 'select' },
        { icon: Smartphone, label: 'Wallpaper', type: 'navigation' },
        { icon: Type, label: 'Font Size', value: settings.fontSize, type: 'slider' },
        { icon: Monitor, label: 'Display Mode', type: 'select' },
      ],
    },
    {
      title: 'Language & Region',
      items: [
        { icon: Globe, label: 'App Language', value: 'English', type: 'select' },
        { icon: Languages, label: 'Translation', type: 'navigation' },
        { icon: Clock, label: 'Time Format', value: '12-hour', type: 'select' },
      ],
    },
    {
      title: 'Help & Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', type: 'navigation' },
        { icon: MessageCircle, label: 'Contact Us', type: 'action' },
        { icon: FileText, label: 'Terms of Service', type: 'navigation' },
        { icon: Shield, label: 'Privacy Policy', type: 'navigation' },
        { icon: Info, label: 'About OurDM', type: 'navigation' },
        { icon: Heart, label: 'Rate App', type: 'action' },
      ],
    },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-4 flex items-center gap-3">
        <button onClick={() => setCurrentScreen('chats')}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        {settingsSections.map((section, index) => (
          <div key={index} className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase px-4 py-2 bg-gray-100">
              {section.title}
            </h2>
            <div className="bg-white">
              {section.items.map((item: any, i: number) => (
                <div
                  key={i}
                  className={`px-4 py-3.5 flex items-center gap-4 border-b border-gray-100 last:border-b-0 ${
                    item.type === 'action' || item.type === 'navigation' ? 'hover:bg-gray-50 active:bg-gray-100 cursor-pointer' : ''
                  }`}
                  onClick={() => {
                    if (item.screen) setCurrentScreen(item.screen);
                    if (item.action) item.action();
                  }}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${item.danger ? 'text-red-600' : 'text-violet-600'}`} />
                  <div className="flex-1 min-w-0">
                    <span className={`text-gray-900 ${item.danger ? 'text-red-600' : ''}`}>{item.label}</span>
                    {item.type === 'info' && item.value && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.value}</p>
                    )}
                  </div>
                  
                  {item.type === 'toggle' && item.key && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSetting(item.key);
                      }}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        item.value ? 'bg-violet-600' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          item.value ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  )}

                  {item.type === 'select' && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{item.value}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  )}

                  {(item.type === 'navigation' || item.type === 'action') && !item.danger && (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* App Version */}
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-gray-500">OurDM v1.0.0</p>
          <p className="text-xs text-gray-400 mt-1">Made with ❤️ for amazing communication</p>
        </div>
      </div>
    </div>
  );
};

// Profile Screen
export const ProfileScreen: React.FC = () => {
  const { currentUser, setCurrentScreen, updateUserProfile } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [uploading, setUploading] = useState(false);

  const handleSave = async () => {
    if (!currentUser) return;
    
    setUploading(true);
    try {
      await updateUserProfile({
        name: name.trim(),
        bio: bio.trim(),
        avatar: avatar,
      });
      setIsEditing(false);
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Preview the image
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentScreen('chats')}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>
        <button
          onClick={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}
          disabled={uploading}
          className="text-sm font-semibold hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {uploading ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Avatar Section */}
        <div className="bg-white p-8 flex flex-col items-center gap-4 mb-6">
          <div className="relative">
            <img
              src={avatar}
              alt={name}
              className="w-32 h-32 rounded-full border-4 border-violet-500 shadow-xl object-cover"
            />
            {isEditing && (
              <label className="absolute bottom-0 right-0 p-3 bg-violet-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-violet-700 active:scale-95 transition-all">
                <Camera className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          {isEditing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-2xl font-bold text-center border-b-2 border-violet-600 focus:outline-none px-4 py-2 w-full max-w-xs"
              placeholder="Your name"
            />
          ) : (
            <h2 className="text-2xl font-bold">{name}</h2>
          )}
          <p className="text-violet-600 font-semibold">@{currentUser?.username}</p>
          {!isEditing && (
            <div className={`flex items-center gap-1 text-sm ${
              currentUser?.status === 'online' ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                currentUser?.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
              {currentUser?.status === 'online' ? 'Online' : 'Offline'}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="bg-white p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">About</h3>
          {isEditing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
              rows={3}
              placeholder="Write something about yourself..."
            />
          ) : (
            <p className="text-gray-700">{bio || 'No bio yet'}</p>
          )}
        </div>

        {/* Stats */}
        <div className="bg-white p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Statistics</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-violet-600">147</div>
              <div className="text-sm text-gray-500">Messages</div>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">23</div>
              <div className="text-sm text-gray-500">Calls</div>
            </div>
            <div className="p-3 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl">
              <div className="text-2xl font-bold text-pink-600">8</div>
              <div className="text-sm text-gray-500">Stories</div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {!isEditing && (
          <div className="bg-white p-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Account Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Email</span>
                <span className="text-gray-900 font-medium">{currentUser?.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Username</span>
                <span className="text-violet-600 font-medium">@{currentUser?.username}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Joined</span>
                <span className="text-gray-900 font-medium">January 2024</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
