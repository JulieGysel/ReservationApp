import * as Yup from 'yup';

export const loginValidationSchema = Yup.object({
  email: Yup.string()
    .required('Email address is required')
    .matches(/[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/, 'Not a valid email address.'),
  password: Yup.string().required('A password is required.'),
});

export const signupValidationSchema = Yup.object({
  email: Yup.string()
    .required('Email address is required')
    .matches(/[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/, 'Not a valid email address.'),
  password: Yup.string().required('A password is required.'),
  repeatPassword: Yup.string().required('Password confirmation is required.'),
});
