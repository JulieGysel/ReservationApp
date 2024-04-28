import React from 'react';
import { TimeView } from '../../components/TimeView';
import { useLocation, useNavigate } from 'react-router-dom';
import { PrimeIcons } from 'primereact/api';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';

export const CreateReservation = () => {
  const [shareVisible, setShareVisible] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname.includes('share')
    ? location.pathname.split('/').slice(0, -1).join('/')
    : location.pathname;
  const state = location.state;

  React.useEffect(() => {
    if (location.pathname.includes('share')) {
      setShareVisible(true);
    }
  }, []);

  const toggleShare = React.useCallback(() => {
    if (!shareVisible) {
      setShareVisible(true);
      window.history.pushState(null, 'null', path + '/share');
    } else {
      setShareVisible(false);
      window.history.pushState(null, 'null', path);
    }
  }, [setShareVisible, shareVisible, location]);

  return (
    <>
      <div className="flex justify-content-between align-items-center">
        <h1>{state?.name || 'Reservation name'}</h1>
        <div>
          <Button label={'Share'} icon={PrimeIcons.SHARE_ALT} onClick={toggleShare} />
        </div>
      </div>
      {state?.description && <p>{state.description}</p>}
      <TimeView />
      <Dialog
        header={'Share'}
        visible={shareVisible}
        onHide={toggleShare}
        className="w-6 xl:w-4"
        dismissableMask
      >
        <div className="flex flex-column">
          <div className="flex gap-2">
            <InputText value={'http://localhost:5173' + path} className="flex-1" />
            <Button
              label={'Copy link'}
              icon={'pi pi-clipboard'}
              onClick={() => {
                navigator.clipboard.writeText('http://localhost:5173' + path);
                toggleShare();
              }}
            />
          </div>
          <small className="pt-2">
            Anyone with this link will be able to create a reservation.
            <br />
            <span className="font-bold">Be careful who you share it with.</span>
          </small>
        </div>
      </Dialog>
    </>
  );
};
