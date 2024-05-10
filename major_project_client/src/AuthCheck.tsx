import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { BASE_URL } from "./Util";

interface AuthCheckProps {
  children: React.ReactNode;
}

const AuthCheck: React.FC<AuthCheckProps> = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    const validateToken = async () => {
      try {
        // Send a request to your server's token validation endpoint
        const response = await axios.post(`${BASE_URL}/api/auth/validate-token`, { token });

        // If the token is valid, do nothing
        if (response.data.isValid) {
          return;
        }

        // If the token is invalid, navigate to the login page
        navigate('/login');
      } catch (error) {
        // Handle any errors that occurred during the request
        console.error('Error validating token:', error);
        navigate('/login');
      }
    };

    // If there's a token, validate it
    if (token) {
      validateToken();
    } else {
      // If there's no token, navigate to the login page
      navigate('/login');
    }
  }, [navigate]);

  return <>{children}</>;
};

export default AuthCheck;