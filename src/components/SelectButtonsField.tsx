import { useField } from 'formik';
import { SelectButton, SelectButtonChangeEvent, SelectButtonProps } from 'primereact/selectbutton';
import React from 'react';

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

  const handleChange = React.useCallback(
    (e: SelectButtonChangeEvent) => {
      console.log(value, e.value);
      if (e.value) {
        setValue(e.value);
      }
    },
    [value, setValue],
  );

  return (
    <div className={`my-3`}>
      <label htmlFor={name}>
        {label}
        {required && '*'}
      </label>
      <SelectButton
        id={name}
        name={name}
        className={'pt-2 w-full'}
        value={value}
        onChange={handleChange}
        onBlur={() => setTouched(true)}
        required={required}
        options={options}
      />
    </div>
  );
};
