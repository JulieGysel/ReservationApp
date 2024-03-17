import * as Yup from 'yup';

export const resourceValidationSchema = Yup.object({
  name: Yup.string().required('A name is required.'),
});
