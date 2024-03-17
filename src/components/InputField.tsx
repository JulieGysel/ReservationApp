import { InputText, InputTextProps } from 'primereact/inputtext';
import { useField, useFormikContext } from 'formik';

type InputFieldProps = {
  name: string;
  label: string;
  type: InputTextProps['type'];
};

export const InputField = ({ name, label, type }: InputFieldProps) => {
  const { handleChange } = useFormikContext();
  const [, { value }] = useField(name);

  return (
    <span className="p-float-label my-5">
      <InputText
        id={name}
        name={name}
        type={type}
        className="p-3 input-text-lg w-full"
        value={value}
        onChange={handleChange}
      />
      <label htmlFor={name}>{label}</label>
    </span>
  );
};
