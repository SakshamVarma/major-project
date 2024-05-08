import React from 'react';
import AuthCheck from './AuthCheck';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  return <AuthCheck>{children}</AuthCheck>;
};

export default ProtectedRoute;