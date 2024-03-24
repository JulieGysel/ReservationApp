import React, { useState, useEffect } from 'react';
import '../../index.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { Formik, FormikValues } from 'formik';
import { Button } from 'primereact/button';
import { Panel } from 'primereact/panel';

import {
  CalendarField,
  CheckboxField,
  InputField,
  NumberField,
  SelectButtonsField,
  TextAreaField,
  AvailabilityView,
  TimeInputField,
  NumberInputField,
} from '../../components';
import { resourceValidationSchema } from './validationSchemas';
import { useAuth } from '../auth';
import { Dialog } from 'primereact/dialog';

export const CreateResource = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isDialogVisible, setDialogVisible] = React.useState(false);

  const handleSubmit = (values: FormikValues) => {
    if (user) {
      console.log(values);
    } else {
      setDialogVisible(true);
    }
  };

  const initialValues = {
    name: '',
    description: '',
    privacy: 'all',
    anonymous: false,
    capacity: 1,
    timeslot: new Date('1 Jan 1970 00:30:00'),
    maximumLength: new Date('1 Jan 1970 00:30:00'),
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
      }}
    >
      <div className={'flex flex-column align-items-start'}>
        <Formik
          initialValues={location.state?.values || initialValues}
          onSubmit={handleSubmit}
          validationSchema={resourceValidationSchema}
        >
          {({ handleSubmit, values }) => (
            <form onSubmit={handleSubmit}>
              <Panel header="Resource" toggleable>
                <InputField name="name" label="Name" required type={'text'} />
                <TextAreaField name={'description'} label={'Description'} />
              </Panel>

              <Panel header="Privacy" toggleable>
                <SelectButtonsField
                  name="privacy"
                  label="Which people can create reservations?"
                  options={[
                    { label: 'All', value: 'all' },
                    { label: 'Signed-in', value: 'signedIn' },
                    { label: 'Whitelisted', value: 'whitelist' },
                  ]}
                />
                <CheckboxField name="anonymous" label="Allow anonymous reservations" />
              </Panel>

              {values.privacy === 'whitelist' ? (
                <Panel header="User whitelist" toggleable></Panel>
              ) : null}

              <Panel header="Reservation limits" toggleable>
                <NumberInputField name={'capacity'} label={'Maximum capacity'} min={1} />
                <TimeInputField name="timeslot" label="Reservation timeslot length" />
                <TimeInputField
                  name="maximumLength"
                  label="Maximum reservation length"
                  checkbox={true}
                  visible={false}
                />
              </Panel>
              <div
                className="flex w-full pb-4 pt-4"
                style={{
                  minWidth: '20rem',
                  justifyContent: 'center',
                  borderRadius: 'var(--border-radius)',
                  backgroundColor: 'var(--surface-card)',
                }}
              >
                <Button label="Create" type="submit" icon="pi pi-check" className="font-semibold" />
              </div>
              <Dialog
                header="Log in or sign up to continue"
                visible={isDialogVisible}
                onHide={() => setDialogVisible(false)}
                draggable={false}
                footer={
                  <div className="flex justify-content-end gap-2">
                    <Button
                      onClick={() => {
                        navigate('/signup', { state: { from: location, values } });
                      }}
                      outlined
                    >
                      Sign up
                    </Button>
                    <Button
                      onClick={() => {
                        navigate('/login', { state: { from: location, values } });
                      }}
                    >
                      Log in
                    </Button>
                  </div>
                }
              >
                Only registered users can create resources.
              </Dialog>
            </form>
          )}
        </Formik>
      </div>
      <div
        style={{
          display: 'flex',
          flex: '1 0 auto',
          minWidth: 'max-content',
        }}
      >
        <Panel
          header="Availability"
          style={{ minWidth: 'max-content', width: '100%' }}
          pt={{
            content: { style: { padding: '0' } },
          }}
        >
          <AvailabilityView></AvailabilityView>
        </Panel>
      </div>
    </div>
  );
};
