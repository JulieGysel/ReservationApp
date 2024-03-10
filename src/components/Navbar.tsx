import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { PrimeIcons } from 'primereact/api';
import { useAuth } from '../pages/auth';
import { Button } from 'primereact/button';

export const Navbar = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const model = React.useMemo(() => {
    const createResource = {
      id: 'create',
      label: 'Create a Resource',
      icon: 'pi pi-plus',
      command: () => navigate('create'),
    };

    if (auth.user) {
      return [
        createResource,
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
          items: [
            {
              id: 'profile',
              label: 'My Profile',
              command: () => navigate('profile'),
            },
            {
              id: 'logout',
              label: 'Log out',
              command: () => auth.signout(() => navigate('/')),
            },
          ],
        },
      ];
    } else {
      return [
        createResource,
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
            <Button link>
              <span className={`pi ${PrimeIcons.CALENDAR} mx-2`} />
              Reservation App
            </Button>
          </Link>
        }
        model={model}
        pt={{
          root: { className: 'justify-content-between' }, // places the menu to the right
        }}
      />
    </>
  );
};
