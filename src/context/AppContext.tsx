import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Chat, Message, Story, Call, Screen } from '../types';
import { supabase } from '../lib/supabase';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  chats: Chat[];
  messages: { [chatId: string]: Message[] };
  stories: Story[];
  calls: Call[];
  currentScreen: Screen;
  selectedChatId: string | null;
  activeCall: Call | null;
  typingUsers: { [chatId: string]: string[] };
  onlineUsers: Set<string>;
  loading: boolean;
  
  login: (email: string) => void;
  logout: () => void;
  setCurrentScreen: (screen: Screen) => void;
  selectChat: (chatId: string | null) => void;
  sendMessage: (chatId: string, content: string, type?: Message['type']) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  editMessage: (chatId: string, messageId: string, newContent: string) => void;
  reactToMessage: (chatId: string, messageId: string, emoji: string) => void;
  markAsRead: (chatId: string) => void;
  togglePin: (chatId: string) => void;
  toggleMute: (chatId: string) => void;
  toggleArchive: (chatId: string) => void;
  startCall: (chatId: string, type: 'video' | 'audio') => void;
  endCall: () => void;
  addStory: (content: string, type: Story['type']) => void;
  setTyping: (chatId: string, isTyping: boolean) => void;
  createGroup: (name: string, participantIds: string[]) => void;
  searchMessages: (query: string) => Message[];
  forwardMessage: (messageId: string, chatIds: string[]) => void;
  starMessage: (chatId: string, messageId: string) => void;
  sendFriendRequest: (username: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<User[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});
  const [stories, setStories] = useState<Story[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [typingUsers, setTypingUsers] = useState<{ [chatId: string]: string[] }>({});
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
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
        const user: User = {
          id: profile.id,
          username: profile.username,
          fullName: profile.full_name || '',
          email: '', // Not stored in profiles
          avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.username)}&background=random`,
          bio: profile.bio || '',
          isOnline: profile.is_online || false,
          lastSeen: profile.last_seen ? new Date(profile.last_seen) : new Date(),
          isVerified: profile.is_verified || false,
        };
        setCurrentUser(user);
        setCurrentScreen('chats');
        
        // Update online status
        await supabase
          .from('profiles')
          .update({ is_online: true, last_seen: new Date().toISOString() })
          .eq('id', userId);

        // Load user data
        await Promise.all([
          loadUsers(),
          loadChats(userId),
          loadStories(),
          loadCalls(userId),
        ]);

        // Subscribe to realtime updates
        subscribeToRealtimeUpdates(userId);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
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
        email: '',
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
        
        // Get all participants
        const { data: allParticipants } = await supabase
          .from('chat_participants')
          .select('user_id')
          .eq('chat_id', chat.id);

        const participantIds = (allParticipants || []).map((p: any) => p.user_id);

        // Get last message
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

        // Count unread messages
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_id', chat.id)
          .neq('sender_id', userId)
          .not('id', 'in', `(
            SELECT message_id FROM message_status 
            WHERE user_id = '${userId}' AND status = 'read'
          )`);

        // Get other user for direct chats
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
        };
      }));

      setChats(loadedChats);

      // Load messages for each chat
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
        // Get reactions
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

  const loadStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
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
    // Subscribe to new messages
    const messagesSubscription = supabase
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

    // Subscribe to profile updates (online status)
    const profilesSubscription = supabase
      .channel('profiles')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          const updatedProfile = payload.new as any;
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            if (updatedProfile.is_online) {
              newSet.add(updatedProfile.id);
            } else {
              newSet.delete(updatedProfile.id);
            }
            return newSet;
          });
        }
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
      profilesSubscription.unsubscribe();
    };
  };

  const login = async (email: string) => {
    // This is handled by Supabase auth
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

      // Update local state immediately
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

      // Update chat's last message
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
      // Check if reaction exists
      const { data: existingReaction } = await supabase
        .from('message_reactions')
        .select('*')
        .eq('message_id', messageId)
        .eq('user_id', currentUser.id)
        .single();

      if (existingReaction) {
        if (existingReaction.emoji === emoji) {
          // Remove reaction
          await supabase
            .from('message_reactions')
            .delete()
            .eq('message_id', messageId)
            .eq('user_id', currentUser.id);
        } else {
          // Update reaction
          await supabase
            .from('message_reactions')
            .update({ emoji })
            .eq('message_id', messageId)
            .eq('user_id', currentUser.id);
        }
      } else {
        // Add new reaction
        await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: currentUser.id,
            emoji,
          });
      }

      // Reload messages for this chat
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

    try {
      const chatMessages = messages[chatId] || [];
      for (const msg of chatMessages) {
        if (msg.senderId !== currentUser.id) {
          await supabase
            .from('message_status')
            .upsert({
              message_id: msg.id,
              user_id: currentUser.id,
              status: 'read',
            }, {
              onConflict: 'message_id,user_id'
            });
        }
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
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

  const startCall = async (chatId: string, type: 'video' | 'audio') => {
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

    try {
      const { data, error } = await supabase
        .from('calls')
        .insert({
          chat_id: chatId,
          initiator_id: currentUser.id,
          type,
          status: 'ringing',
        })
        .select()
        .single();

      if (error) throw error;

      // Insert call participants
      for (const participantId of chat.participants) {
        await supabase
          .from('call_participants')
          .insert({
            call_id: data.id,
            user_id: participantId,
          });
      }

      // Simulate call connection
      setTimeout(() => {
        setActiveCall(prev => prev ? { ...prev, status: 'connecting' } : null);
      }, 2000);

      setTimeout(() => {
        setActiveCall(prev => prev ? { ...prev, status: 'active' } : null);
      }, 4000);
    } catch (error) {
      console.error('Error starting call:', error);
    }
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

    try {
      await supabase
        .from('calls')
        .update({
          status: 'ended',
          ended_at: endTime.toISOString(),
          duration,
        })
        .eq('id', activeCall.id);
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const addStory = async (content: string, type: Story['type']) => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('stories')
        .insert({
          user_id: currentUser.id,
          type,
          content,
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
    }
  };

  const setTyping = (chatId: string, isTyping: boolean) => {
    if (!currentUser) return;

    setTypingUsers(prev => {
      const current = prev[chatId] || [];
      if (isTyping) {
        return { ...prev, [chatId]: [...current.filter(id => id !== currentUser.id), currentUser.id] };
      } else {
        return { ...prev, [chatId]: current.filter(id => id !== currentUser.id) };
      }
    });

    if (isTyping) {
      setTimeout(() => setTyping(chatId, false), 3000);
    }
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

      // Add participants
      const allParticipants = [currentUser.id, ...participantIds];
      for (const participantId of allParticipants) {
        await supabase
          .from('chat_participants')
          .insert({
            chat_id: chatData.id,
            user_id: participantId,
          });
      }

      // Reload chats
      await loadChats(currentUser.id);
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const searchMessages = (query: string): Message[] => {
    const allMessages = Object.values(messages).flat();
    return allMessages.filter(msg =>
      msg.content.toLowerCase().includes(query.toLowerCase())
    );
  };

  const forwardMessage = async (messageId: string, chatIds: string[]) => {
    const allMessages = Object.values(messages).flat();
    const message = allMessages.find(m => m.id === messageId);
    if (!message || !currentUser) return;

    try {
      for (const chatId of chatIds) {
        await supabase
          .from('messages')
          .insert({
            chat_id: chatId,
            sender_id: currentUser.id,
            content: message.content,
            type: message.type,
            forwarded: true,
          });
      }

      // Reload affected chats
      for (const chatId of chatIds) {
        await loadMessagesForChat(chatId);
      }
    } catch (error) {
      console.error('Error forwarding message:', error);
    }
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

  const sendFriendRequest = async (username: string) => {
    if (!currentUser) return;

    try {
      // Find user by username
      const { data: targetUser, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

      if (userError || !targetUser) {
        alert('User not found');
        return;
      }

      // Send friend request
      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: currentUser.id,
          friend_id: targetUser.id,
          status: 'pending',
        });

      if (error) throw error;

      alert('Friend request sent!');
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      if (error.code === '23505') {
        alert('Friend request already exists');
      }
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      // Reload users/friends
      await loadUsers();
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

      // Reload users/friends
      await loadUsers();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  const searchUsers = async (query: string): Promise<User[]> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${query}%`)
        .limit(20);

      if (error) throw error;

      return (data || []).map((profile: any) => ({
        id: profile.id,
        username: profile.username,
        fullName: profile.full_name || '',
        email: '',
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

  const value: AppContextType = {
    currentUser,
    users,
    chats,
    messages,
    stories,
    calls,
    currentScreen,
    selectedChatId,
    activeCall,
    typingUsers,
    onlineUsers,
    loading,
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
