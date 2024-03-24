import React from 'react';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div className={'flex align-items-center flex-column p-6'}>
      <h1 className={'text-center text-3xl md:text-6xl  xl:text-7xl'}>
        [Reservation App]
        <br />
        Sharing made easy {/* is this too on the nose? */}
      </h1>
      <p>Set up a resource. Send out a link. Manage the reservations.</p>
      <Button raised size="large" onClick={() => navigate('/create')}>
        Share something
      </Button>
      <Button text size="large" onClick={() => navigate('/reserve/0')}>
        Resource reservation demo
      </Button>
      {/* </div> */}
    </div>
  );
};
