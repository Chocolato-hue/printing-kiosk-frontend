import React, { useState } from 'react';
import HomePage from './components/HomePage';
import AuthPage from './components/AuthPage';
import UploadPage from './pages/UploadPage';
import { User } from './types/User';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'auth' | 'upload'>('home');
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentPage('upload');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onGetStarted={() => setCurrentPage('auth')} user={user} onLogout={handleLogout} />;
      case 'auth':
        return <AuthPage onLogin={handleLogin} onBack={() => setCurrentPage('home')} />;
      case 'upload':
        return <UploadPage user={user} onBack={() => setCurrentPage('home')} />;
      default:
        return <HomePage onGetStarted={() => setCurrentPage('auth')} user={user} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderPage()}
    </div>
  );
}

export default App;