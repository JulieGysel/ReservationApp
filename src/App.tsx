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
          element={
            <>
              <Navbar />
              <div className="flex justify-content-center">
                <div className="w-full md:w-10 xl:w-9 p-2">
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
          <Route
            path="create"
            element={
              <RequireAuth>
                <CreateResource />
              </RequireAuth>
            }
          />
          <Route path="reserve/:id" element={<CreateReservation />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
