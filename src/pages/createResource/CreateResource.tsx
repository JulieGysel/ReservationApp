import React from 'react';
import '../../index.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { Formik, FormikValues } from 'formik';
import { Button } from 'primereact/button';

import {
  InputField,
  NumberField,
  SelectButtonsField,
  TextAreaField,
  AvailabilityView,
} from '../../components';
import { resourceValidationSchema } from './validationSchemas';
import { Card } from 'primereact/card';
import ShortUniqueId from 'short-unique-id';

const uid = new ShortUniqueId({ length: 10 });

export const CreateResource = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = React.useCallback((values: FormikValues) => {
    const uuid = uid.randomUUID();
    navigate(`/reserve/${uuid}/share`, { state: values });
  }, []);

  const initialValues = {
    name: '',
    description: '',
    privacy: 'all',
    anonymous: false,
    capacity: 1,
    timeslot: new Date('1 Jan 1970 00:30:00'),
    maximumLength: new Date('1 Jan 1970 00:30:00'),
    available: 'always',
  };

  return (
    <div className="flex justify-content-center">
      <Card title="Share something" className="xl:w-10 w-full">
        <Formik
          initialValues={location.state?.values || initialValues}
          onSubmit={handleSubmit}
          validationSchema={resourceValidationSchema}
        >
          {({ handleSubmit, values }) => (
            <form onSubmit={handleSubmit}>
              <InputField name="name" label="Name" required type={'text'} />
              <TextAreaField name={'description'} label={'Description'} />

              <div className="flex flex-column xl:flex-row">
                <div>
                  <NumberField name={'capacity'} label={'Maximum capaxity'} min={1} />
                </div>

                <div className="flex-1">
                  <SelectButtonsField
                    name="available"
                    label="Available"
                    options={[
                      { label: 'Always', value: 'always' },
                      { label: 'Select times', value: 'select' },
                    ]}
                  />
                </div>
              </div>
              {values.available === 'select' && <AvailabilityView></AvailabilityView>}

              <div className="w-full flex justify-content-center">
                <Button label="Create" type="submit" icon="pi pi-check" className="font-semibold" />
              </div>
            </form>
          )}
        </Formik>
      </Card>
    </div>
  );
};
