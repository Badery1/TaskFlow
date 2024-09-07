import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ isAuthenticated }) => {
  const location = useLocation(); 

  return (
    <nav>
      <ul>
        {!isAuthenticated && location.pathname !== '/login' && (
          <li><Link to="/login">Login</Link></li>
        )}
        {!isAuthenticated && location.pathname !== '/register' && (
          <li><Link to="/register">Register</Link></li>
        )}
        {isAuthenticated && location.pathname !== '/dashboard' && (
          <li><Link to="/dashboard">Dashboard</Link></li>
        )}
        {isAuthenticated && location.pathname !== '/logout' && (
          <li><Link to="/logout">Logout</Link></li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
