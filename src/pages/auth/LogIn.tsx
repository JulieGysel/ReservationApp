import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Formik, FormikValues } from 'formik';
import { Button } from 'primereact/button';
import { useAuth } from '.';
import { InputField } from '../../components';
import { loginValidationSchema } from './validationSchemas';

export const LogIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  const from = location.state?.from?.pathname || '/';
  const initialValues = { email: '', password: '' };

  const handleSubmit = (values: FormikValues) => {
    auth.signin(values.email, () => {
      values.email && navigate(from, { replace: true });
    });
  };

  return (
    <div className="flex justify-content-center p-2">
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={loginValidationSchema}
      >
        {({ handleSubmit }) => {
          return (
            <form className="w-full md:w-25rem" onSubmit={handleSubmit}>
              <InputField name="email" label="Email" type="email" required />
              <InputField name="password" label="Password" type="password" required />
              <div className="text-center">
                <Button size="large" type="submit" className="mb-4 ">
                  Login
                </Button>
              </div>
            </form>
          );
        }}
      </Formik>
    </div>
  );
};
