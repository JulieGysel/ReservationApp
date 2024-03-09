import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { PrimeIcons } from 'primereact/api';
import { useAuth } from '../pages/auth';

export const Navbar = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const model = React.useMemo(() => {
    if (auth.user) {
      return [
        {
          id: 'resourceList',
          label: 'My Resources',
          command: () => navigate('resources'),
        },
        {
          id: 'reservationList',
          label: 'My Reservations',
          command: () => navigate('reservations'),
        },
        {
          id: 'profile',
          label: 'My Profile',
          command: () => navigate('profile'),
        },
      ];
    } else {
      return [
        {
          id: 'login',
          label: 'Log In',
          command: () => navigate('login'),
        },
        {
          id: 'signup',
          label: 'Sign Up',
          command: () => navigate('signup'),
        },
      ];
    }
  }, [auth.user]);

  return (
    <>
      <Menubar
        start={
          <Link to="/" replace>
            <>
              <span className={`pi ${PrimeIcons.CALENDAR} mx-2`} />
              <span>Reservation App</span>
            </>
          </Link>
        }
        model={model}
        pt={{ root: { className: 'justify-content-between' } }}
      />
    </>
  );
};
