import React from 'react';
import { Formik, FormikValues } from 'formik';
import { CheckboxField, InputField } from '../../components';
import { Button } from 'primereact/button';
import { profileValidationSchema } from './validationSchemas';

const userMockData = {
  email: 'test@test.com',
  name: 'Test Test',
  changePassword: false,
  password: '',
  newPassword: '',
  repeatNewPassword: '',
};

export const Profile = () => {
  const handleSubmit = (values: FormikValues) => {
    console.log(values);
  };

  return (
    <>
      <h2 className={'text-center'}>Profile details</h2>
      <Formik
        initialValues={userMockData}
        onSubmit={handleSubmit}
        validationSchema={profileValidationSchema}
      >
        {({ values, handleSubmit, handleReset }) => (
          <form onSubmit={handleSubmit} onReset={handleReset}>
            <div className={'flex justify-content-center'}>
              <div className={'w-full md:w-7 '}>
                <InputField name="name" label="Name" type="text" />
                <InputField name="email" label="Email" type="email" />
                <CheckboxField name={'changePassword'} label={'Edit password'} />
                {values.changePassword && (
                  <>
                    <InputField
                      name={'password'}
                      label={'Current Password'}
                      type={'password'}
                      required
                    />
                    <InputField
                      name={'newPassword'}
                      label={'New password'}
                      type={'password'}
                      required
                    />
                    <InputField
                      name={'repeatNewPassword'}
                      label={'Confirm new password'}
                      type={'password'}
                      required
                    />
                  </>
                )}
                <div className="flex gap-2 justify-content-end">
                  <Button type="reset" outlined>
                    Reset
                  </Button>
                  <Button type="submit">Save changes</Button>
                </div>
              </div>
            </div>
          </form>
        )}
      </Formik>
    </>
  );
};
