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
  const { currentScreen, currentUser } = useApp();

  return (
    <div className="max-w-md mx-auto shadow-2xl h-screen overflow-hidden bg-white relative">
      {currentScreen === 'auth' && <AuthScreen />}
      {currentScreen === 'chats' && <ChatsList />}
      {currentScreen === 'chat' && <ChatWindow />}
      {currentScreen === 'calls' && <CallsScreen />}
      {currentScreen === 'call-active' && <ActiveCallScreen />}
      {currentScreen === 'friends' && <FriendsScreen />}
      {currentScreen === 'stories' && <StoriesScreen />}
      {currentScreen === 'settings' && <SettingsScreen />}
      {currentScreen === 'profile' && <ProfileScreen />}
      
      {/* Footer - Made by Sameer Shah */}
      {currentUser && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-violet-600/10 to-purple-600/10 backdrop-blur-sm border-t border-white/10 py-1.5 text-center z-50 pointer-events-none">
          <p className="text-[10px] text-white/50">
            Made with ❤️ by <span className="text-violet-400 font-semibold">Sameer Shah</span>
          </p>
        </div>
      )}
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
