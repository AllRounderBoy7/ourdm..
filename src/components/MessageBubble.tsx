import { memo } from 'react';
import { Message } from '../types';
import { Check, CheckCheck, Clock } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

const MessageBubble = memo(({ message, isOwn }: MessageBubbleProps) => {
  const renderStatus = () => {
    if (!isOwn) return null;
    
    if (message.status === 'sending') {
      return <Clock className="w-3 h-3 text-gray-400" />;
    }
    
    if (message.readBy && message.readBy.length > 0) {
      return <CheckCheck className="w-3 h-3 text-blue-500" />;
    }
    
    if (message.deliveredTo && message.deliveredTo.length > 0) {
      return <CheckCheck className="w-3 h-3 text-gray-400" />;
    }
    
    return <Check className="w-3 h-3 text-gray-400" />;
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
      <div
        className={`max-w-[75%] rounded-lg px-3 py-2 ${
          isOwn
            ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
        }`}
      >
        {message.replyTo && (
          <div className="mb-1 border-l-2 border-white/30 pl-2 text-xs opacity-70">
            Replying to message
          </div>
        )}
        
        <p className="text-sm break-words">{message.content}</p>
        
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[10px] opacity-70">
            {new Date(message.createdAt || message.timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {renderStatus()}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.status === nextProps.message.status &&
    prevProps.message.readBy?.length === nextProps.message.readBy?.length &&
    prevProps.isOwn === nextProps.isOwn
  );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;
