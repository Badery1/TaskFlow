import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = ({ handleLogout }) => {
    const navigate = useNavigate();

    useEffect(() => {
        handleLogout();
        
        navigate('/login');
    }, [handleLogout, navigate]);

    return null;
};

export default Logout;
