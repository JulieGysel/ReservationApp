import { useField } from 'formik';
import { InputNumber } from 'primereact/inputnumber';

type NumberFieldProps = {
  name: string;
  label: string;
  min?: number;
  max?: number;
  required?: boolean;
};

export const NumberField = ({ name, label, min, max, required = false }: NumberFieldProps) => {
  const [{ value }, { error, touched }, { setTouched, setValue }] = useField(name);

  return (
    <div className="flex-auto my-3">
      <label htmlFor={name} className="mb-2 block">
        {label}
        {required && '*'}
      </label>
      <InputNumber
        id={name}
        name={name}
        className={`input-number-lg ${touched && error && 'p-invalid'}`}
        value={value}
        onValueChange={(e) => setValue(e.value)}
        onBlur={() => setTouched(true)}
        required={required}
        min={min}
        max={max}
        showButtons
      />{' '}
      {/* the empty character here prevents page jumps */}
      {touched && error ? <small>{error}</small> : <small>⠀</small>}
    </div>
  );
};
