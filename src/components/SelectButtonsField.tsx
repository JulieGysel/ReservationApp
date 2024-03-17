import { useField } from 'formik';
import { SelectButton, SelectButtonProps } from 'primereact/selectbutton';

type SelectButtonsFieldProps = {
  name: string;
  label: string;
  options: SelectButtonProps['options'];
  required?: boolean;
};

export const SelectButtonsField = ({
  name,
  label,
  options,
  required = false,
}: SelectButtonsFieldProps) => {
  const [{ value }, , { setTouched, setValue }] = useField(name);

  return (
    <div className="my-3">
      <label htmlFor={name}>
        {label}
        {required && '*'}
      </label>
      <SelectButton
        id={name}
        name={name}
        className={'py-3 w-full'}
        value={value}
        onChange={(e) => setValue(e.value)}
        onBlur={() => setTouched(true)}
        required={required}
        options={options}
      />
    </div>
  );
};
