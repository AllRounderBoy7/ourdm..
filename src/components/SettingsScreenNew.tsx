import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, User, Lock, Bell, MessageCircle, Database,
  Palette, Globe, HelpCircle, ChevronRight, Moon,
  Volume2, Eye, EyeOff, Shield, Trash2, LogOut,
  Image, Type, Clock, Download, Wifi, WifiOff, Archive,
  Star, Phone, Check, Heart, Info, FileText, Mail,
  Settings, Camera, Users, UserX, Smartphone
} from 'lucide-react';

interface SettingsScreenNewProps {
  onBack: () => void;
  onLogout: () => void;
  currentUser: {
    id: string;
    username?: string;
    fullName?: string;
    name?: string;
    avatar?: string;
    bio?: string;
    email?: string;
  } | null;
}

const SettingsScreenNew: React.FC<SettingsScreenNewProps> = ({ onBack, onLogout, currentUser }) => {
  // All settings state
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('ourdm-settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return getDefaultSettings();
      }
    }
    return getDefaultSettings();
  });

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showPINSetup, setShowPINSetup] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [showBlockedList, setShowBlockedList] = useState(false);

  function getDefaultSettings() {
    return {
      // Privacy
      profilePhotoVisibility: 'everyone',
      aboutVisibility: 'everyone',
      lastSeenVisibility: 'everyone',
      readReceipts: true,
      blockedContacts: [] as string[],
      
      // Security
      appLock: false,
      appLockPIN: '',
      lockTimeout: '1',
      hiddenChats: [] as string[],
      lockedChats: [] as string[],
      
      // Notifications
      messageNotifications: true,
      notificationSound: true,
      vibration: true,
      groupNotifications: true,
      showNotificationPreview: 'always',
      callRingtone: 'default',
      messageSound: 'default',
      
      // Chats
      starredMessages: [] as string[],
      archivedChats: [] as string[],
      chatWallpaper: 'default',
      chatTheme: 'violet',
      bubbleStyle: 'rounded',
      textSize: 'medium',
      enterToSend: true,
      autoArchiveChats: false,
      keepChatsArchived: false,
      
      // Data & Storage
      autoDownloadPhotos: 'wifi',
      autoDownloadVideos: 'wifi',
      lowDataMode: false,
      mediaQuality: 'auto',
      saveToGallery: true,
      storageUsed: 128,
      cacheSize: 45,
      networkUsage: 256,
      
      // Appearance
      darkMode: true,
      appTheme: 'violet',
      wallpaper: 'default',
      fontSize: 'medium',
      displayMode: 'comfortable',
      
      // Language
      appLanguage: 'English',
      translationEnabled: false,
      timeFormat: '12',
      
      // Friend nicknames
      friendNicknames: {} as Record<string, string>,
    };
  }

  // Save settings
  const saveSettings = (newSettings: typeof settings) => {
    setSettings(newSettings);
    localStorage.setItem('ourdm-settings', JSON.stringify(newSettings));
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  const updateSetting = (key: string, value: unknown) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  // Toggle
  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => onChange(!value)}
      className={`w-12 h-6 rounded-full p-1 transition-colors ${
        value ? 'bg-violet-500' : 'bg-gray-600'
      }`}
    >
      <motion.div
        animate={{ x: value ? 20 : 0 }}
        className="w-4 h-4 bg-white rounded-full shadow-md"
      />
    </motion.button>
  );

  // Removed unused SelectOption

  // Setting Item
  const SettingItem = ({ 
    icon: Icon, 
    label, 
    value, 
    onClick, 
    toggle,
    danger,
    success
  }: { 
    icon: React.ElementType; 
    label: string; 
    value?: string; 
    onClick?: () => void;
    toggle?: { value: boolean; onChange: (v: boolean) => void };
    danger?: boolean;
    success?: boolean;
  }) => (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-xl ${
        danger ? 'bg-red-500/10 hover:bg-red-500/20' :
        success ? 'bg-green-500/10 hover:bg-green-500/20' :
        'bg-white/5 hover:bg-white/10'
      } transition-colors`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${danger ? 'text-red-400' : success ? 'text-green-400' : 'text-violet-400'}`} />
        <span className={danger ? 'text-red-400' : success ? 'text-green-400' : 'text-white'}>{label}</span>
      </div>
      {toggle ? (
        <Toggle value={toggle.value} onChange={toggle.onChange} />
      ) : value ? (
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">{value}</span>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </div>
      ) : (
        <ChevronRight className="w-4 h-4 text-gray-500" />
      )}
    </motion.button>
  );

  // Section header
  const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) => (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-violet-500/20 rounded-full flex items-center justify-center">
        <Icon className="w-5 h-5 text-violet-400" />
      </div>
      <div>
        <h3 className="text-white font-semibold">{title}</h3>
        <p className="text-gray-400 text-sm">{subtitle}</p>
      </div>
    </div>
  );

  // Clear cache
  const handleClearCache = () => {
    const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith('ourdm-cache-'));
    cacheKeys.forEach(key => localStorage.removeItem(key));
    updateSetting('cacheSize', 0);
    alert('✅ Cache cleared successfully!');
  };

  // Handle logout
  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('ourdm-auth');
      localStorage.removeItem('ourdm-session');
      onLogout();
    }
  };

  // PIN Setup
  const handlePINSetup = () => {
    if (pin.length < 4) {
      setPinError('PIN must be at least 4 digits');
      return;
    }
    if (pin !== confirmPin) {
      setPinError('PINs do not match');
      return;
    }
    updateSetting('appLockPIN', pin);
    updateSetting('appLock', true);
    setShowPINSetup(false);
    setPin('');
    setConfirmPin('');
    alert('✅ App Lock enabled!');
  };

  // Apply theme
  const applyTheme = (theme: string) => {
    updateSetting('appTheme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    const themes: Record<string, { bg: string; primary: string }> = {
      dark: { bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', primary: '#8b5cf6' },
      light: { bg: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)', primary: '#7c3aed' },
      purple: { bg: 'linear-gradient(135deg, #2d1b69 0%, #11001c 100%)', primary: '#a855f7' },
      ocean: { bg: 'linear-gradient(135deg, #0c2461 0%, #1e3799 100%)', primary: '#3b82f6' },
      sunset: { bg: 'linear-gradient(135deg, #c0392b 0%, #8e44ad 100%)', primary: '#f59e0b' },
      forest: { bg: 'linear-gradient(135deg, #1e3c22 0%, #2d5a2b 100%)', primary: '#22c55e' },
    };
    
    if (themes[theme]) {
      document.body.style.background = themes[theme].bg;
    }
  };

  // Render main settings list
  const renderMainList = () => (
    <div className="space-y-3">
      {/* Profile Section */}
      {currentUser && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-2xl p-4 flex items-center gap-4"
        >
          <div className="relative">
            <img
              src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.fullName}&background=8b5cf6&color=fff`}
              alt={currentUser.fullName}
              className="w-16 h-16 rounded-full object-cover border-2 border-violet-500"
            />
            <Camera className="absolute bottom-0 right-0 w-5 h-5 bg-violet-500 rounded-full p-1" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">{currentUser.fullName || currentUser.name || 'User'}</h3>
            <p className="text-gray-400">@{currentUser.username || 'username'}</p>
            <p className="text-gray-500 text-sm">{currentUser.bio || 'No bio yet'}</p>
          </div>
        </motion.div>
      )}

      {/* Account */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 rounded-2xl p-4 space-y-2"
      >
        <SectionHeader icon={User} title="Account" subtitle="Profile and privacy" />
        <SettingItem icon={Eye} label="Profile Photo Visibility" value={settings.profilePhotoVisibility} onClick={() => setActiveSection('profilePhoto')} />
        <SettingItem icon={Info} label="About Visibility" value={settings.aboutVisibility} onClick={() => setActiveSection('about')} />
        <SettingItem icon={UserX} label="Blocked Contacts" value={`${settings.blockedContacts.length} blocked`} onClick={() => setShowBlockedList(true)} />
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white/5 rounded-2xl p-4 space-y-2"
      >
        <SectionHeader icon={Shield} title="Security" subtitle="Lock and hide chats" />
        <SettingItem 
          icon={Lock} 
          label="App Lock" 
          toggle={{ 
            value: settings.appLock, 
            onChange: (v) => {
              if (v && !settings.appLockPIN) {
                setShowPINSetup(true);
              } else {
                updateSetting('appLock', v);
              }
            }
          }} 
        />
        <SettingItem icon={EyeOff} label="Hidden Chats" value={`${settings.hiddenChats.length} hidden`} onClick={() => setActiveSection('hiddenChats')} />
        <SettingItem icon={Lock} label="Locked Chats" value={`${settings.lockedChats.length} locked`} onClick={() => setActiveSection('lockedChats')} />
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 rounded-2xl p-4 space-y-2"
      >
        <SectionHeader icon={Bell} title="Notifications" subtitle="Sounds and alerts" />
        <SettingItem icon={Bell} label="Message Notifications" toggle={{ value: settings.messageNotifications, onChange: (v) => updateSetting('messageNotifications', v) }} />
        <SettingItem icon={Volume2} label="Notification Sound" toggle={{ value: settings.notificationSound, onChange: (v) => updateSetting('notificationSound', v) }} />
        <SettingItem icon={Smartphone} label="Vibration" toggle={{ value: settings.vibration, onChange: (v) => updateSetting('vibration', v) }} />
        <SettingItem icon={Users} label="Group Notifications" toggle={{ value: settings.groupNotifications, onChange: (v) => updateSetting('groupNotifications', v) }} />
        <SettingItem icon={Eye} label="Show Preview" value={settings.showNotificationPreview} onClick={() => setActiveSection('notificationPreview')} />
        <SettingItem icon={Phone} label="Call Ringtone" value={settings.callRingtone} onClick={() => setActiveSection('callRingtone')} />
        <SettingItem icon={MessageCircle} label="Message Sound" value={settings.messageSound} onClick={() => setActiveSection('messageSound')} />
      </motion.div>

      {/* Chats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white/5 rounded-2xl p-4 space-y-2"
      >
        <SectionHeader icon={MessageCircle} title="Chats" subtitle="Appearance and behavior" />
        <SettingItem icon={Star} label="Starred Messages" value={`${settings.starredMessages.length} messages`} onClick={() => setActiveSection('starred')} />
        <SettingItem icon={Archive} label="Archived Chats" value={`${settings.archivedChats.length} chats`} onClick={() => setActiveSection('archived')} />
        <SettingItem icon={Image} label="Chat Wallpaper" value={settings.chatWallpaper} onClick={() => setActiveSection('wallpaper')} />
        <SettingItem icon={Palette} label="Chat Theme" value={settings.chatTheme} onClick={() => setActiveSection('chatTheme')} />
        <SettingItem icon={MessageCircle} label="Bubble Style" value={settings.bubbleStyle} onClick={() => setActiveSection('bubbleStyle')} />
        <SettingItem icon={Type} label="Text Size" value={settings.textSize} onClick={() => setActiveSection('textSize')} />
        <SettingItem icon={Check} label="Enter to Send" toggle={{ value: settings.enterToSend, onChange: (v) => updateSetting('enterToSend', v) }} />
        <SettingItem icon={Archive} label="Auto-Archive Chats" toggle={{ value: settings.autoArchiveChats, onChange: (v) => updateSetting('autoArchiveChats', v) }} />
        <SettingItem icon={Archive} label="Keep Chats Archived" toggle={{ value: settings.keepChatsArchived, onChange: (v) => updateSetting('keepChatsArchived', v) }} />
      </motion.div>

      {/* Data & Storage */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/5 rounded-2xl p-4 space-y-2"
      >
        <SectionHeader icon={Database} title="Data & Storage" subtitle="Manage storage" />
        <SettingItem icon={Wifi} label="Network Usage" value={`${settings.networkUsage} MB`} onClick={() => setActiveSection('networkUsage')} />
        <SettingItem icon={Database} label="Storage Usage" value={`${settings.storageUsed} MB`} onClick={() => setActiveSection('storageUsage')} />
        <SettingItem icon={Image} label="Auto-Download Photos" value={settings.autoDownloadPhotos} onClick={() => setActiveSection('autoDownloadPhotos')} />
        <SettingItem icon={Download} label="Auto-Download Videos" value={settings.autoDownloadVideos} onClick={() => setActiveSection('autoDownloadVideos')} />
        <SettingItem icon={WifiOff} label="Low Data Mode" toggle={{ value: settings.lowDataMode, onChange: (v) => updateSetting('lowDataMode', v) }} />
        <SettingItem icon={Settings} label="Media Quality" value={settings.mediaQuality} onClick={() => setActiveSection('mediaQuality')} />
        <SettingItem icon={Download} label="Save to Gallery" toggle={{ value: settings.saveToGallery, onChange: (v) => updateSetting('saveToGallery', v) }} />
        <SettingItem icon={Trash2} label="Clear Cache" value={`${settings.cacheSize} MB`} onClick={handleClearCache} danger />
      </motion.div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white/5 rounded-2xl p-4 space-y-2"
      >
        <SectionHeader icon={Palette} title="Appearance" subtitle="Theme and display" />
        <SettingItem icon={Moon} label="Dark Mode" toggle={{ value: settings.darkMode, onChange: (v) => { updateSetting('darkMode', v); applyTheme(v ? 'dark' : 'light'); }}} />
        <SettingItem icon={Palette} label="App Theme" value={settings.appTheme} onClick={() => setActiveSection('appTheme')} />
        <SettingItem icon={Image} label="Wallpaper" value={settings.wallpaper} onClick={() => setActiveSection('appWallpaper')} />
        <SettingItem icon={Type} label="Font Size" value={settings.fontSize} onClick={() => setActiveSection('fontSize')} />
        <SettingItem icon={Settings} label="Display Mode" value={settings.displayMode} onClick={() => setActiveSection('displayMode')} />
      </motion.div>

      {/* Language & Region */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 rounded-2xl p-4 space-y-2"
      >
        <SectionHeader icon={Globe} title="Language & Region" subtitle="Language preferences" />
        <SettingItem icon={Globe} label="App Language" value={settings.appLanguage} onClick={() => setActiveSection('language')} />
        <SettingItem icon={Globe} label="Translation" toggle={{ value: settings.translationEnabled, onChange: (v) => updateSetting('translationEnabled', v) }} />
        <SettingItem icon={Clock} label="Time Format" value={settings.timeFormat === '12' ? '12-hour' : '24-hour'} onClick={() => setActiveSection('timeFormat')} />
      </motion.div>

      {/* Help & Support */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-white/5 rounded-2xl p-4 space-y-2"
      >
        <SectionHeader icon={HelpCircle} title="Help & Support" subtitle="Get help" />
        <SettingItem icon={HelpCircle} label="Help Center" onClick={() => window.open('https://help.ourdm.com', '_blank')} />
        <SettingItem icon={Mail} label="Contact Us" onClick={() => window.open('mailto:support@ourdm.com', '_blank')} />
        <SettingItem icon={FileText} label="Terms of Service" onClick={() => window.open('https://ourdm.com/terms', '_blank')} />
        <SettingItem icon={Shield} label="Privacy Policy" onClick={() => window.open('https://ourdm.com/privacy', '_blank')} />
        <SettingItem icon={Info} label="About OurDM" value="v2.0.0" onClick={() => setActiveSection('about-app')} />
        <SettingItem icon={Heart} label="Rate App" success onClick={() => alert('⭐ Thank you for rating!')} />
      </motion.div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-red-500/10 rounded-2xl p-4"
      >
        <SettingItem icon={LogOut} label="Logout" onClick={handleLogout} danger />
      </motion.div>

      {/* Made by */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="text-center py-6"
      >
        <p className="text-gray-500 text-sm">Made with ❤️ by Sameer Shah</p>
        <p className="text-gray-600 text-xs mt-1">OurDM v2.0.0</p>
      </motion.div>
    </div>
  );

  // Render sub-sections
  const renderSubSection = () => {
    switch (activeSection) {
      case 'profilePhoto':
        return (
          <div className="space-y-3">
            <h3 className="text-white font-semibold mb-4">Who can see your profile photo?</h3>
            {['everyone', 'friends', 'nobody'].map(opt => (
              <motion.button
                key={opt}
                whileTap={{ scale: 0.98 }}
                onClick={() => { updateSetting('profilePhotoVisibility', opt); setActiveSection(null); }}
                className={`w-full p-4 rounded-xl flex items-center justify-between ${
                  settings.profilePhotoVisibility === opt ? 'bg-violet-500/20 border border-violet-500' : 'bg-white/5'
                }`}
              >
                <span className="text-white capitalize">{opt}</span>
                {settings.profilePhotoVisibility === opt && <Check className="w-5 h-5 text-violet-400" />}
              </motion.button>
            ))}
          </div>
        );

      case 'about':
        return (
          <div className="space-y-3">
            <h3 className="text-white font-semibold mb-4">Who can see your about?</h3>
            {['everyone', 'friends', 'nobody'].map(opt => (
              <motion.button
                key={opt}
                whileTap={{ scale: 0.98 }}
                onClick={() => { updateSetting('aboutVisibility', opt); setActiveSection(null); }}
                className={`w-full p-4 rounded-xl flex items-center justify-between ${
                  settings.aboutVisibility === opt ? 'bg-violet-500/20 border border-violet-500' : 'bg-white/5'
                }`}
              >
                <span className="text-white capitalize">{opt}</span>
                {settings.aboutVisibility === opt && <Check className="w-5 h-5 text-violet-400" />}
              </motion.button>
            ))}
          </div>
        );

      case 'notificationPreview':
        return (
          <div className="space-y-3">
            <h3 className="text-white font-semibold mb-4">Notification Preview</h3>
            {[
              { value: 'always', label: 'Show message content' },
              { value: 'nameOnly', label: 'Show name only' },
              { value: 'never', label: 'Hide completely' }
            ].map(opt => (
              <motion.button
                key={opt.value}
                whileTap={{ scale: 0.98 }}
                onClick={() => { updateSetting('showNotificationPreview', opt.value); setActiveSection(null); }}
                className={`w-full p-4 rounded-xl flex items-center justify-between ${
                  settings.showNotificationPreview === opt.value ? 'bg-violet-500/20 border border-violet-500' : 'bg-white/5'
                }`}
              >
                <span className="text-white">{opt.label}</span>
                {settings.showNotificationPreview === opt.value && <Check className="w-5 h-5 text-violet-400" />}
              </motion.button>
            ))}
          </div>
        );

      case 'callRingtone':
        return (
          <div className="space-y-3">
            <h3 className="text-white font-semibold mb-4">Call Ringtone</h3>
            {['default', 'classic', 'modern', 'gentle', 'vibrant', 'silent'].map(tone => (
              <motion.button
                key={tone}
                whileTap={{ scale: 0.98 }}
                onClick={() => { updateSetting('callRingtone', tone); setActiveSection(null); }}
                className={`w-full p-4 rounded-xl flex items-center justify-between ${
                  settings.callRingtone === tone ? 'bg-violet-500/20 border border-violet-500' : 'bg-white/5'
                }`}
              >
                <span className="text-white capitalize">{tone}</span>
                {settings.callRingtone === tone && <Check className="w-5 h-5 text-violet-400" />}
              </motion.button>
            ))}
          </div>
        );

      case 'messageSound':
        return (
          <div className="space-y-3">
            <h3 className="text-white font-semibold mb-4">Message Sound</h3>
            {['default', 'pop', 'ding', 'chime', 'swoosh', 'silent'].map(sound => (
              <motion.button
                key={sound}
                whileTap={{ scale: 0.98 }}
                onClick={() => { updateSetting('messageSound', sound); setActiveSection(null); }}
                className={`w-full p-4 rounded-xl flex items-center justify-between ${
                  settings.messageSound === sound ? 'bg-violet-500/20 border border-violet-500' : 'bg-white/5'
                }`}
              >
                <span className="text-white capitalize">{sound}</span>
                {settings.messageSound === sound && <Check className="w-5 h-5 text-violet-400" />}
              </motion.button>
            ))}
          </div>
        );

      case 'chatTheme':
        return (
          <div className="space-y-3">
            <h3 className="text-white font-semibold mb-4">Chat Theme</h3>
            {[
              { value: 'violet', color: 'bg-violet-500' },
              { value: 'blue', color: 'bg-blue-500' },
              { value: 'green', color: 'bg-green-500' },
              { value: 'pink', color: 'bg-pink-500' },
              { value: 'orange', color: 'bg-orange-500' }
            ].map(theme => (
              <motion.button
                key={theme.value}
                whileTap={{ scale: 0.98 }}
                onClick={() => { updateSetting('chatTheme', theme.value); setActiveSection(null); }}
                className={`w-full p-4 rounded-xl flex items-center justify-between ${
                  settings.chatTheme === theme.value ? 'bg-violet-500/20 border border-violet-500' : 'bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full ${theme.color}`} />
                  <span className="text-white capitalize">{theme.value}</span>
                </div>
                {settings.chatTheme === theme.value && <Check className="w-5 h-5 text-violet-400" />}
              </motion.button>
            ))}
          </div>
        );

      case 'bubbleStyle':
        return (
          <div className="space-y-3">
            <h3 className="text-white font-semibold mb-4">Bubble Style</h3>
            {['rounded', 'sharp', 'minimal'].map(style => (
              <motion.button
                key={style}
                whileTap={{ scale: 0.98 }}
                onClick={() => { updateSetting('bubbleStyle', style); setActiveSection(null); }}
                className={`w-full p-4 rounded-xl flex items-center justify-between ${
                  settings.bubbleStyle === style ? 'bg-violet-500/20 border border-violet-500' : 'bg-white/5'
                }`}
              >
                <span className="text-white capitalize">{style}</span>
                {settings.bubbleStyle === style && <Check className="w-5 h-5 text-violet-400" />}
              </motion.button>
            ))}
          </div>
        );

      case 'textSize':
        return (
          <div className="space-y-3">
            <h3 className="text-white font-semibold mb-4">Text Size</h3>
            {['small', 'medium', 'large'].map(size => (
              <motion.button
                key={size}
                whileTap={{ scale: 0.98 }}
                onClick={() => { updateSetting('textSize', size); setActiveSection(null); }}
                className={`w-full p-4 rounded-xl flex items-center justify-between ${
                  settings.textSize === size ? 'bg-violet-500/20 border border-violet-500' : 'bg-white/5'
                }`}
              >
                <span className={`text-white capitalize ${size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : ''}`}>{size}</span>
                {settings.textSize === size && <Check className="w-5 h-5 text-violet-400" />}
              </motion.button>
            ))}
          </div>
        );

      case 'autoDownloadPhotos':
      case 'autoDownloadVideos':
        return (
          <div className="space-y-3">
            <h3 className="text-white font-semibold mb-4">Auto-Download {activeSection === 'autoDownloadPhotos' ? 'Photos' : 'Videos'}</h3>
            {[
              { value: 'always', label: 'Always' },
              { value: 'wifi', label: 'WiFi Only' },
              { value: 'never', label: 'Never' }
            ].map(opt => (
              <motion.button
                key={opt.value}
                whileTap={{ scale: 0.98 }}
                onClick={() => { updateSetting(activeSection, opt.value); setActiveSection(null); }}
                className={`w-full p-4 rounded-xl flex items-center justify-between ${
                  settings[activeSection] === opt.value ? 'bg-violet-500/20 border border-violet-500' : 'bg-white/5'
                }`}
              >
                <span className="text-white">{opt.label}</span>
                {settings[activeSection] === opt.value && <Check className="w-5 h-5 text-violet-400" />}
              </motion.button>
            ))}
          </div>
        );

      case 'mediaQuality':
        return (
          <div className="space-y-3">
            <h3 className="text-white font-semibold mb-4">Media Quality</h3>
            {['auto', 'high', 'medium', 'low'].map(quality => (
              <motion.button
                key={quality}
                whileTap={{ scale: 0.98 }}
                onClick={() => { updateSetting('mediaQuality', quality); setActiveSection(null); }}
                className={`w-full p-4 rounded-xl flex items-center justify-between ${
                  settings.mediaQuality === quality ? 'bg-violet-500/20 border border-violet-500' : 'bg-white/5'
                }`}
              >
                <span className="text-white capitalize">{quality}</span>
                {settings.mediaQuality === quality && <Check className="w-5 h-5 text-violet-400" />}
              </motion.button>
            ))}
          </div>
        );

      case 'appTheme':
        return (
          <div className="space-y-3">
            <h3 className="text-white font-semibold mb-4">App Theme</h3>
            {[
              { value: 'dark', label: '🌙 Dark', color: 'bg-gray-800' },
              { value: 'light', label: '☀️ Light', color: 'bg-gray-200' },
              { value: 'purple', label: '💜 Purple', color: 'bg-purple-600' },
              { value: 'ocean', label: '💙 Ocean', color: 'bg-blue-600' },
              { value: 'sunset', label: '🌅 Sunset', color: 'bg-orange-500' },
              { value: 'forest', label: '🌲 Forest', color: 'bg-green-600' }
            ].map(theme => (
              <motion.button
                key={theme.value}
                whileTap={{ scale: 0.98 }}
                onClick={() => { applyTheme(theme.value); setActiveSection(null); }}
                className={`w-full p-4 rounded-xl flex items-center justify-between ${
                  settings.appTheme === theme.value ? 'bg-violet-500/20 border border-violet-500' : 'bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full ${theme.color}`} />
                  <span className="text-white">{theme.label}</span>
                </div>
                {settings.appTheme === theme.value && <Check className="w-5 h-5 text-violet-400" />}
              </motion.button>
            ))}
          </div>
        );

      case 'fontSize':
        return (
          <div className="space-y-3">
            <h3 className="text-white font-semibold mb-4">Font Size</h3>
            {['small', 'medium', 'large'].map(size => (
              <motion.button
                key={size}
                whileTap={{ scale: 0.98 }}
                onClick={() => { updateSetting('fontSize', size); setActiveSection(null); }}
                className={`w-full p-4 rounded-xl flex items-center justify-between ${
                  settings.fontSize === size ? 'bg-violet-500/20 border border-violet-500' : 'bg-white/5'
                }`}
              >
                <span className="text-white capitalize">{size}</span>
                {settings.fontSize === size && <Check className="w-5 h-5 text-violet-400" />}
              </motion.button>
            ))}
          </div>
        );

      case 'displayMode':
        return (
          <div className="space-y-3">
            <h3 className="text-white font-semibold mb-4">Display Mode</h3>
            {['comfortable', 'compact'].map(mode => (
              <motion.button
                key={mode}
                whileTap={{ scale: 0.98 }}
                onClick={() => { updateSetting('displayMode', mode); setActiveSection(null); }}
                className={`w-full p-4 rounded-xl flex items-center justify-between ${
                  settings.displayMode === mode ? 'bg-violet-500/20 border border-violet-500' : 'bg-white/5'
                }`}
              >
                <span className="text-white capitalize">{mode}</span>
                {settings.displayMode === mode && <Check className="w-5 h-5 text-violet-400" />}
              </motion.button>
            ))}
          </div>
        );

      case 'language':
        return (
          <div className="space-y-3">
            <h3 className="text-white font-semibold mb-4">App Language</h3>
            {['English', 'हिंदी', 'Español', 'Français', 'Deutsch', '中文', '日本語', '한국어', 'Português', 'العربية'].map(lang => (
              <motion.button
                key={lang}
                whileTap={{ scale: 0.98 }}
                onClick={() => { updateSetting('appLanguage', lang); setActiveSection(null); }}
                className={`w-full p-4 rounded-xl flex items-center justify-between ${
                  settings.appLanguage === lang ? 'bg-violet-500/20 border border-violet-500' : 'bg-white/5'
                }`}
              >
                <span className="text-white">{lang}</span>
                {settings.appLanguage === lang && <Check className="w-5 h-5 text-violet-400" />}
              </motion.button>
            ))}
          </div>
        );

      case 'timeFormat':
        return (
          <div className="space-y-3">
            <h3 className="text-white font-semibold mb-4">Time Format</h3>
            {[
              { value: '12', label: '12-hour (1:30 PM)' },
              { value: '24', label: '24-hour (13:30)' }
            ].map(opt => (
              <motion.button
                key={opt.value}
                whileTap={{ scale: 0.98 }}
                onClick={() => { updateSetting('timeFormat', opt.value); setActiveSection(null); }}
                className={`w-full p-4 rounded-xl flex items-center justify-between ${
                  settings.timeFormat === opt.value ? 'bg-violet-500/20 border border-violet-500' : 'bg-white/5'
                }`}
              >
                <span className="text-white">{opt.label}</span>
                {settings.timeFormat === opt.value && <Check className="w-5 h-5 text-violet-400" />}
              </motion.button>
            ))}
          </div>
        );

      case 'about-app':
        return (
          <div className="space-y-4 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl mx-auto flex items-center justify-center">
              <MessageCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">OurDM</h2>
            <p className="text-gray-400">Version 2.0.0</p>
            <div className="bg-white/5 rounded-xl p-4 space-y-2 text-left">
              <p className="text-gray-300">• 200+ Features</p>
              <p className="text-gray-300">• Real-time messaging</p>
              <p className="text-gray-300">• HD Video/Audio calls</p>
              <p className="text-gray-300">• Stories with comments</p>
              <p className="text-gray-300">• End-to-end encryption</p>
            </div>
            <p className="text-gray-500 text-sm">Made with ❤️ by Sameer Shah</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-white/10">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={activeSection ? () => setActiveSection(null) : onBack}
          className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </motion.button>
        <h1 className="text-xl font-bold text-white">
          {activeSection ? 'Settings' : 'Settings'}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {activeSection ? (
            <motion.div
              key="sub"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {renderSubSection()}
            </motion.div>
          ) : (
            <motion.div
              key="main"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {renderMainList()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* PIN Setup Modal */}
      <AnimatePresence>
        {showPINSetup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPINSetup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Set App Lock PIN</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm">Enter PIN (4+ digits)</label>
                  <input
                    type="password"
                    value={pin}
                    onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                    className="w-full bg-white/10 text-white p-3 rounded-xl mt-1 text-center text-2xl tracking-widest"
                    placeholder="••••"
                  />
                </div>
                
                <div>
                  <label className="text-gray-400 text-sm">Confirm PIN</label>
                  <input
                    type="password"
                    value={confirmPin}
                    onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                    className="w-full bg-white/10 text-white p-3 rounded-xl mt-1 text-center text-2xl tracking-widest"
                    placeholder="••••"
                  />
                </div>

                {pinError && (
                  <p className="text-red-400 text-sm text-center">{pinError}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowPINSetup(false); setPin(''); setConfirmPin(''); setPinError(''); }}
                    className="flex-1 py-3 rounded-xl bg-white/10 text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePINSetup}
                    className="flex-1 py-3 rounded-xl bg-violet-500 text-white font-semibold"
                  >
                    Set PIN
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blocked Contacts Modal */}
      <AnimatePresence>
        {showBlockedList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBlockedList(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Blocked Contacts</h3>
              
              {settings.blockedContacts.length === 0 ? (
                <div className="text-center py-8">
                  <UserX className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">No blocked contacts</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {settings.blockedContacts.map((id: string, index: number) => (
                    <div key={id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <span className="text-white">User {index + 1}</span>
                      <button
                        onClick={() => {
                          const newBlocked = settings.blockedContacts.filter((bid: string) => bid !== id);
                          updateSetting('blockedContacts', newBlocked);
                        }}
                        className="text-red-400 text-sm"
                      >
                        Unblock
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowBlockedList(false)}
                className="w-full mt-4 py-3 rounded-xl bg-white/10 text-white"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsScreenNew;
