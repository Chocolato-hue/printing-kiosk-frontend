import { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import AuthPage from './components/AuthPage';
import UploadPage from './pages/UploadPage';
import UploadMultiplePage from './pages/UploadMultiplePage';
import SelectModePage from './pages/SelectModePage';
import { User } from './types/User';
import LayoutSelectionPage from './pages/LayoutSelectionPage';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'auth' | 'selectMode' | 'uploadSingle' | 'uploadMultiple'| 'layoutSelect'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<'fullA5' | 'two4x6' | null>(null);

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const printerId = params.get("printerId");

  if (printerId) {
    localStorage.setItem("selectedPrinter", printerId);
    setCurrentPage("uploadSingle"); // 🚀 force jump
  }
}, []);


  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentPage('selectMode');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
  };

  const handleSelectMode = (mode: 'single' | 'multiple') => {
    if (mode === 'single') setCurrentPage('uploadSingle');
    else setCurrentPage('uploadMultiple');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            onGetStarted={() => {
              if (user) setCurrentPage('selectMode'); // user already logged in
              else setCurrentPage('auth'); // new visitor
            }}
            user={user}
            onLogout={handleLogout}
          />
        );
      case 'auth':
        return <AuthPage onLogin={handleLogin} onBack={() => setCurrentPage('home')} />;
      case 'selectMode':
        return <SelectModePage onSelectMode={handleSelectMode} onBack={() => setCurrentPage('home')} />;
      case 'uploadSingle':
        return (
          <UploadPage
            user={user}
            onBack={() => setCurrentPage('selectMode')}
            onProceedToLayout={() => setCurrentPage('layoutSelect')}
          />
        );
      case 'uploadMultiple':
        return <UploadMultiplePage user={user} onBack={() => setCurrentPage('selectMode')} />;
      case 'layoutSelect':
        return (
          <LayoutSelectionPage
            onBack={() => setCurrentPage('uploadSingle')}
            onSelectLayout={(layout) => {
              setSelectedLayout(layout);           // save layout choice
              setCurrentPage('uploadSingle');      // go back to UploadPage (or later to PaymentModal)
              localStorage.setItem('selectedLayout', layout); // optional: persist choice
            }}
          />
        );
      default:
        return <HomePage onGetStarted={() => setCurrentPage('auth')} user={user} onLogout={handleLogout} />;
    }
  };

  return <div className="min-h-screen bg-gray-50">{renderPage()}</div>;
}

export default App;
