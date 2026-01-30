import { useState, useCallback } from 'react';
import { Message } from '../types';

export function useOptimisticMessages() {
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);

  const addOptimisticMessage = useCallback((message: Omit<Message, 'id'>) => {
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticMsg: Message = {
      ...message,
      id: tempId,
      status: 'sending',
      createdAt: new Date().toISOString(),
    };
    
    setOptimisticMessages(prev => [...prev, optimisticMsg]);
    return tempId;
  }, []);

  const confirmMessage = useCallback((tempId: string, _realId: string) => {
    setOptimisticMessages(prev => 
      prev.filter(msg => msg.id !== tempId)
    );
  }, []);

  const removeOptimisticMessage = useCallback((tempId: string) => {
    setOptimisticMessages(prev => 
      prev.filter(msg => msg.id !== tempId)
    );
  }, []);

  return {
    optimisticMessages,
    addOptimisticMessage,
    confirmMessage,
    removeOptimisticMessage,
  };
}
