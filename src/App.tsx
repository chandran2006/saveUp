import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { PremiumDashboard } from './pages/PremiumDashboard';
import { Transactions } from './pages/Transactions';
import { Budget } from './pages/Budget';
import { Insights } from './pages/Insights';
import { Notifications } from './pages/Notifications';
import { HealthScore } from './pages/HealthScore';
import { ReceiptScanner } from './pages/ReceiptScanner';
import { AIChat } from './pages/AIChat';
import { Profile } from './pages/Profile';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<PrivateRoute><PremiumDashboard /></PrivateRoute>} />
              <Route path="/transactions" element={<PrivateRoute><Transactions /></PrivateRoute>} />
              <Route path="/budget" element={<PrivateRoute><Budget /></PrivateRoute>} />
              <Route path="/insights" element={<PrivateRoute><Insights /></PrivateRoute>} />
              <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
              <Route path="/health-score" element={<PrivateRoute><HealthScore /></PrivateRoute>} />
              <Route path="/receipt-scanner" element={<PrivateRoute><ReceiptScanner /></PrivateRoute>} />
              <Route path="/ai-chat" element={<PrivateRoute><AIChat /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
