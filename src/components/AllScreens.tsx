import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Plus, X, User, Lock, Bell, Palette, Globe,
  Moon, Shield, HelpCircle, Info, Star, Archive, MessageSquare,
  Eye, Camera, CheckCircle, Volume2, Vibrate, Download, Trash2,
  Database, Wifi, Smartphone, Monitor, Key, UserCheck, UserX,
  MessageCircle, Image, Video, FileText, PhoneCall,
  Clock, Languages, Type, Zap, Heart,
  Share2, LogOut, ChevronRight, Phone
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';

// Stories Screen
export const StoriesScreen: React.FC = () => {
  const { currentUser, users, stories, setCurrentScreen } = useApp();
  const [viewingStory, setViewingStory] = useState<string | null>(null);
  const [storyIndex, setStoryIndex] = useState(0);

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
          onClick={nextStory}
          className="h-full flex items-center justify-center cursor-pointer"
          style={{
            background: currentStory.type === 'text' 
              ? currentStory.backgroundColor || '#8B5CF6'
              : 'black',
          }}
        >
          {currentStory.type === 'text' ? (
            <p className="text-3xl font-bold text-center px-8">{currentStory.content}</p>
          ) : (
            <img
              src={currentStory.content}
              alt="Story"
              className="max-h-full max-w-full object-contain"
            />
          )}
        </div>

        {/* Views */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white/70">
          <Eye className="w-4 h-4" />
          <span className="text-sm">{currentStory.views.length} views</span>
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
            className="aspect-[3/4] bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex flex-col items-center justify-center gap-3 text-white shadow-lg"
          >
            <Plus className="w-12 h-12" />
            <span className="font-semibold">Add Story</span>
          </motion.button>

          {/* Story Thumbnails */}
          {users.filter(u => stories.some(s => s.userId === u.id)).map(user => {
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
                    style={{ background: latestStory.backgroundColor }}
                  >
                    <p className="text-white text-lg font-semibold text-center line-clamp-4">
                      {latestStory.content}
                    </p>
                  </div>
                ) : (
                  <img
                    src={latestStory.content}
                    alt="Story"
                    className="w-full h-full object-cover"
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
        { icon: Key, label: 'Change Password', type: 'action' },
        { icon: Phone, label: 'Change Phone Number', type: 'action' },
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
        { icon: Shield, label: 'Two-Factor Authentication', type: 'navigation' },
        { icon: Lock, label: 'App Lock', type: 'navigation' },
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
    {
      title: 'Backup',
      items: [
        { icon: Database, label: 'Backup Frequency', value: settings.backupFrequency, type: 'select' },
        { icon: Video, label: 'Include Videos', value: settings.includeVideos, key: 'includeVideos', type: 'toggle' },
        { icon: Download, label: 'Backup Now', type: 'action' },
        { icon: Clock, label: 'Last Backup', type: 'info', value: 'Today at 2:30 AM' },
      ],
    },
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
  const { currentUser, setCurrentScreen } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [bio, setBio] = useState(currentUser?.bio || '');

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
          onClick={() => setIsEditing(!isEditing)}
          className="text-sm font-semibold"
        >
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Avatar Section */}
        <div className="bg-white p-8 flex flex-col items-center gap-4 mb-6">
          <div className="relative">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-32 h-32 rounded-full border-4 border-violet-500 shadow-xl"
            />
            {isEditing && (
              <button className="absolute bottom-0 right-0 p-3 bg-violet-600 text-white rounded-full shadow-lg">
                <Camera className="w-5 h-5" />
              </button>
            )}
          </div>
          {isEditing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-2xl font-bold text-center border-b-2 border-violet-600 focus:outline-none px-4 py-2"
            />
          ) : (
            <h2 className="text-2xl font-bold">{currentUser?.name}</h2>
          )}
          <p className="text-violet-600 font-semibold">@{currentUser?.username}</p>
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
            <p className="text-gray-700">{currentUser?.bio || 'No bio yet'}</p>
          )}
        </div>

        {/* Stats */}
        <div className="bg-white p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-violet-600">147</div>
              <div className="text-sm text-gray-500">Messages</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-violet-600">23</div>
              <div className="text-sm text-gray-500">Calls</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-violet-600">8</div>
              <div className="text-sm text-gray-500">Stories</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
