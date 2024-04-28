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
    <div className="my-3">
      <InputText
        id={name}
        name={name}
        placeholder={`${label}${required ? '*' : ''}`}
        type={type}
        className={`p-3 w-full ${touched && error && 'p-invalid'}`}
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
