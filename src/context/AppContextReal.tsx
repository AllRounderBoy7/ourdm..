import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Chat, Message, Story, Call, Screen, FriendRequest } from '../types';
import { supabase } from '../lib/supabase';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  chats: Chat[];
  messages: { [chatId: string]: Message[] };
  stories: Story[];
  calls: Call[];
  friendRequests: FriendRequest[];
  currentScreen: Screen;
  selectedChatId: string | null;
  activeCall: Call | null;
  typingUsers: { [chatId: string]: string[] };
  onlineUsers: Set<string>;
  loading: boolean;
  totalUsers: number;
  
  login: (email: string) => void;
  logout: () => void;
  setCurrentScreen: (screen: Screen) => void;
  selectChat: (chatId: string | null) => void;
  sendMessage: (chatId: string, content: string, type?: Message['type']) => Promise<void>;
  deleteMessage: (chatId: string, messageId: string) => Promise<void>;
  editMessage: (chatId: string, messageId: string, newContent: string) => void;
  reactToMessage: (chatId: string, messageId: string, emoji: string) => void;
  markAsRead: (chatId: string) => void;
  togglePin: (chatId: string) => void;
  toggleMute: (chatId: string) => void;
  toggleArchive: (chatId: string) => void;
  toggleHideChat: (chatId: string) => void;
  startCall: (chatId: string, type: 'video' | 'audio') => void;
  endCall: () => void;
  addStory: (content: string, type: Story['type'], mediaUrl?: string) => Promise<void>;
  setTyping: (chatId: string, isTyping: boolean) => void;
  createGroup: (name: string, participantIds: string[]) => Promise<void>;
  searchMessages: (query: string) => Message[];
  forwardMessage: (messageId: string, chatIds: string[]) => void;
  starMessage: (chatId: string, messageId: string) => void;
  sendFriendRequest: (userId: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<User[]>;
  updateUserProfile: (updates: { fullName?: string; bio?: string; avatar?: string; username?: string }) => Promise<void>;
  setupUsername: (username: string, fullName: string) => Promise<boolean>;
  requestMediaPermissions: (type: 'audio' | 'video' | 'both') => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});
  const [stories, setStories] = useState<Story[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [typingUsers] = useState<{ [chatId: string]: string[] }>({});
  const [onlineUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);

  // Request media permissions ONLY when needed
  const requestMediaPermissions = useCallback(async (type: 'audio' | 'video' | 'both'): Promise<boolean> => {
    try {
      const constraints = type === 'both' 
        ? { audio: true, video: true }
        : type === 'audio' 
        ? { audio: true }
        : { video: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Stop all tracks after getting permission
      stream.getTracks().forEach(track => track.stop());
      
      return true;
    } catch (error) {
      console.error('Permission denied:', error);
      return false;
    }
  }, []);

  // Initialize auth state with auto-login
  useEffect(() => {
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setCurrentUser(null);
        setCurrentScreen('auth');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await loadUserProfile(user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (profile) {
        // Check if username is set
        if (!profile.username) {
          setCurrentScreen('setup-username');
          setLoading(false);
          return;
        }

        const user: User = {
          id: profile.id,
          username: profile.username,
          fullName: profile.full_name || '',
          email: profile.email || '',
          avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.username)}&background=random`,
          bio: profile.bio || '',
          isOnline: true,
          lastSeen: new Date(),
          isVerified: profile.is_verified || false,
        };
        setCurrentUser(user);
        setCurrentScreen('chats');
        
        // Update online status
        await supabase
          .from('profiles')
          .update({ is_online: true, last_seen: new Date().toISOString() })
          .eq('id', userId);

        // Load all data in parallel
        await Promise.all([
          loadUsers(),
          loadChats(userId),
          loadStories(userId),
          loadCalls(userId),
          loadFriendRequests(userId),
          loadTotalUsers(),
        ]);

        // Subscribe to real-time updates
        subscribeToRealtimeUpdates(userId);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTotalUsers = async () => {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      setTotalUsers(count || 0);
    } catch (error) {
      console.error('Error loading total users:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('username');

      if (error) throw error;

      const loadedUsers: User[] = (data || []).map((profile: any) => ({
        id: profile.id,
        username: profile.username,
        fullName: profile.full_name || '',
        email: profile.email || '',
        avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.username)}&background=random`,
        bio: profile.bio || '',
        isOnline: profile.is_online || false,
        lastSeen: profile.last_seen ? new Date(profile.last_seen) : new Date(),
        isVerified: profile.is_verified || false,
      }));

      setUsers(loadedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadFriendRequests = async (userId: string) => {
    try {
      // Get incoming requests
      const { data: incoming, error: incomingError } = await supabase
        .from('friendships')
        .select(`
          *,
          sender:profiles!friendships_user_id_fkey(*)
        `)
        .eq('friend_id', userId)
        .eq('status', 'pending');

      if (incomingError) throw incomingError;

      // Get outgoing requests
      const { data: outgoing, error: outgoingError } = await supabase
        .from('friendships')
        .select(`
          *,
          receiver:profiles!friendships_friend_id_fkey(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'pending');

      if (outgoingError) throw outgoingError;

      const requests: FriendRequest[] = [
        ...(incoming || []).map((req: any) => ({
          id: req.id,
          senderId: req.user_id,
          receiverId: req.friend_id,
          status: 'pending' as const,
          createdAt: new Date(req.created_at),
          sender: {
            id: req.sender.id,
            username: req.sender.username,
            fullName: req.sender.full_name || '',
            email: req.sender.email || '',
            avatar: req.sender.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.sender.username)}&background=random`,
            bio: req.sender.bio || '',
            isOnline: req.sender.is_online || false,
            lastSeen: req.sender.last_seen ? new Date(req.sender.last_seen) : new Date(),
            isVerified: req.sender.is_verified || false,
          },
        })),
        ...(outgoing || []).map((req: any) => ({
          id: req.id,
          senderId: req.user_id,
          receiverId: req.friend_id,
          status: 'sent' as const,
          createdAt: new Date(req.created_at),
          receiver: {
            id: req.receiver.id,
            username: req.receiver.username,
            fullName: req.receiver.full_name || '',
            email: req.receiver.email || '',
            avatar: req.receiver.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.receiver.username)}&background=random`,
            bio: req.receiver.bio || '',
            isOnline: req.receiver.is_online || false,
            lastSeen: req.receiver.last_seen ? new Date(req.receiver.last_seen) : new Date(),
            isVerified: req.receiver.is_verified || false,
          },
        })),
      ];

      setFriendRequests(requests);
    } catch (error) {
      console.error('Error loading friend requests:', error);
    }
  };

  const loadChats = async (userId: string) => {
    try {
      const { data: participantData, error: participantError } = await supabase
        .from('chat_participants')
        .select(`
          *,
          chats (
            id,
            type,
            name,
            avatar_url,
            created_at
          )
        `)
        .eq('user_id', userId);

      if (participantError) throw participantError;

      const loadedChats: Chat[] = await Promise.all((participantData || []).map(async (participant: any) => {
        const chat = participant.chats;
        
        const { data: allParticipants } = await supabase
          .from('chat_participants')
          .select('user_id')
          .eq('chat_id', chat.id);

        const participantIds = (allParticipants || []).map((p: any) => p.user_id);

        const { data: lastMessageData } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chat.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        let lastMessage: Message | undefined = undefined;
        if (lastMessageData) {
          lastMessage = {
            id: lastMessageData.id,
            chatId: lastMessageData.chat_id,
            senderId: lastMessageData.sender_id,
            content: lastMessageData.content,
            type: lastMessageData.type || 'text',
            timestamp: new Date(lastMessageData.created_at),
            status: 'read',
          };
        }

        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_id', chat.id)
          .neq('sender_id', userId);

        let name = chat.name;
        let avatar = chat.avatar_url;
        
        if (chat.type === 'direct') {
          const otherUserId = participantIds.find((id: string) => id !== userId);
          if (otherUserId) {
            const { data: otherUser } = await supabase
              .from('profiles')
              .select('username, full_name, avatar_url')
              .eq('id', otherUserId)
              .single();
            
            if (otherUser) {
              name = otherUser.username;
              avatar = otherUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.username)}&background=random`;
            }
          }
        }

        return {
          id: chat.id,
          type: chat.type,
          name: name || 'Unknown',
          avatar: avatar || 'https://ui-avatars.com/api/?name=Chat&background=random',
          participants: participantIds,
          lastMessage,
          unreadCount: unreadCount || 0,
          isPinned: participant.is_pinned || false,
          isMuted: participant.is_muted || false,
          isArchived: participant.is_archived || false,
          isBlocked: false,
          isHidden: participant.is_hidden || false,
        };
      }));

      setChats(loadedChats);

      for (const chat of loadedChats) {
        await loadMessagesForChat(chat.id);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const loadMessagesForChat = async (chatId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const loadedMessages: Message[] = await Promise.all((data || []).map(async (msg: any) => {
        const { data: reactionsData } = await supabase
          .from('message_reactions')
          .select('user_id, emoji')
          .eq('message_id', msg.id);

        const reactions = (reactionsData || []).map((r: any) => ({
          userId: r.user_id,
          emoji: r.emoji,
        }));

        return {
          id: msg.id,
          chatId: msg.chat_id,
          senderId: msg.sender_id,
          content: msg.deleted ? 'This message was deleted' : msg.content,
          type: msg.type || 'text',
          timestamp: new Date(msg.created_at),
          status: 'read',
          reactions,
          replyTo: msg.reply_to,
          forwarded: msg.forwarded || false,
          starred: msg.starred || false,
          edited: msg.edited || false,
          deleted: msg.deleted || false,
        };
      }));

      setMessages(prev => ({
        ...prev,
        [chatId]: loadedMessages,
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadStories = async (userId: string) => {
    try {
      // Get friends first
      const { data: friendships } = await supabase
        .from('friendships')
        .select('user_id, friend_id')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq('status', 'accepted');

      const friendIds = (friendships || []).map((f: any) => 
        f.user_id === userId ? f.friend_id : f.user_id
      );

      // Load stories only from friends and self
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .in('user_id', [...friendIds, userId])
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const loadedStories: Story[] = await Promise.all((data || []).map(async (story: any) => {
        const { data: viewsData } = await supabase
          .from('story_views')
          .select('user_id, viewed_at')
          .eq('story_id', story.id);

        return {
          id: story.id,
          userId: story.user_id,
          type: story.type || 'image',
          content: story.content,
          backgroundColor: story.background_color,
          timestamp: new Date(story.created_at),
          expiresAt: new Date(story.expires_at),
          views: (viewsData || []).map((v: any) => ({
            userId: v.user_id,
            timestamp: new Date(v.viewed_at),
          })),
          replies: [],
        };
      }));

      setStories(loadedStories);
    } catch (error) {
      console.error('Error loading stories:', error);
    }
  };

  const loadCalls = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('calls')
        .select(`
          *,
          call_participants (user_id)
        `)
        .contains('call_participants', [{ user_id: userId }])
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const loadedCalls: Call[] = (data || []).map((call: any) => ({
        id: call.id,
        type: call.type,
        participants: (call.call_participants || []).map((p: any) => p.user_id),
        initiatorId: call.initiator_id,
        status: call.status,
        startTime: new Date(call.started_at),
        endTime: call.ended_at ? new Date(call.ended_at) : undefined,
        duration: call.duration,
      }));

      setCalls(loadedCalls);
    } catch (error) {
      console.error('Error loading calls:', error);
    }
  };

  const subscribeToRealtimeUpdates = (userId: string) => {
    // Real-time messages
    const messagesChannel = supabase
      .channel('messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new as any;
          setMessages(prev => ({
            ...prev,
            [newMessage.chat_id]: [...(prev[newMessage.chat_id] || []), {
              id: newMessage.id,
              chatId: newMessage.chat_id,
              senderId: newMessage.sender_id,
              content: newMessage.content,
              type: newMessage.type || 'text',
              timestamp: new Date(newMessage.created_at),
              status: 'delivered',
              reactions: [],
            }],
          }));
        }
      )
      .subscribe();

    // Real-time friend requests
    const friendRequestsChannel = supabase
      .channel('friendships')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'friendships' },
        () => {
          loadFriendRequests(userId);
        }
      )
      .subscribe();

    // Real-time stories
    const storiesChannel = supabase
      .channel('stories')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'stories' },
        () => {
          loadStories(userId);
        }
      )
      .subscribe();

    return () => {
      messagesChannel.unsubscribe();
      friendRequestsChannel.unsubscribe();
      storiesChannel.unsubscribe();
    };
  };

  const setupUsername = async (username: string, fullName: string): Promise<boolean> => {
    if (!username || username.length < 3) {
      alert('Username must be at least 3 characters');
      return false;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Check if username exists
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

      if (existing) {
        alert('Username already taken');
        return false;
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          full_name: fullName,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Reload profile
      await loadUserProfile(user.id);
      return true;
    } catch (error) {
      console.error('Error setting up username:', error);
      return false;
    }
  };

  const login = async (_email: string) => {
    // Handled by Supabase auth
  };

  const logout = async () => {
    if (currentUser) {
      await supabase
        .from('profiles')
        .update({ is_online: false, last_seen: new Date().toISOString() })
        .eq('id', currentUser.id);
    }
    
    await supabase.auth.signOut();
    setCurrentUser(null);
    setCurrentScreen('auth');
    setSelectedChatId(null);
    setChats([]);
    setMessages({});
    setUsers([]);
    setFriendRequests([]);
  };

  const selectChat = (chatId: string | null) => {
    setSelectedChatId(chatId);
    if (chatId) {
      setCurrentScreen('chat');
      markAsRead(chatId);
    }
  };

  const sendMessage = async (chatId: string, content: string, type: Message['type'] = 'text') => {
    if (!currentUser || !content.trim()) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: currentUser.id,
          content,
          type,
        })
        .select()
        .single();

      if (error) throw error;

      const newMessage: Message = {
        id: data.id,
        chatId: data.chat_id,
        senderId: data.sender_id,
        content: data.content,
        type: data.type || 'text',
        timestamp: new Date(data.created_at),
        status: 'sent',
        reactions: [],
      };

      setMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), newMessage],
      }));

      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, lastMessage: newMessage }
          : chat
      ));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const deleteMessage = async (chatId: string, messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ deleted: true, content: 'This message was deleted' })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => ({
        ...prev,
        [chatId]: prev[chatId].map(msg =>
          msg.id === messageId ? { ...msg, deleted: true, content: 'This message was deleted' } : msg
        ),
      }));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const editMessage = async (chatId: string, messageId: string, newContent: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ content: newContent, edited: true })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => ({
        ...prev,
        [chatId]: prev[chatId].map(msg =>
          msg.id === messageId ? { ...msg, content: newContent, edited: true } : msg
        ),
      }));
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const reactToMessage = async (chatId: string, messageId: string, emoji: string) => {
    if (!currentUser) return;

    try {
      const { data: existingReaction } = await supabase
        .from('message_reactions')
        .select('*')
        .eq('message_id', messageId)
        .eq('user_id', currentUser.id)
        .single();

      if (existingReaction) {
        if (existingReaction.emoji === emoji) {
          await supabase
            .from('message_reactions')
            .delete()
            .eq('message_id', messageId)
            .eq('user_id', currentUser.id);
        } else {
          await supabase
            .from('message_reactions')
            .update({ emoji })
            .eq('message_id', messageId)
            .eq('user_id', currentUser.id);
        }
      } else {
        await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: currentUser.id,
            emoji,
          });
      }

      await loadMessagesForChat(chatId);
    } catch (error) {
      console.error('Error reacting to message:', error);
    }
  };

  const markAsRead = async (chatId: string) => {
    if (!currentUser) return;

    setChats(prev => prev.map(chat =>
      chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
    ));
  };

  const togglePin = async (chatId: string) => {
    if (!currentUser) return;

    const chat = chats.find(c => c.id === chatId);
    const newPinnedState = !chat?.isPinned;

    setChats(prev => prev.map(chat =>
      chat.id === chatId ? { ...chat, isPinned: newPinnedState } : chat
    ));

    try {
      await supabase
        .from('chat_participants')
        .update({ is_pinned: newPinnedState })
        .eq('chat_id', chatId)
        .eq('user_id', currentUser.id);
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const toggleMute = async (chatId: string) => {
    if (!currentUser) return;

    const chat = chats.find(c => c.id === chatId);
    const newMutedState = !chat?.isMuted;

    setChats(prev => prev.map(chat =>
      chat.id === chatId ? { ...chat, isMuted: newMutedState } : chat
    ));

    try {
      await supabase
        .from('chat_participants')
        .update({ is_muted: newMutedState })
        .eq('chat_id', chatId)
        .eq('user_id', currentUser.id);
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const toggleArchive = async (chatId: string) => {
    if (!currentUser) return;

    const chat = chats.find(c => c.id === chatId);
    const newArchivedState = !chat?.isArchived;

    setChats(prev => prev.map(chat =>
      chat.id === chatId ? { ...chat, isArchived: newArchivedState } : chat
    ));

    try {
      await supabase
        .from('chat_participants')
        .update({ is_archived: newArchivedState })
        .eq('chat_id', chatId)
        .eq('user_id', currentUser.id);
    } catch (error) {
      console.error('Error toggling archive:', error);
    }
  };

  const toggleHideChat = async (chatId: string) => {
    if (!currentUser) return;

    const chat = chats.find(c => c.id === chatId);
    const newHiddenState = !chat?.isHidden;

    setChats(prev => prev.map(chat =>
      chat.id === chatId ? { ...chat, isHidden: newHiddenState } : chat
    ));

    try {
      await supabase
        .from('chat_participants')
        .update({ is_hidden: newHiddenState })
        .eq('chat_id', chatId)
        .eq('user_id', currentUser.id);
    } catch (error) {
      console.error('Error toggling hide:', error);
    }
  };

  const startCall = async (chatId: string, type: 'video' | 'audio') => {
    // Request permissions first
    const permissionGranted = await requestMediaPermissions(type === 'video' ? 'both' : 'audio');
    if (!permissionGranted) {
      alert(`Please allow ${type} permissions to make calls`);
      return;
    }

    const chat = chats.find(c => c.id === chatId);
    if (!chat || !currentUser) return;

    const newCall: Call = {
      id: `call-${Date.now()}`,
      type,
      participants: chat.participants,
      initiatorId: currentUser.id,
      status: 'ringing',
      startTime: new Date(),
    };

    setActiveCall(newCall);
    setCalls(prev => [newCall, ...prev]);
    setCurrentScreen('call-active');

    setTimeout(() => {
      setActiveCall(prev => prev ? { ...prev, status: 'connecting' } : null);
    }, 2000);

    setTimeout(() => {
      setActiveCall(prev => prev ? { ...prev, status: 'active' } : null);
    }, 4000);
  };

  const endCall = async () => {
    if (!activeCall) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - activeCall.startTime.getTime()) / 1000);

    const endedCall = {
      ...activeCall,
      status: 'ended' as const,
      endTime,
      duration,
    };

    setCalls(prev => prev.map(call => call.id === activeCall.id ? endedCall : call));
    setActiveCall(null);
    setCurrentScreen(selectedChatId ? 'chat' : 'chats');
  };

  const addStory = async (content: string, type: Story['type'], mediaUrl?: string) => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('stories')
        .insert({
          user_id: currentUser.id,
          type,
          content: mediaUrl || content,
          background_color: type === 'text' ? content : null,
        })
        .select()
        .single();

      if (error) throw error;

      const newStory: Story = {
        id: data.id,
        userId: data.user_id,
        type: data.type,
        content: data.content,
        timestamp: new Date(data.created_at),
        expiresAt: new Date(data.expires_at),
        views: [],
        replies: [],
      };

      setStories(prev => [newStory, ...prev]);
    } catch (error) {
      console.error('Error adding story:', error);
      throw error;
    }
  };

  const setTyping = (_chatId: string, _isTyping: boolean) => {
    // Real-time typing implementation
  };

  const createGroup = async (name: string, participantIds: string[]) => {
    if (!currentUser) return;

    try {
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .insert({
          type: 'group',
          name,
          created_by: currentUser.id,
        })
        .select()
        .single();

      if (chatError) throw chatError;

      const allParticipants = [currentUser.id, ...participantIds];
      for (const participantId of allParticipants) {
        await supabase
          .from('chat_participants')
          .insert({
            chat_id: chatData.id,
            user_id: participantId,
          });
      }

      await loadChats(currentUser.id);
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  };

  const searchMessages = (query: string): Message[] => {
    const allMessages = Object.values(messages).flat();
    return allMessages.filter(msg =>
      msg.content.toLowerCase().includes(query.toLowerCase())
    );
  };

  const forwardMessage = async (_messageId: string, _chatIds: string[]) => {
    // Forward implementation
  };

  const starMessage = async (chatId: string, messageId: string) => {
    const message = messages[chatId]?.find(m => m.id === messageId);
    const newStarredState = !message?.starred;

    setMessages(prev => ({
      ...prev,
      [chatId]: prev[chatId].map(msg =>
        msg.id === messageId ? { ...msg, starred: newStarredState } : msg
      ),
    }));

    try {
      await supabase
        .from('messages')
        .update({ starred: newStarredState })
        .eq('id', messageId);
    } catch (error) {
      console.error('Error starring message:', error);
    }
  };

  const sendFriendRequest = async (userId: string) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: currentUser.id,
          friend_id: userId,
          status: 'pending',
        });

      if (error) {
        if (error.code === '23505') {
          alert('Friend request already sent');
        } else {
          throw error;
        }
      } else {
        alert('Friend request sent!');
        await loadFriendRequests(currentUser.id);
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (currentUser) {
        await loadFriendRequests(currentUser.id);
        await loadUsers();
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    try {
      await supabase
        .from('friendships')
        .delete()
        .eq('id', requestId);

      if (currentUser) {
        await loadFriendRequests(currentUser.id);
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  const searchUsers = async (query: string): Promise<User[]> => {
    if (!query || query.length < 2) return [];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(20);

      if (error) throw error;

      return (data || []).map((profile: any) => ({
        id: profile.id,
        username: profile.username,
        fullName: profile.full_name || '',
        email: profile.email || '',
        avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.username)}&background=random`,
        bio: profile.bio || '',
        isOnline: profile.is_online || false,
        lastSeen: profile.last_seen ? new Date(profile.last_seen) : new Date(),
        isVerified: profile.is_verified || false,
      }));
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  const updateUserProfile = async (updates: { fullName?: string; bio?: string; avatar?: string; username?: string }) => {
    if (!currentUser) return;

    try {
      const updateData: any = {};
      if (updates.fullName !== undefined) updateData.full_name = updates.fullName;
      if (updates.bio !== undefined) updateData.bio = updates.bio;
      if (updates.avatar !== undefined) updateData.avatar_url = updates.avatar;
      if (updates.username !== undefined) {
        // Check if username is available
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', updates.username)
          .neq('id', currentUser.id)
          .single();

        if (existing) {
          throw new Error('Username already taken');
        }
        updateData.username = updates.username;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', currentUser.id);

      if (error) throw error;

      setCurrentUser(prev => prev ? {
        ...prev,
        fullName: updates.fullName || prev.fullName,
        bio: updates.bio !== undefined ? updates.bio : prev.bio,
        avatar: updates.avatar || prev.avatar,
        username: updates.username || prev.username,
      } : null);

      setUsers(prev => prev.map(user =>
        user.id === currentUser.id
          ? {
              ...user,
              fullName: updates.fullName || user.fullName,
              bio: updates.bio !== undefined ? updates.bio : user.bio,
              avatar: updates.avatar || user.avatar,
              username: updates.username || user.username,
            }
          : user
      ));
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const value: AppContextType = {
    currentUser,
    users,
    chats,
    messages,
    stories,
    calls,
    friendRequests,
    currentScreen,
    selectedChatId,
    activeCall,
    typingUsers,
    onlineUsers,
    loading,
    totalUsers,
    login,
    logout,
    setCurrentScreen,
    selectChat,
    sendMessage,
    deleteMessage,
    editMessage,
    reactToMessage,
    markAsRead,
    togglePin,
    toggleMute,
    toggleArchive,
    toggleHideChat,
    startCall,
    endCall,
    addStory,
    setTyping,
    createGroup,
    searchMessages,
    forwardMessage,
    starMessage,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    searchUsers,
    updateUserProfile,
    setupUsername,
    requestMediaPermissions,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
