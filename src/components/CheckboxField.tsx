import { useField } from 'formik';
import { Checkbox } from 'primereact/checkbox';

type CheckboxFieldProps = {
  name: string;
  label: string;
  required?: boolean;
};

export const CheckboxField = ({ name, label, required = false }: CheckboxFieldProps) => {
  const [{ value }, , { setTouched, setValue }] = useField(name);

  return (
    <div className="my-3">
      <Checkbox
        inputId={name}
        name={name}
        className={`mr-2`}
        onChange={(e) => setValue(e.checked)}
        onBlur={() => setTouched(true)}
        required={required}
        checked={value}
      />
      <label htmlFor={name}>
        {label}
        {required && '*'}
      </label>
    </div>
  );
};
