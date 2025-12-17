import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import HomePage from './components/HomePage';
import AuthPage from './components/AuthPage';
import UploadPage from './pages/UploadPage';
import UploadMultiplePage from './pages/UploadMultiplePage';
import SelectModePage from './pages/SelectModePage';
import LayoutSelectionPage from './pages/LayoutSelectionPage';

import { User } from './types/User';

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const printerId = params.get('printerId');

    if (printerId) {
      localStorage.setItem('selectedPrinter', printerId);
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route
            path="/"
            element={<HomePage user={user} onLogout={handleLogout} />}
          />

          <Route
            path="/auth"
            element={<AuthPage onLogin={handleLogin} />}
          />

          <Route
            path="/mode"
            element={<SelectModePage />}
          />

          <Route
            path="/upload"
            element={<UploadPage user={user} />}
          />

          <Route
            path="/upload/multiple"
            element={<UploadMultiplePage user={user} />}
          />

          <Route
            path="/layout"
            element={<LayoutSelectionPage />}
          />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
