import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Logout from './Logout';
import Navbar from './Navbar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check localStorage for token on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);  // Set to true if token exists
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true); 
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>TaskFlow</h1>
          <Navbar isAuthenticated={isAuthenticated} /> 
        </header>
        <Routes>
          <Route path="/login" element={<Login handleLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/logout" element={<Logout handleLogout={handleLogout} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
