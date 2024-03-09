import * as React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { Home, LogIn, NotFound, Profile, ReservationList, ResourceList, SignUp } from './pages';
import { AuthProvider, AuthStatus, RequireAuth } from './pages/auth';
import { Navbar } from './components';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route
          element={
            <>
              <Navbar />
              <AuthStatus />
              <Outlet />
            </>
          }
        >
          <Route index element={<Home />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route
            path="resources"
            element={
              <RequireAuth>
                <ResourceList />
              </RequireAuth>
            }
          />
          <Route
            path="reservations"
            element={
              <RequireAuth>
                <ReservationList />
              </RequireAuth>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
