import React, { useRef, useState } from 'react';

import { useField, useFormikContext } from 'formik';

import { SvgRoundButton, SvgIcons, InputWithButtons } from '.';

import { PrimeIcons } from 'primereact/api';

import './TimeInputField.css';

type PopupTimeColumnProps = {
  min: number;
  max: number;
  onChange?: any;
};

const zeroPad = (num: any, places: number) => String(num).padStart(places, '0');

class PopupTimeColumn extends React.Component<PopupTimeColumnProps> {
  state = {
    stage: '',
    value: 0,
  };

  keyStrokeTimeout: any;
  ref: any;

  constructor(props: any) {
    super(props);
    this.ref = React.createRef<HTMLDivElement>();
  }

  numberInput(digit: string) {
    let stage = this.state.stage.length >= 2 ? digit : this.state.stage + digit;
    this.setState({ stage: stage });
    this.setValue(Number(stage));
    window.clearTimeout(this.keyStrokeTimeout);
    this.keyStrokeTimeout = setTimeout(() => {
      this.resetStage();
    }, 500);
  }

  public resetStage() {
    this.setState({ stage: '' });
  }

  public reset() {
    this.setState({ stage: '', value: this.props.min });
    this.props.onChange?.(this.props.min);
  }

  public setValue(value: any) {
    if (this.state.value !== value) {
      this.setState({ value: value });
      this.props.onChange?.(value);
    }
  }

  increment() {
    let value = this.state.value == this.props.max ? this.props.min : this.state.value + 1;
    this.setState({ value: value });
    this.props.onChange?.(value);
  }

  decrement() {
    let value = this.state.value == this.props.min ? this.props.max : this.state.value - 1;
    this.setState({ value: value });
    this.props.onChange?.(value);
  }

  public render() {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          alignContent: 'center',
        }}
      >
        {SvgRoundButton({
          path: SvgIcons.arrowUp,
          name: 'arrow-button',
          onClick: (e: { preventDefault: () => void }) => {
            this.increment();
          },
        })}
        <div
          ref={this.ref}
          className="time-input-col no-highlights"
          onKeyDown={(e) => {
            switch (e.key) {
              case 'Backspace':
                this.reset();
                break;
              case 'ArrowUp':
                this.increment();
                break;
              case 'ArrowDown':
                this.decrement();
                break;
              default:
                if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
                  this.numberInput(e.key);
                }
                break;
            }
            e.stopPropagation();
            e.preventDefault();
          }}
          onKeyUp={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onMouseDown={(e) => {
            this.ref.current?.focus();
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          {zeroPad(this.state.value, 2)}
        </div>
        {SvgRoundButton({
          path: SvgIcons.arrowDown,
          name: 'arrow-button',
          onClick: (e) => {
            this.decrement();
          },
        })}
      </div>
    );
  }
}

type Props = {
  name: string;
  label: string;
  required?: boolean;
  checkbox?: boolean;
  visible?: boolean;
  buttonsVisible?: boolean;
};

export const TimeInputField = ({
  name,
  label,
  checkbox = false,
  required = false,
  visible = true,
  buttonsVisible = true,
}: Props) => {
  let time = new Date('1 Jan 1970 00:30:00');
  const minuteStep = 15;

  const [hours, setHours] = useState(time.getHours());
  const [minutes, setMinutes] = useState(time.getMinutes());

  let refHours = useRef<PopupTimeColumn>();
  let refMinutes = useRef<PopupTimeColumn>();

  React.useEffect(() => {
    time.setHours(hours);
    time.setMinutes(minutes);
    refHours.current?.setValue(hours);
    refMinutes.current?.setValue(minutes);
    updateTime();
  }, [hours, minutes]);

  function updateTime() {
    let t = zeroPad(hours, 2) + ':' + zeroPad(minutes, 2);
    ref.current?.setValue(t);
  }

  function setTime(t) {
    time = t;
    updateTime();
    setHours(t.getHours());
    setMinutes(t.getMinutes());
  }

  let popup = (
    <div
      className="flex gap-1"
      style={{ fontSize: '1.4em', justifyContent: 'center' }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={(e) => {
        // ref.current?.focus();
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <PopupTimeColumn
        ref={refHours}
        min={0}
        max={23}
        onChange={(value: React.SetStateAction<number>) => {
          setHours(value);
        }}
      ></PopupTimeColumn>
      <div style={{ display: 'flex', alignItems: 'center' }}>:</div>
      <PopupTimeColumn
        ref={refMinutes}
        min={0}
        max={59}
        onChange={(value: React.SetStateAction<number>) => {
          setMinutes(value);
        }}
      ></PopupTimeColumn>
    </div>
  );

  function handleInput(value: string, finished = false) {
    let t = new Date('1970-01-01T' + value);
    if (!isNaN(t.getTime())) {
      time = t;
      setHours(t.getHours());
      setMinutes(t.getMinutes());
      updateTime();
    } else {
      if (finished) {
        value = '';
      }
    }
    ref.current?.setValue(value);
  }

  //   const [{ value }, { error, touched }, { setTouched, setValue }] = useField(name);
  //   const { handleChange } = useFormikContext();

  let ref = useRef<InputWithButtons>();

  return (
    <InputWithButtons
      ref={ref}
      name={name}
      label={label}
      checkbox={checkbox}
      visible={visible}
      buttonsVisible={buttonsVisible}
      required={required}
      popup={popup}
      icon={PrimeIcons.CALENDAR}
      onBlur={() => {
        refHours.current?.resetStage();
        refMinutes.current?.resetStage();
      }}
      onChange={handleInput}
      onUpArrow={() => {
        setTime(new Date(time.getTime() + minuteStep * 60000));
      }}
      onDownArrow={() => {
        setTime(new Date(time.getTime() - minuteStep * 60000));
      }}
    ></InputWithButtons>
  );
};
