export interface User {
  id: string;
  name?: string;
  username: string;
  fullName?: string;
  avatar: string;
  email: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  isOnline?: boolean;
  lastSeen?: Date;
  bio?: string;
  verified?: boolean;
  isVerified?: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'voice' | 'location' | 'contact' | 'poll' | 'sticker';
  timestamp: Date;
  createdAt?: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  replyTo?: string;
  reactions?: Reaction[];
  edited?: boolean;
  deleted?: boolean;
  forwarded?: boolean;
  starred?: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  location?: { lat: number; lng: number };
  poll?: Poll;
  readBy?: string[];
  deliveredTo?: string[];
}

export interface Reaction {
  userId: string;
  emoji: string;
}

export interface Poll {
  question: string;
  options: PollOption[];
  allowMultiple: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[];
}

export interface Chat {
  id: string;
  type: 'direct' | 'group';
  participants: string[];
  name?: string;
  avatar?: string;
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  isBlocked: boolean;
  isHidden?: boolean;
  vanishMode?: boolean;
  customEmoji?: string[];
  theme?: string;
  wallpaper?: string;
}

export interface Story {
  id: string;
  userId: string;
  type: 'image' | 'video' | 'text';
  content: string;
  backgroundColor?: string;
  timestamp: Date;
  expiresAt: Date;
  views: any[];
  replies: StoryReply[];
}

export interface StoryReply {
  userId: string;
  message: string;
  timestamp: Date;
}

export interface Call {
  id: string;
  type: 'video' | 'audio';
  participants: string[];
  initiatorId: string;
  status: 'ringing' | 'connecting' | 'active' | 'ended' | 'missed' | 'declined';
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'sent' | 'accepted' | 'rejected';
  createdAt: Date;
  sender?: User;
  receiver?: User;
}

export type Screen = 'auth' | 'chats' | 'chat' | 'calls' | 'stories' | 'settings' | 'profile' | 'call-active' | 'friends' | 'setup-username';
