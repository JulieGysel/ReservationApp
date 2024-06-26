import * as React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import {
  CreateReservation,
  CreateResource,
  Home,
  LogIn,
  NotFound,
  Profile,
  ReservationList,
  ResourceList,
  SignUp,
} from './pages';
import { AuthProvider, RequireAuth } from './pages/auth';
import { Navbar } from './components';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="reserve/:id/*"
          element={
            <>
              <div className="flex flex-column h-screen">
                <Navbar />
                <div className="flex justify-content-center overflow-x-auto">
                  <div className="w-full xl:w-9 p-2 overflow-x-auto" style={{ display: 'grid' }}>
                    <CreateReservation />
                  </div>
                </div>
              </div>
            </>
          }
        />
        <Route
          element={
            <>
              <Navbar />
              <div className="flex justify-content-center">
                <div className="w-full xl:w-9 p-2">
                  <Outlet />
                </div>
              </div>
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
          <Route path="create" element={<CreateResource />} />
          <Route path="resource/:id" element={<CreateResource />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
