import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RootLayout from './components/RootLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import BarberDashboard from './pages/BarberDashboard';
import SuperadminDashboard from './pages/SuperadminDashboard';
import BookPage from './pages/BookPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="book" element={<BookPage />} />
          <Route path="barber/dashboard" element={<BarberDashboard />} />
          <Route path="superadmin/dashboard" element={<SuperadminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
