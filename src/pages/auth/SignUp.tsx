import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Formik, FormikValues } from 'formik';

import { useAuth } from '.';
import { InputField } from '../../components';

export const SignUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  const from = location.state?.from?.pathname || '/';
  const initialValues = { email: '', password: '', repeatPassword: '' };

  const handleSubmit = (values: FormikValues) => {
    auth.signin(values.email, () => {
      values.email && navigate(from, { replace: true });
    });
  };

  return (
    <div className="flex justify-content-center p-2">
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ handleSubmit }) => {
          return (
            <form onSubmit={handleSubmit} className="text-center w-full md:w-25rem">
              <InputField name="email" type="email" label="Email" />
              <InputField name="password" type="password" label="Password" />
              <InputField name="repeatPassword" type="password" label="Confirm Password" />
              <Button size="large" type="submit" className="mb-4">
                Sign Up
              </Button>
            </form>
          );
        }}
      </Formik>
    </div>
  );
};
