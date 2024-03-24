import { useField, useFormikContext } from 'formik';
import { InputTextarea } from 'primereact/inputtextarea';

type TextAreaFieldProps = {
  name: string;
  label: string;
  required?: boolean;
};

export const TextAreaField = ({ name, label, required = false }: TextAreaFieldProps) => {
  const { handleChange } = useFormikContext();
  const [{ value }, { error, touched }, { setTouched }] = useField(name);

  return (
    <div className="my-3">
      <label htmlFor={name}>
        {label}
        {required && '*'}
      </label>
      <InputTextarea
        id={name}
        name={name}
        className={`p-3 input-text-lg w-full ${touched && error && 'p-invalid'}`}
        value={value}
        onChange={handleChange}
        onBlur={() => setTouched(true)}
        required={required}
        autoResize
        rows={2}
        cols={30}
      />
      {/* the empty character here prevents page jumps */}
      {touched && error ? <small>{error}</small> : <small>⠀</small>}
    </div>
  );
};
