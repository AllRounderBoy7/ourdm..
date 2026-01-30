import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Speaker, Grid3x3, Maximize } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ActiveCallScreen: React.FC = () => {
  const { activeCall, users, endCall } = useApp();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(activeCall?.type === 'video');
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (activeCall?.status === 'active') {
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeCall?.status]);

  if (!activeCall) return null;

  const otherParticipant = users.find(u => 
    u.id === activeCall.participants.find(p => p !== activeCall.initiatorId)
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 text-white flex flex-col items-center justify-between p-8">
      {/* Top Bar */}
      <div className="w-full max-w-md flex items-center justify-between">
        <div>
          <div className="text-sm text-violet-200">
            {activeCall.status === 'ringing' && 'Ringing...'}
            {activeCall.status === 'connecting' && 'Connecting...'}
            {activeCall.status === 'active' && formatDuration(callDuration)}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <Speaker className="w-5 h-5" />
          </button>
          <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <Grid3x3 className="w-5 h-5" />
          </button>
          <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* User Info */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative">
          <motion.div
            animate={{
              scale: activeCall.status === 'ringing' ? [1, 1.1, 1] : 1,
            }}
            transition={{
              repeat: activeCall.status === 'ringing' ? Infinity : 0,
              duration: 1.5,
            }}
          >
            <img
              src={otherParticipant?.avatar}
              alt={otherParticipant?.name}
              className="w-32 h-32 rounded-full border-4 border-white/30 shadow-2xl"
            />
          </motion.div>
          {activeCall.status === 'active' && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-violet-900"
            />
          )}
        </div>
        
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">{otherParticipant?.name}</h2>
          <p className="text-violet-200">
            {activeCall.status === 'ringing' && 'Calling...'}
            {activeCall.status === 'connecting' && 'Connecting...'}
            {activeCall.status === 'active' && `${activeCall.type === 'video' ? 'Video' : 'Voice'} Call`}
          </p>
        </div>

        {/* Video Preview (when video is on) */}
        {activeCall.type === 'video' && isVideoOn && activeCall.status === 'active' && (
          <div className="mt-8 w-full max-w-md aspect-video bg-black/30 rounded-2xl flex items-center justify-center border-2 border-white/20">
            <div className="text-white/50">Your video feed would appear here</div>
          </div>
        )}
      </motion.div>

      {/* Controls */}
      <div className="w-full max-w-md flex items-center justify-center gap-6">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-4 rounded-full transition-all ${
            isMuted ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
          }`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {activeCall.type === 'video' && (
          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-4 rounded-full transition-all ${
              !isVideoOn ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>
        )}

        <button
          onClick={endCall}
          className="p-5 bg-red-500 rounded-full hover:bg-red-600 transition-all shadow-lg hover:shadow-xl"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
};
