import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/Users';
import ProfessionalsPage from './pages/Professionals';
import BookingsPage from './pages/Bookings';
import ServicesPage from './pages/Services';
import ReviewsPage from './pages/Reviews';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="providers" element={<ProfessionalsPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="settings" element={<div className="p-4">Settings Page (Coming Soon)</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
