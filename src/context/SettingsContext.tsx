import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Settings Types
interface AppSettings {
  // Privacy
  profilePhotoVisibility: 'everyone' | 'friends' | 'nobody';
  aboutVisibility: 'everyone' | 'friends' | 'nobody';
  lastSeenVisibility: 'everyone' | 'friends' | 'nobody';
  readReceipts: boolean;
  blockedContacts: string[];
  
  // Security
  appLock: boolean;
  appLockPIN: string;
  lockTimeout: '0' | '1' | '5' | '30';
  
  // Hidden & Locked Chats
  hiddenChats: string[];
  lockedChats: string[];
  hiddenChatsPIN: string;
  
  // Notifications
  messageNotifications: boolean;
  notificationSound: boolean;
  vibration: boolean;
  groupNotifications: boolean;
  showNotificationPreview: 'always' | 'nameOnly' | 'never';
  callRingtone: string;
  messageSound: string;
  
  // Chats
  chatWallpaper: string;
  chatTheme: 'violet' | 'blue' | 'green' | 'pink' | 'orange';
  bubbleStyle: 'rounded' | 'sharp' | 'minimal';
  textSize: 'small' | 'medium' | 'large';
  enterToSend: boolean;
  autoArchiveChats: boolean;
  keepChatsArchived: boolean;
  
  // Data & Storage
  autoDownloadPhotos: 'always' | 'wifi' | 'never';
  autoDownloadVideos: 'always' | 'wifi' | 'never';
  lowDataMode: boolean;
  mediaQuality: 'auto' | 'high' | 'medium' | 'low';
  saveToGallery: boolean;
  
  // Appearance
  darkMode: boolean;
  appTheme: 'dark' | 'light' | 'purple' | 'ocean' | 'sunset' | 'forest';
  wallpaper: string;
  fontSize: 'small' | 'medium' | 'large';
  displayMode: 'comfortable' | 'compact';
  
  // Language
  appLanguage: string;
  translationEnabled: boolean;
  timeFormat: '12' | '24';
  
  // Friend Nicknames (local only)
  friendNicknames: Record<string, string>;
  
  // Storage stats
  storageUsed: number;
  cacheSize: number;
  networkUsage: number;
  lastBackup: string;
}

interface SettingsContextType {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  
  // Chat management
  hideChat: (chatId: string) => void;
  unhideChat: (chatId: string) => void;
  lockChat: (chatId: string) => void;
  unlockChat: (chatId: string) => void;
  isChatHidden: (chatId: string) => boolean;
  isChatLocked: (chatId: string) => boolean;
  verifyPIN: (pin: string) => boolean;
  setPIN: (pin: string) => void;
  
  // Friend nicknames
  setFriendNickname: (friendId: string, nickname: string) => void;
  getFriendNickname: (friendId: string) => string | null;
  removeFriendNickname: (friendId: string) => void;
  
  // Block management
  blockContact: (userId: string) => void;
  unblockContact: (userId: string) => void;
  isBlocked: (userId: string) => boolean;
  
  // Storage management
  clearCache: () => Promise<void>;
  getStorageStats: () => { used: number; cache: number; network: number };
  
  // Logout
  logout: () => void;
}

const defaultSettings: AppSettings = {
  // Privacy
  profilePhotoVisibility: 'everyone',
  aboutVisibility: 'everyone',
  lastSeenVisibility: 'everyone',
  readReceipts: true,
  blockedContacts: [],
  
  // Security
  appLock: false,
  appLockPIN: '',
  lockTimeout: '1',
  
  // Hidden & Locked Chats
  hiddenChats: [],
  lockedChats: [],
  hiddenChatsPIN: '',
  
  // Notifications
  messageNotifications: true,
  notificationSound: true,
  vibration: true,
  groupNotifications: true,
  showNotificationPreview: 'always',
  callRingtone: 'default',
  messageSound: 'default',
  
  // Chats
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
  
  // Appearance
  darkMode: true,
  appTheme: 'dark',
  wallpaper: 'default',
  fontSize: 'medium',
  displayMode: 'comfortable',
  
  // Language
  appLanguage: 'English',
  translationEnabled: false,
  timeFormat: '12',
  
  // Friend Nicknames
  friendNicknames: {},
  
  // Storage stats
  storageUsed: 0,
  cacheSize: 0,
  networkUsage: 0,
  lastBackup: '',
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
  onLogout: () => void;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children, onLogout }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('ourdm-settings');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ourdm-settings', JSON.stringify(settings));
  }, [settings]);

  // Update single setting
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Hide Chat
  const hideChat = (chatId: string) => {
    setSettings(prev => ({
      ...prev,
      hiddenChats: [...prev.hiddenChats.filter(id => id !== chatId), chatId]
    }));
  };

  const unhideChat = (chatId: string) => {
    setSettings(prev => ({
      ...prev,
      hiddenChats: prev.hiddenChats.filter(id => id !== chatId)
    }));
  };

  const isChatHidden = (chatId: string) => {
    return settings.hiddenChats.includes(chatId);
  };

  // Lock Chat
  const lockChat = (chatId: string) => {
    setSettings(prev => ({
      ...prev,
      lockedChats: [...prev.lockedChats.filter(id => id !== chatId), chatId]
    }));
  };

  const unlockChat = (chatId: string) => {
    setSettings(prev => ({
      ...prev,
      lockedChats: prev.lockedChats.filter(id => id !== chatId)
    }));
  };

  const isChatLocked = (chatId: string) => {
    return settings.lockedChats.includes(chatId);
  };

  // PIN verification
  const verifyPIN = (pin: string) => {
    return settings.hiddenChatsPIN === pin || settings.appLockPIN === pin;
  };

  const setPIN = (pin: string) => {
    setSettings(prev => ({
      ...prev,
      hiddenChatsPIN: pin,
      appLockPIN: pin
    }));
  };

  // Friend nicknames (local only - sirf tumko dikhega)
  const setFriendNickname = (friendId: string, nickname: string) => {
    setSettings(prev => ({
      ...prev,
      friendNicknames: {
        ...prev.friendNicknames,
        [friendId]: nickname
      }
    }));
  };

  const getFriendNickname = (friendId: string) => {
    return settings.friendNicknames[friendId] || null;
  };

  const removeFriendNickname = (friendId: string) => {
    setSettings(prev => {
      const newNicknames = { ...prev.friendNicknames };
      delete newNicknames[friendId];
      return { ...prev, friendNicknames: newNicknames };
    });
  };

  // Block management
  const blockContact = (userId: string) => {
    setSettings(prev => ({
      ...prev,
      blockedContacts: [...prev.blockedContacts.filter(id => id !== userId), userId]
    }));
  };

  const unblockContact = (userId: string) => {
    setSettings(prev => ({
      ...prev,
      blockedContacts: prev.blockedContacts.filter(id => id !== userId)
    }));
  };

  const isBlocked = (userId: string) => {
    return settings.blockedContacts.includes(userId);
  };

  // Storage management
  const clearCache = async () => {
    try {
      // Clear cached data
      const cacheKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('ourdm-cache-')
      );
      cacheKeys.forEach(key => localStorage.removeItem(key));
      
      // Update cache size
      setSettings(prev => ({ ...prev, cacheSize: 0 }));
      
      // Show notification
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const getStorageStats = () => {
    return {
      used: settings.storageUsed,
      cache: settings.cacheSize,
      network: settings.networkUsage
    };
  };

  // Logout
  const logout = () => {
    // Clear auth data but keep some settings
    localStorage.removeItem('ourdm-auth');
    localStorage.removeItem('ourdm-session');
    onLogout();
  };

  const value: SettingsContextType = {
    settings,
    updateSetting,
    hideChat,
    unhideChat,
    lockChat,
    unlockChat,
    isChatHidden,
    isChatLocked,
    verifyPIN,
    setPIN,
    setFriendNickname,
    getFriendNickname,
    removeFriendNickname,
    blockContact,
    unblockContact,
    isBlocked,
    clearCache,
    getStorageStats,
    logout,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
