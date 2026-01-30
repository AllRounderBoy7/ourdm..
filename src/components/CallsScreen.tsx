import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Video, PhoneMissed, ArrowDownLeft, ArrowUpRight, ArrowLeft, MessageCircle, Users, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';

export const CallsScreen: React.FC = () => {
  const { users, calls, startCall, setCurrentScreen } = useApp();

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCurrentScreen('chats')}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Calls</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {calls.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Phone className="w-16 h-16 mb-4" />
            <p className="text-lg">No call history</p>
          </div>
        ) : (
          calls.map((call, index) => {
            const otherParticipant = users.find(u => u.id === call.participants.find(p => p !== call.initiatorId));
            const Icon = call.type === 'video' ? Video : Phone;
            const statusIcon = call.status === 'missed' ? PhoneMissed : call.status === 'ended' ? (call.initiatorId === 'user-1' ? ArrowUpRight : ArrowDownLeft) : Phone;
            const statusColor = call.status === 'missed' ? 'text-red-500' : 'text-green-500';

            return (
              <motion.div
                key={call.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 border-b border-gray-100"
              >
                <img
                  src={otherParticipant?.avatar}
                  alt={otherParticipant?.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{otherParticipant?.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {React.createElement(statusIcon, { className: `w-4 h-4 ${statusColor}` })}
                    <span>{formatDistanceToNow(call.startTime)} ago</span>
                    {call.duration && <span>• {Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}</span>}
                  </div>
                </div>
                <button
                  onClick={() => startCall('chat-1', call.type)}
                  className="p-3 bg-violet-100 text-violet-600 rounded-full hover:bg-violet-200 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </button>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-around">
        <button
          onClick={() => setCurrentScreen('chats')}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-violet-600 transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-xs">Chats</span>
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
          className="flex flex-col items-center gap-1 text-violet-600"
        >
          <Phone className="w-6 h-6" />
          <span className="text-xs font-medium">Calls</span>
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
