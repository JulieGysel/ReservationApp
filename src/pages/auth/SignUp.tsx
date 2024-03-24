import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Formik, FormikValues } from 'formik';

import { useAuth } from '.';
import { InputField } from '../../components';
import { signupValidationSchema } from './validationSchemas';

export const SignUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  const from = location.state?.from?.pathname || '/';
  const initialValues = { email: '', password: '', repeatPassword: '' };

  const handleSubmit = (values: FormikValues) => {
    auth.signin(values.email, () => {
      values.email && navigate(from, { replace: true, state: location.state });
    });
  };

  return (
    <div className="flex justify-content-center p-2">
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={signupValidationSchema}
      >
        {({ handleSubmit }) => {
          return (
            <form onSubmit={handleSubmit} className="w-full md:w-25rem">
              <InputField name="email" type="email" label="Email" required />
              <InputField name="password" type="password" label="Password" required />
              <InputField name="repeatPassword" type="password" label="Confirm Password" required />
              <div className="text-center">
                <Button size="large" type="submit" className="mb-4">
                  Sign Up
                </Button>
              </div>
            </form>
          );
        }}
      </Formik>
    </div>
  );
};
