import { useField } from 'formik';
import { Calendar } from 'primereact/calendar';

type CalendarFieldProps = {
  name: string;
  label: string;
  required?: boolean;
};

export const CalendarField = ({ name, label, required = false }: CalendarFieldProps) => {
  const [{ value }, { error, touched }, { setTouched, setValue }] = useField(name);

  return (
    <div className="flex-auto my-3">
      <label htmlFor={name} className="mb-2 block">
        {label}
        {required && '*'}
      </label>
      <Calendar
        id={name}
        name={name}
        className={`${touched && error && 'p-invalid'}`}
        value={value}
        onChange={(e) => setValue(e.value)}
        onBlur={() => setTouched(true)}
        required={required}
        timeOnly
      />{' '}
      {/* the empty character here prevents page jumps */}
      {touched && error ? <small>{error}</small> : <small>⠀</small>}
    </div>
  );
};
