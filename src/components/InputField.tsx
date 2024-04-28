import { InputText, InputTextProps } from 'primereact/inputtext';
import { useField, useFormikContext } from 'formik';

type InputFieldProps = {
  name: string;
  label: string;
  type: InputTextProps['type'];
  required?: boolean;
};

export const InputField = ({ name, label, type, required = false }: InputFieldProps) => {
  const { handleChange } = useFormikContext();
  const [{ value }, { error, touched }, { setTouched }] = useField(name);

  return (
    <div className="mt-2">
      <label htmlFor={name}>
        {label}
        {required && '*'}
      </label>
      <InputText
        id={name}
        name={name}
        type={type}
        className={`p-3 input-text-lg w-full ${touched && error && 'p-invalid'}`}
        value={value}
        onChange={handleChange}
        onBlur={() => setTouched(true)}
        required={required}
      />
      {/* the empty character here prevents page jumps */}
      {touched && error ? <small>{error}</small> : <small>⠀</small>}
    </div>
  );
};
