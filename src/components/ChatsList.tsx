import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Phone, Search, MoreVertical, Pin, Archive,
  Bell, BellOff, Users, Settings, User, LogOut, Plus, Camera,
  Check, CheckCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { Chat, User as UserType } from '../types';

export const ChatsList: React.FC = () => {
  const {
    currentUser,
    users,
    chats,
    stories,
    selectChat,
    setCurrentScreen,
    logout,
    togglePin,
    toggleMute,
    toggleArchive,
    onlineUsers,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [selectedChatMenu, setSelectedChatMenu] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'groups' | 'archived'>('all');

  const filteredChats = chats.filter(chat => {
    if (activeTab === 'archived') return chat.isArchived;
    if (activeTab === 'groups') return chat.type === 'group';
    return !chat.isArchived;
  });

  const searchedChats = filteredChats.filter(chat => {
    const chatName = getChatName(chat);
    return chatName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const sortedChats = [...searchedChats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    const aTime = a.lastMessage?.timestamp.getTime() || 0;
    const bTime = b.lastMessage?.timestamp.getTime() || 0;
    return bTime - aTime;
  });

  function getChatName(chat: Chat): string {
    if (chat.type === 'group') return chat.name || 'Group Chat';
    const otherUserId = chat.participants.find(id => id !== currentUser?.id);
    const otherUser = users.find(u => u.id === otherUserId);
    return otherUser?.name || otherUser?.username || 'Unknown User';
  }

  function getChatAvatar(chat: Chat): string {
    if (chat.type === 'group') return chat.avatar || '';
    const otherUserId = chat.participants.find(id => id !== currentUser?.id);
    const otherUser = users.find(u => u.id === otherUserId);
    return otherUser?.avatar || '';
  }

  function getOtherUser(chat: Chat): UserType | undefined {
    const otherUserId = chat.participants.find(id => id !== currentUser?.id);
    return users.find(u => u.id === otherUserId);
  }

  function getMessageStatus(chat: Chat) {
    if (!chat.lastMessage || chat.lastMessage.senderId !== currentUser?.id) return null;
    
    const status = chat.lastMessage.status;
    if (status === 'read') return <CheckCheck className="w-4 h-4 text-blue-500" />;
    if (status === 'delivered') return <CheckCheck className="w-4 h-4 text-gray-400" />;
    return <Check className="w-4 h-4 text-gray-400" />;
  }

  // Users with stories
  const usersWithStories = users.filter(user => 
    stories.some(story => story.userId === user.id)
  );

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentScreen('profile')}
              className="relative hover:opacity-80 transition-opacity"
            >
              <img
                src={currentUser?.avatar}
                alt={currentUser?.name}
                className="w-10 h-10 rounded-full ring-2 ring-violet-500"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Chats</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentScreen('stories')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Camera className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute top-16 right-4 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50"
                >
                  <button
                    onClick={() => { setCurrentScreen('profile'); setShowMenu(false); }}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">Profile</span>
                  </button>
                  <button
                    onClick={() => { setCurrentScreen('settings'); setShowMenu(false); }}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">Settings</span>
                  </button>
                  <div className="h-px bg-gray-200 my-2"></div>
                  <button
                    onClick={logout}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-red-600"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="w-full bg-gray-100 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          {['all', 'groups', 'archived'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stories */}
      {activeTab === 'all' && !searchQuery && (
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex gap-4 overflow-x-auto no-scrollbar">
            {/* Add Story */}
            <button
              onClick={() => setCurrentScreen('stories')}
              className="flex flex-col items-center gap-2 flex-shrink-0"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <span className="text-xs text-gray-600">Your Story</span>
            </button>

            {/* Other Stories */}
            {usersWithStories.slice(0, 6).map(user => {
              const hasViewed = stories
                .filter(s => s.userId === user.id)
                .every(s => s.views.includes(currentUser?.id || ''));
              
              return (
                <button
                  key={user.id}
                  onClick={() => setCurrentScreen('stories')}
                  className="flex flex-col items-center gap-2 flex-shrink-0"
                >
                  <div className={`w-16 h-16 rounded-full p-0.5 ${
                    hasViewed ? 'bg-gray-300' : 'bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500'
                  }`}>
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full rounded-full border-2 border-white"
                    />
                  </div>
                  <span className="text-xs text-gray-600 max-w-[64px] truncate">{user.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {sortedChats.map((chat, index) => {
            const otherUser = getOtherUser(chat);
            const isOnline = otherUser && onlineUsers.has(otherUser.id);

            return (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                <button
                  onClick={() => selectChat(chat.id)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={getChatAvatar(chat)}
                      alt={getChatName(chat)}
                      className="w-14 h-14 rounded-full"
                    />
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                    {chat.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-violet-600 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                        {chat.unreadCount}
                      </div>
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {getChatName(chat)}
                        </h3>
                        {chat.isPinned && <Pin className="w-3 h-3 text-violet-600" />}
                        {chat.isMuted && <BellOff className="w-3 h-3 text-gray-400" />}
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {chat.lastMessage && formatDistanceToNow(chat.lastMessage.timestamp, { addSuffix: false })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      {getMessageStatus(chat)}
                      <p className={`truncate ${chat.unreadCount > 0 ? 'font-semibold text-gray-900' : ''}`}>
                        {chat.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                  </div>

                  {/* More Options */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedChatMenu(selectedChatMenu === chat.id ? null : chat.id);
                    }}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </button>
                </button>

                {/* Chat Menu */}
                <AnimatePresence>
                  {selectedChatMenu === chat.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-4 top-16 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-40"
                    >
                      <button
                        onClick={() => {
                          togglePin(chat.id);
                          setSelectedChatMenu(null);
                        }}
                        className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50"
                      >
                        <Pin className="w-4 h-4" />
                        <span className="text-sm">{chat.isPinned ? 'Unpin' : 'Pin'}</span>
                      </button>
                      <button
                        onClick={() => {
                          toggleMute(chat.id);
                          setSelectedChatMenu(null);
                        }}
                        className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50"
                      >
                        {chat.isMuted ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                        <span className="text-sm">{chat.isMuted ? 'Unmute' : 'Mute'}</span>
                      </button>
                      <button
                        onClick={() => {
                          toggleArchive(chat.id);
                          setSelectedChatMenu(null);
                        }}
                        className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50"
                      >
                        <Archive className="w-4 h-4" />
                        <span className="text-sm">Archive</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {sortedChats.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <MessageCircle className="w-16 h-16 mb-4" />
            <p className="text-lg">No chats yet</p>
            <p className="text-sm">Start a conversation!</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-around">
        <button
          onClick={() => setCurrentScreen('chats')}
          className="flex flex-col items-center gap-1 text-violet-600"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-xs font-medium">Chats</span>
        </button>
        <button
          onClick={() => setCurrentScreen('friends')}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-violet-600 transition-colors"
        >
          <Users className="w-6 h-6" />
          <span className="text-xs">Friends</span>
        </button>
        <button
          onClick={() => setCurrentScreen('calls')}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-violet-600 transition-colors"
        >
          <Phone className="w-6 h-6" />
          <span className="text-xs">Calls</span>
        </button>
        <button
          onClick={() => setCurrentScreen('settings')}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-violet-600 transition-colors"
        >
          <Settings className="w-6 h-6" />
          <span className="text-xs">Settings</span>
        </button>
      </div>
    </div>
  );
};
