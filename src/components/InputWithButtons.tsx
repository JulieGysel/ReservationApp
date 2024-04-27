import React, { useRef, useState } from 'react';

import { useField, useFormikContext, getIn } from 'formik';
import { InputText } from 'primereact/inputtext';

import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Checkbox } from 'primereact/checkbox';

import { PrimeIcons } from 'primereact/api';

import './InputWithButtons.css';

type Props = {
  name: string;
  label: string;
  id: string;
  value?: string;
  touched: any;
  errors: any;
  required?: boolean;
  checkbox?: boolean;
  visible?: boolean;
  buttonsVisible?: boolean;
  onBlur?: any;
  onChange?: any;
  onUpArrow?: any;
  onDownArrow?: any;
  popup?: any;
  icon?: any;
};

function InputButton(props: { [x: string]: any }) {
  return (
    <Button
      className={
        'p-inputnumber-button p-button button-secondary p-button-icon-only p-component ' +
        props['className']
      }
      tabIndex={-1}
      aria-hidden="true"
      style={props['style']}
      onClick={props['onClick']}
    ></Button>
  );
}

export class InputWithButtons extends React.Component<Props> {
  state = {
    popupVisible: false,
    visible: true,
    buttonsVisible: true,
    checkbox: false,
    required: false,
    label: '',
    value: '',
  };

  // checkboxRef = useRef<typeof CheckboxField>();

  //   handleChange = value => {
  //     const { name, onChange } = this.props;
  //     onChange(name, value.target.value);
  //   };

  //   handleBlur = () => {
  //     const { name, onBlur } = this.props;
  //     if (onBlur) {
  //       onBlur(name, true);
  //     }
  //   };

  ref: any;

  constructor(props: any) {
    super(props);
    this.state.checkbox = props.checkbox;
    this.state.label = props.label;
    this.state.visible = props.visible;
    this.state.buttonsVisible = props.buttonsVisible;

    this.ref = React.createRef<typeof InputText>();
  }

  public setVisible(checked: boolean) {
    this.setState({ visible: checked });
  }

  setPopupVisible(value: boolean) {
    this.setState({ popupVisible: value });
  }

  public setValue(value: string) {
    this.setState({ value: value });
  }

  public focus() {
    this.ref.current?.focus();
  }

  stopEvent(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  public render() {
    const { label, touched, errors, id, name, value } = this.props;
    const error = getIn(errors, name);
    const touch = getIn(touched, name);

    return (
      <div className="mt-2">
        <div className="mb-1">
          {this.state.checkbox && (
            <Checkbox
              name={this.props.name + '-checkbox input-field-checkbox'}
              className={`mr-2`}
              onChange={(e) => {
                this.setState({
                  visible: e.checked,
                });
              }}
              checked={this.state.visible}
            />
          )}
          <label htmlFor={this.props.name + (this.state.checkbox ? '-checkbox' : '')}>
            {label}
            {this.state.required && '*'}
          </label>
        </div>
        {this.state.visible && (
          <div className="input-field">
            {this.props.popup && (
              <Card
                style={{
                  position: 'absolute',
                  top: '100%',
                  width: '100%',
                  visibility: this.state.popupVisible ? 'visible' : 'hidden',
                  zIndex: 3,
                }}
                // tabIndex={1}
                // onBlur={() => {
                //   this.setPopupVisible(false);
                // }}
                pt={{
                  body: { style: { padding: '0' } },
                  content: {
                    style: { padding: '1em 0', pointerEvents: 'all' },
                  },
                }}
              >
                {this.props.popup}
              </Card>
            )}
            {this.state.buttonsVisible && (
              <div className="button-area">
                {this.props.icon && (
                  <Button
                    className={`p-trigger p-button button-secondary p-button-icon-only p-component pi icon-no-label ${this.props.icon}`}
                    onClick={(e) => {
                      this.setPopupVisible(!this.state.popupVisible);
                      e.preventDefault();
                    }}
                  ></Button>
                )}
                <InputButton
                  className={PrimeIcons.MINUS}
                  style={{ borderBottomRightRadius: '0', borderTopRightRadius: '0' }}
                  onClick={(e: { preventDefault: () => void }) => {
                    this.props.onDownArrow?.();
                    e.preventDefault();
                  }}
                ></InputButton>
                <InputButton
                  className={PrimeIcons.PLUS}
                  onClick={(e: { preventDefault: () => void }) => {
                    this.props.onUpArrow?.();
                    e.preventDefault();
                  }}
                ></InputButton>
              </div>
            )}
            <InputText
              ref={this.ref}
              style={this.state.buttonsVisible ? { paddingRight: '4em' } : {}}
              id={this.props.name}
              name={this.props.name}
              className="input-text-lg"
              value={this.state.value}
              onChange={(e) => {
                this.props.onChange?.(e.target.value, false);
              }}
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  this.props.onChange?.(this.state.value, true);
                  e.stopPropagation();
                  e.preventDefault();
                }
              }}
              onClick={(e) => {
                if (this.state.popupVisible == false) {
                  this.setState({
                    popupVisible: true,
                  });
                }
                e.stopPropagation();
                e.preventDefault();
              }}
              onBlur={(e) => {
                this.props.onBlur?.();
                this.props.onChange?.(this.state.value, true);
                this.setPopupVisible(false);
                // setTouched(true);
              }}
              // required={required}
            />{' '}
          </div>
        )}
        {/* the empty character here prevents page jumps */}
        {touch && error ? <small>{error}</small> : <small>⠀</small>}
      </div>
    );
  }
}
