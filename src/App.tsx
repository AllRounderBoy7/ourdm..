import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthScreen } from './components/AuthScreen';
import { ChatsList } from './components/ChatsList';
import { ChatWindow } from './components/ChatWindow';
import { CallsScreen } from './components/CallsScreen';
import { ActiveCallScreen } from './components/ActiveCallScreen';
import { FriendsScreen } from './components/FriendsScreen';
import { StoriesScreen, SettingsScreen, ProfileScreen } from './components/AllScreens';

const AppContent: React.FC = () => {
  const { currentScreen } = useApp();

  return (
    <div className="max-w-md mx-auto shadow-2xl h-screen overflow-hidden bg-white">
      {currentScreen === 'auth' && <AuthScreen />}
      {currentScreen === 'chats' && <ChatsList />}
      {currentScreen === 'chat' && <ChatWindow />}
      {currentScreen === 'calls' && <CallsScreen />}
      {currentScreen === 'call-active' && <ActiveCallScreen />}
      {currentScreen === 'friends' && <FriendsScreen />}
      {currentScreen === 'stories' && <StoriesScreen />}
      {currentScreen === 'settings' && <SettingsScreen />}
      {currentScreen === 'profile' && <ProfileScreen />}
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
