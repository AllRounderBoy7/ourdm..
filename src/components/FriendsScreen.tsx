import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, UserPlus, Check, X, Users, MessageCircle, Phone, Video, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FriendsScreen: React.FC = () => {
  const { 
    users, 
    currentUser, 
    setCurrentScreen, 
    friends, 
    friendRequests, 
    sendFriendRequest, 
    acceptFriendRequest, 
    rejectFriendRequest 
  } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'add'>('friends');
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Filter users by search query
  const filteredUsers = useMemo(() => 
    users.filter(u => 
      u.id !== currentUser?.id && 
      ((u.fullName || u.username).toLowerCase().includes(searchQuery.toLowerCase()) ||
       u.username.toLowerCase().includes(searchQuery.toLowerCase()))
    ),
    [users, currentUser, searchQuery]
  );

  // Get incoming requests (where I am the receiver)
  const incomingRequests = useMemo(() => 
    friendRequests.filter(req => 
      req.friend_id === currentUser?.id && req.status === 'pending'
    ),
    [friendRequests, currentUser]
  );

  // Get outgoing requests (where I am the sender)
  const outgoingRequests = useMemo(() => 
    friendRequests.filter(req => 
      req.user_id === currentUser?.id && req.status === 'pending'
    ),
    [friendRequests, currentUser]
  );

  // Get my friends list
  const myFriends = useMemo(() => 
    users.filter(u => friends.some(f => f.oderId === u.id)),
    [users, friends]
  );

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept friend request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject friend request');
    }
  };

  const handleAddFriend = async (targetUsername: string) => {
    if (!currentUser || loading) return;
    
    setLoading(true);
    try {
      await sendFriendRequest(targetUsername);
      setSentRequests(prev => new Set(prev).add(targetUsername));
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentScreen('chats')}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">Friends</h1>
          </div>
          {incomingRequests.length > 0 && (
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
              {incomingRequests.length}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username..."
            className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-full py-2.5 pl-10 pr-4 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'friends'
                ? 'bg-white text-violet-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            My Friends ({myFriends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`relative flex-1 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'requests'
                ? 'bg-white text-violet-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Requests ({incomingRequests.length})
            {incomingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                {incomingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'add'
                ? 'bg-white text-violet-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Add Friends
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Friends Tab */}
          {activeTab === 'friends' && (
            <motion.div
              key="friends"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-4"
            >
              {myFriends.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Users className="w-16 h-16 mb-4" />
                  <p className="text-lg font-semibold">No friends yet</p>
                  <p className="text-sm">Start adding friends to connect!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {myFriends.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={user.avatar}
                            alt={user.fullName}
                            className="w-14 h-14 rounded-full"
                          />
                          <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                            user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{user.fullName || user.username}</h3>
                          <p className="text-sm text-violet-600 truncate">@{user.username}</p>
                          {user.bio && <p className="text-xs text-gray-400 truncate mt-0.5">{user.bio}</p>}
                        </div>
                        <div className="flex gap-1">
                          <button className="p-2 bg-violet-100 text-violet-600 rounded-full hover:bg-violet-200 transition-colors">
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors">
                            <Phone className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors">
                            <Video className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-4"
            >
              {/* Incoming Requests */}
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  Incoming Requests ({incomingRequests.length})
                </h2>
                
                {incomingRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <UserPlus className="w-12 h-12 mb-2" />
                    <p className="text-sm">No incoming requests</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {incomingRequests.map((request, index) => {
                      const sender = users.find(u => u.id === request.user_id);
                      if (!sender) return null;

                      return (
                        <motion.div
                          key={request.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <img
                              src={sender.avatar}
                              alt={sender.fullName}
                              className="w-14 h-14 rounded-full"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">{sender.fullName || sender.username}</h3>
                              <p className="text-sm text-violet-600 truncate">@{sender.username}</p>
                              {sender.bio && <p className="text-xs text-gray-400 truncate mt-0.5">{sender.bio}</p>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAcceptRequest(request.id)}
                              className="flex-1 bg-violet-600 text-white rounded-lg py-2 px-4 font-semibold hover:bg-violet-700 transition-all flex items-center justify-center gap-2"
                            >
                              <Check className="w-4 h-4" />
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request.id)}
                              className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-2 px-4 font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                            >
                              <X className="w-4 h-4" />
                              Decline
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Outgoing Requests */}
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  Sent Requests ({outgoingRequests.length})
                </h2>
                
                {outgoingRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <UserPlus className="w-12 h-12 mb-2" />
                    <p className="text-sm">No sent requests</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {outgoingRequests.map((request, index) => {
                      const receiver = users.find(u => u.id === request.friend_id);
                      if (!receiver) return null;

                      return (
                        <motion.div
                          key={request.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={receiver.avatar}
                              alt={receiver.fullName}
                              className="w-14 h-14 rounded-full"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">{receiver.fullName || receiver.username}</h3>
                              <p className="text-sm text-violet-600 truncate">@{receiver.username}</p>
                            </div>
                            <div className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-semibold text-sm">
                              Pending
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Add Friends Tab */}
          {activeTab === 'add' && (
            <motion.div
              key="add"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-4"
            >
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Search for friends by their username
                </p>
              </div>

              {searchQuery.trim() === '' ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Search className="w-16 h-16 mb-4" />
                  <p className="text-lg font-semibold">Start searching</p>
                  <p className="text-sm">Enter a username to find friends</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Search className="w-16 h-16 mb-4" />
                  <p className="text-lg font-semibold">No users found</p>
                  <p className="text-sm">Try a different search term</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                    Search Results ({filteredUsers.length})
                  </h2>
                  {filteredUsers.map((user, index) => {
                    const isFriend = myFriends.some(f => f.id === user.id);
                    const hasSentRequest = outgoingRequests.some(req => req.friend_id === user.id);

                    return (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={user.avatar}
                              alt={user.fullName}
                              className="w-14 h-14 rounded-full"
                            />
                            <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                              user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{user.fullName || user.username}</h3>
                            <p className="text-sm text-violet-600 truncate">@{user.username}</p>
                            {user.bio && <p className="text-xs text-gray-400 truncate mt-0.5">{user.bio}</p>}
                          </div>
                          <button
                            onClick={() => handleAddFriend(user.username)}
                            disabled={isFriend || hasSentRequest || loading || sentRequests.has(user.username)}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                              isFriend
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : hasSentRequest || sentRequests.has(user.username)
                                ? 'bg-yellow-100 text-yellow-700 cursor-not-allowed'
                                : loading
                                ? 'bg-violet-400 text-white cursor-wait'
                                : 'bg-violet-600 text-white hover:bg-violet-700 active:scale-95'
                            }`}
                          >
                            {isFriend ? (
                              <>
                                <Check className="w-4 h-4" />
                                Friends
                              </>
                            ) : hasSentRequest || sentRequests.has(user.username) ? (
                              'Pending'
                            ) : loading ? (
                              '...'
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4" />
                                Add
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-around">
        <button
          onClick={() => setCurrentScreen('chats')}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-violet-600 transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-xs">Chats</span>
        </button>
        <button
          onClick={() => setCurrentScreen('friends')}
          className="flex flex-col items-center gap-1 text-violet-600"
        >
          <Users className="w-6 h-6" />
          <span className="text-xs font-medium">Friends</span>
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
