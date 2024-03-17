import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './authContext';

export const fakeAuthProvider = {
  isAuthenticated: false,
  signin(callback: VoidFunction) {
    fakeAuthProvider.isAuthenticated = true;
    setTimeout(callback, 100);
  },
  signout(callback: VoidFunction) {
    fakeAuthProvider.isAuthenticated = false;
    setTimeout(callback, 100);
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

export const AuthStatus = () => {
  let auth = useAuth();
  let navigate = useNavigate();

  if (!auth.user) {
    return <p className="text-center">You are not logged in.</p>;
  }

  return (
    <p className="text-center">
      Welcome {auth.user}!{' '}
      <button
        onClick={() => {
          auth.signout(() => navigate('/'));
        }}
      >
        Sign out
      </button>
    </p>
  );
};
