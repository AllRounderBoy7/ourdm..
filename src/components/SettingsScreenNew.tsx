import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, User, Lock, Bell, MessageCircle, Database, Cloud,
  Palette, Globe, HelpCircle, Shield, Eye, Volume2,
  Download, Moon, Sun, Phone, Video, Smartphone,
  LogOut, Trash2, Archive, FileText, Settings as SettingsIcon,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsScreenNew: React.FC = () => {
  const { setCurrentScreen, currentUser, logout } = useApp();
  const [currentSection, setCurrentSection] = useState<string | null>(null);

  // Settings state
  const [settings, setSettings] = useState({
    // Account
    twoFactorAuth: false,
    profileVisibility: 'everyone',
    
    // Privacy
    lastSeen: 'everyone',
    profilePhoto: 'everyone',
    about: 'everyone',
    readReceipts: true,
    onlineStatus: true,
    chatLock: false,
    chatLockPin: '',
    
    // Notifications
    messageNotifications: true,
    callNotifications: true,
    groupNotifications: true,
    notificationSound: true,
    vibration: true,
    inAppSounds: true,
    
    // Chats
    enterToSend: false,
    archiveChats: true,
    keepArchived: false,
    mediaAutoDownload: 'wifi',
    
    // Appearance
    theme: 'system',
    fontSize: 'medium',
    wallpaper: 'default',
    
    // Data
    autoDownloadPhotos: true,
    autoDownloadVideos: false,
    autoDownloadDocuments: false,
    dataUsageTracking: true,
    
    // Backup
    autoBackup: true,
    backupFrequency: 'daily',
    includeVideos: false,
    
    // Language
    language: 'en',
    
    // Other
    contactsSync: true,
    locationSharing: false,
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  const sections = [
    { id: 'account', name: 'Account', icon: User },
    { id: 'privacy', name: 'Privacy & Security', icon: Lock },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'chats', name: 'Chats', icon: MessageCircle },
    { id: 'data', name: 'Data & Storage', icon: Database },
    { id: 'backup', name: 'Backup', icon: Cloud },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'language', name: 'Language', icon: Globe },
    { id: 'help', name: 'Help & Support', icon: HelpCircle },
  ];

  const renderMainSettings = () => (
    <div className="flex-1 overflow-y-auto pb-20">
      {/* Profile Section */}
      <div className="bg-gradient-to-br from-violet-600 to-purple-600 p-6 mb-4">
        <div className="flex items-center gap-4">
          <img 
            src={currentUser?.avatar} 
            alt={currentUser?.username}
            className="w-20 h-20 rounded-full border-4 border-white/20"
          />
          <div className="flex-1 text-white">
            <h2 className="text-xl font-bold">@{currentUser?.username}</h2>
            <p className="text-white/80 text-sm">{currentUser?.bio || 'Hey there! I am using OurDM'}</p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="px-4 space-y-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <motion.button
              key={section.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentSection(section.id)}
              className="w-full flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                <Icon size={20} className="text-white" />
              </div>
              <span className="flex-1 text-left font-medium text-gray-800">{section.name}</span>
              <ArrowLeft size={20} className="text-gray-400 rotate-180" />
            </motion.button>
          );
        })}

        {/* Logout Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center gap-4 p-4 bg-red-50 rounded-xl shadow-sm hover:shadow-md transition-all mt-4"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
            <LogOut size={20} className="text-white" />
          </div>
          <span className="flex-1 text-left font-medium text-red-600">Logout</span>
        </motion.button>
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Account Settings</h3>
        
        <SettingItem
          icon={Shield}
          label="Two-Factor Authentication"
          value={settings.twoFactorAuth}
          type="toggle"
          onChange={(val) => updateSetting('twoFactorAuth', val)}
        />
        
        <SettingItem
          icon={Eye}
          label="Profile Visibility"
          value={settings.profileVisibility}
          type="select"
          options={[
            { label: 'Everyone', value: 'everyone' },
            { label: 'Friends', value: 'friends' },
            { label: 'Nobody', value: 'nobody' },
          ]}
          onChange={(val) => updateSetting('profileVisibility', val)}
        />

        <SettingItem
          icon={User}
          label="Edit Profile"
          type="button"
          onClick={() => setCurrentScreen('profile')}
        />

        <SettingItem
          icon={Trash2}
          label="Delete Account"
          type="button"
          onClick={() => alert('Account deletion feature - Coming soon!')}
          danger
        />
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Privacy & Security</h3>
        
        <SettingItem
          icon={Eye}
          label="Last Seen"
          value={settings.lastSeen}
          type="select"
          options={[
            { label: 'Everyone', value: 'everyone' },
            { label: 'Friends', value: 'friends' },
            { label: 'Nobody', value: 'nobody' },
          ]}
          onChange={(val) => updateSetting('lastSeen', val)}
        />

        <SettingItem
          icon={User}
          label="Profile Photo"
          value={settings.profilePhoto}
          type="select"
          options={[
            { label: 'Everyone', value: 'everyone' },
            { label: 'Friends', value: 'friends' },
            { label: 'Nobody', value: 'nobody' },
          ]}
          onChange={(val) => updateSetting('profilePhoto', val)}
        />

        <SettingItem
          icon={FileText}
          label="About"
          value={settings.about}
          type="select"
          options={[
            { label: 'Everyone', value: 'everyone' },
            { label: 'Friends', value: 'friends' },
            { label: 'Nobody', value: 'nobody' },
          ]}
          onChange={(val) => updateSetting('about', val)}
        />

        <SettingItem
          icon={CheckCircle2}
          label="Read Receipts"
          value={settings.readReceipts}
          type="toggle"
          onChange={(val) => updateSetting('readReceipts', val)}
        />

        <SettingItem
          icon={Smartphone}
          label="Online Status"
          value={settings.onlineStatus}
          type="toggle"
          onChange={(val) => updateSetting('onlineStatus', val)}
        />

        <SettingItem
          icon={Lock}
          label="Chat Lock"
          value={settings.chatLock}
          type="toggle"
          onChange={(val) => updateSetting('chatLock', val)}
          description="Lock chats with PIN"
        />

        {settings.chatLock && (
          <div className="pl-14">
            <input
              type="password"
              placeholder="Enter 4-digit PIN"
              maxLength={4}
              value={settings.chatLockPin}
              onChange={(e) => updateSetting('chatLockPin', e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg"
            />
          </div>
        )}

        <SettingItem
          icon={Archive}
          label="Blocked Contacts"
          type="button"
          onClick={() => alert('Blocked contacts - Coming soon!')}
        />
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Notifications</h3>
        
        <SettingItem
          icon={Bell}
          label="Message Notifications"
          value={settings.messageNotifications}
          type="toggle"
          onChange={(val) => updateSetting('messageNotifications', val)}
        />

        <SettingItem
          icon={Phone}
          label="Call Notifications"
          value={settings.callNotifications}
          type="toggle"
          onChange={(val) => updateSetting('callNotifications', val)}
        />

        <SettingItem
          icon={MessageCircle}
          label="Group Notifications"
          value={settings.groupNotifications}
          type="toggle"
          onChange={(val) => updateSetting('groupNotifications', val)}
        />

        <SettingItem
          icon={Volume2}
          label="Notification Sound"
          value={settings.notificationSound}
          type="toggle"
          onChange={(val) => updateSetting('notificationSound', val)}
        />

        <SettingItem
          icon={Smartphone}
          label="Vibration"
          value={settings.vibration}
          type="toggle"
          onChange={(val) => updateSetting('vibration', val)}
        />

        <SettingItem
          icon={Volume2}
          label="In-App Sounds"
          value={settings.inAppSounds}
          type="toggle"
          onChange={(val) => updateSetting('inAppSounds', val)}
        />
      </div>
    </div>
  );

  const renderChatsSettings = () => (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Chat Settings</h3>
        
        <SettingItem
          icon={MessageCircle}
          label="Enter to Send"
          value={settings.enterToSend}
          type="toggle"
          onChange={(val) => updateSetting('enterToSend', val)}
          description="Press Enter to send message"
        />

        <SettingItem
          icon={Archive}
          label="Archive Chats"
          value={settings.archiveChats}
          type="toggle"
          onChange={(val) => updateSetting('archiveChats', val)}
        />

        <SettingItem
          icon={Archive}
          label="Keep Chats Archived"
          value={settings.keepArchived}
          type="toggle"
          onChange={(val) => updateSetting('keepArchived', val)}
          description="Archived chats stay archived when you receive a new message"
        />

        <SettingItem
          icon={Download}
          label="Media Auto-Download"
          value={settings.mediaAutoDownload}
          type="select"
          options={[
            { label: 'Never', value: 'never' },
            { label: 'WiFi Only', value: 'wifi' },
            { label: 'Always', value: 'always' },
          ]}
          onChange={(val) => updateSetting('mediaAutoDownload', val)}
        />
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Data & Storage</h3>
        
        <SettingItem
          icon={Download}
          label="Auto-Download Photos"
          value={settings.autoDownloadPhotos}
          type="toggle"
          onChange={(val) => updateSetting('autoDownloadPhotos', val)}
        />

        <SettingItem
          icon={Video}
          label="Auto-Download Videos"
          value={settings.autoDownloadVideos}
          type="toggle"
          onChange={(val) => updateSetting('autoDownloadVideos', val)}
        />

        <SettingItem
          icon={FileText}
          label="Auto-Download Documents"
          value={settings.autoDownloadDocuments}
          type="toggle"
          onChange={(val) => updateSetting('autoDownloadDocuments', val)}
        />

        <SettingItem
          icon={Database}
          label="Data Usage Tracking"
          value={settings.dataUsageTracking}
          type="toggle"
          onChange={(val) => updateSetting('dataUsageTracking', val)}
        />

        <SettingItem
          icon={Trash2}
          label="Clear Cache"
          type="button"
          onClick={() => alert('Cache cleared!')}
        />
      </div>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Backup</h3>
        
        <SettingItem
          icon={Cloud}
          label="Auto Backup"
          value={settings.autoBackup}
          type="toggle"
          onChange={(val) => updateSetting('autoBackup', val)}
        />

        {settings.autoBackup && (
          <>
            <SettingItem
              icon={Cloud}
              label="Backup Frequency"
              value={settings.backupFrequency}
              type="select"
              options={[
                { label: 'Daily', value: 'daily' },
                { label: 'Weekly', value: 'weekly' },
                { label: 'Monthly', value: 'monthly' },
              ]}
              onChange={(val) => updateSetting('backupFrequency', val)}
            />

            <SettingItem
              icon={Video}
              label="Include Videos"
              value={settings.includeVideos}
              type="toggle"
              onChange={(val) => updateSetting('includeVideos', val)}
            />
          </>
        )}

        <SettingItem
          icon={Cloud}
          label="Backup Now"
          type="button"
          onClick={() => alert('Backup started!')}
        />
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Appearance</h3>
        
        <SettingItem
          icon={settings.theme === 'dark' ? Moon : Sun}
          label="Theme"
          value={settings.theme}
          type="select"
          options={[
            { label: 'System', value: 'system' },
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' },
          ]}
          onChange={(val) => updateSetting('theme', val)}
        />

        <SettingItem
          icon={FileText}
          label="Font Size"
          value={settings.fontSize}
          type="select"
          options={[
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' },
          ]}
          onChange={(val) => updateSetting('fontSize', val)}
        />

        <SettingItem
          icon={Palette}
          label="Chat Wallpaper"
          type="button"
          onClick={() => alert('Wallpaper selector - Coming soon!')}
        />
      </div>
    </div>
  );

  const renderLanguageSettings = () => (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Language & Region</h3>
        
        <SettingItem
          icon={Globe}
          label="App Language"
          value={settings.language}
          type="select"
          options={[
            { label: 'English', value: 'en' },
            { label: 'Hindi', value: 'hi' },
            { label: 'Spanish', value: 'es' },
            { label: 'French', value: 'fr' },
          ]}
          onChange={(val) => updateSetting('language', val)}
        />
      </div>
    </div>
  );

  const renderHelpSettings = () => (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Help & Support</h3>
        
        <SettingItem
          icon={HelpCircle}
          label="FAQ"
          type="button"
          onClick={() => alert('FAQ - Coming soon!')}
        />

        <SettingItem
          icon={MessageCircle}
          label="Contact Support"
          type="button"
          onClick={() => alert('Contact: support@ourdm.com')}
        />

        <SettingItem
          icon={FileText}
          label="Privacy Policy"
          type="button"
          onClick={() => alert('Privacy Policy - Coming soon!')}
        />

        <SettingItem
          icon={FileText}
          label="Terms of Service"
          type="button"
          onClick={() => alert('Terms of Service - Coming soon!')}
        />

        <SettingItem
          icon={SettingsIcon}
          label="App Version"
          type="info"
          info="1.0.0"
        />
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-violet-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-4 flex items-center gap-3 shadow-lg">
        <button
          onClick={() => currentSection ? setCurrentSection(null) : setCurrentScreen('chats')}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">
          {currentSection ? sections.find(s => s.id === currentSection)?.name : 'Settings'}
        </h1>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {!currentSection && (
          <motion.div
            key="main"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 overflow-hidden"
          >
            {renderMainSettings()}
          </motion.div>
        )}

        {currentSection === 'account' && (
          <motion.div
            key="account"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 overflow-hidden"
          >
            {renderAccountSettings()}
          </motion.div>
        )}

        {currentSection === 'privacy' && (
          <motion.div
            key="privacy"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 overflow-hidden"
          >
            {renderPrivacySettings()}
          </motion.div>
        )}

        {currentSection === 'notifications' && (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 overflow-hidden"
          >
            {renderNotificationSettings()}
          </motion.div>
        )}

        {currentSection === 'chats' && (
          <motion.div
            key="chats"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 overflow-hidden"
          >
            {renderChatsSettings()}
          </motion.div>
        )}

        {currentSection === 'data' && (
          <motion.div
            key="data"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 overflow-hidden"
          >
            {renderDataSettings()}
          </motion.div>
        )}

        {currentSection === 'backup' && (
          <motion.div
            key="backup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 overflow-hidden"
          >
            {renderBackupSettings()}
          </motion.div>
        )}

        {currentSection === 'appearance' && (
          <motion.div
            key="appearance"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 overflow-hidden"
          >
            {renderAppearanceSettings()}
          </motion.div>
        )}

        {currentSection === 'language' && (
          <motion.div
            key="language"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 overflow-hidden"
          >
            {renderLanguageSettings()}
          </motion.div>
        )}

        {currentSection === 'help' && (
          <motion.div
            key="help"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 overflow-hidden"
          >
            {renderHelpSettings()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Reusable Setting Item Component
const SettingItem: React.FC<{
  icon: any;
  label: string;
  value?: any;
  type: 'toggle' | 'select' | 'button' | 'info';
  options?: { label: string; value: string }[];
  onChange?: (value: any) => void;
  onClick?: () => void;
  description?: string;
  danger?: boolean;
  info?: string;
}> = ({ icon: Icon, label, value, type, options, onChange, onClick, description, danger, info }) => {
  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm ${danger ? 'border border-red-200' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full ${danger ? 'bg-red-100' : 'bg-violet-100'} flex items-center justify-center flex-shrink-0`}>
          <Icon size={20} className={danger ? 'text-red-600' : 'text-violet-600'} />
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-800">{label}</div>
          {description && <div className="text-xs text-gray-500 mt-0.5">{description}</div>}
        </div>

        {type === 'toggle' && (
          <button
            onClick={() => onChange?.(!value)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              value ? 'bg-gradient-to-r from-violet-500 to-purple-500' : 'bg-gray-300'
            }`}
          >
            <motion.div
              className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow"
              animate={{ x: value ? 24 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        )}

        {type === 'select' && options && (
          <select
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white"
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}

        {type === 'button' && (
          <button
            onClick={onClick}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
              danger 
                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                : 'bg-violet-50 text-violet-600 hover:bg-violet-100'
            } transition-colors`}
          >
            Open
          </button>
        )}

        {type === 'info' && (
          <span className="text-sm text-gray-500">{info}</span>
        )}
      </div>
    </div>
  );
};
