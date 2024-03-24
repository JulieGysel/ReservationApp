import * as Yup from 'yup';

export const profileValidationSchema = Yup.object({
  email: Yup.string()
    .required('Email address is required')
    .matches(/[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/, 'Not a valid email address.'),
  name: Yup.string(),
  password: Yup.string().required('Current password is required.'),
  newPassword: Yup.string().required('New password is required.'),
  repeatNewPassword: Yup.string().required('New password confirmation is required.'),
});
