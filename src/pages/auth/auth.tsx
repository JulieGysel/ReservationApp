import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './authContext';

export const fakeAuthProvider = {
  isAuthenticated: false,
  signin(callback: VoidFunction) {
    fakeAuthProvider.isAuthenticated = true;
    callback();
  },
  signout(callback: VoidFunction) {
    fakeAuthProvider.isAuthenticated = false;
    callback();
  },
};

export const RequireAuth = ({ children }: { children: JSX.Element }) => {
  let auth = useAuth();
  let location = useLocation();

  if (!auth.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
