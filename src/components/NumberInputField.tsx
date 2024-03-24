import React, { useEffect, useRef, useState } from 'react';

import { useField, useFormikContext } from 'formik';

import { InputWithButtons } from '.';

import { PrimeIcons } from 'primereact/api';
import { Slider } from 'primereact/slider';

type Props = {
  name: string;
  label: string;
  min?: number;
  max?: number;
  required?: boolean;
  checkbox?: boolean;
  visible?: boolean;
};

export const NumberInputField = ({
  name,
  label,
  min,
  max,
  checkbox = false,
  required = false,
  visible = true,
}: Props) => {
  let ref = useRef<InputWithButtons>();

  let [value, setValue] = useState(min || 0);

  useEffect(() => {
    ref.current?.setValue(value.toString());
  }, []);

  function update(n: number) {
    if (!isNaN(n)) {
      let v = clamp(n);
      if (v != value) {
        value = v;
        setValue(value);
        ref.current?.setValue(value.toString());
      }
    }
  }

  function clamp(v: number) {
    if (max) {
      v = Math.min(max, v);
    }
    if (min) {
      v = Math.max(min, v);
    }
    return v;
  }

  function increment() {
    update(value + 1);
  }

  function decrement() {
    update(value - 1);
  }

  function handleInput(str: string, finished = false) {
    if (str != '') {
      update(Number(str));
    } else {
      ref.current?.setValue('');
    }
  }

  let popup = (
    <div className="flex gap-3" style={{ fontSize: '1.4em', justifyContent: 'center' }}>
      <Slider
        value={value}
        style={{ width: '100%', margin: '0.5em 1em' }}
        onChange={(e) => {
          update(e.value);
        }}
      ></Slider>
    </div>
  );

  return (
    <InputWithButtons
      ref={ref}
      name={name}
      label={label}
      checkbox={checkbox}
      visible={visible}
      required={required}
      icon={PrimeIcons.SLIDERS_H}
      popup={popup}
      //   onBlur={() => {
      //     refHours.current?.resetStage();
      //     refMinutes.current?.resetStage();
      //   }}
      onChange={handleInput}
      onUpArrow={() => {
        increment();
      }}
      onDownArrow={() => {
        decrement();
      }}
    ></InputWithButtons>
  );
};
