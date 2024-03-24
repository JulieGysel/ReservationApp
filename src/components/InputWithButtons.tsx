import React, { useRef, useState } from 'react';

import { useField, useFormikContext } from 'formik';
import { InputText } from 'primereact/inputtext';

import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Checkbox } from 'primereact/checkbox';

import { InputButton, IconButtons } from '.';

import './InputWithButtons.css';

type Props = {
  name: string;
  label: string;
  required?: boolean;
  checkbox?: boolean;
  visible?: boolean;
  onBlur?: any;
  onChange?: any;
  onUpArrow?: any;
  onDownArrow?: any;
  popup?: any;
  icon?: any;
};

export class InputWithButtons extends React.Component<Props> {
  state = {
    popupVisible: false,
    visible: true,
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

  constructor(props: any) {
    super(props);
    this.state.checkbox = props.checkbox;
    this.state.label = props.label;
    this.state.visible = props.visible;
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

  stopEvent(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  public render() {
    // const { label, touched, errors, id, name, value, ...attributes } = this.props;
    // const err = getIn(errors, name);
    // const touch = getIn(touched, name);

    return (
      <div className="flex-auto my-3">
        <div className="mb-2">
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
            {this.state.label}
            {this.state.required && '*'}
          </label>
        </div>
        {this.state.visible && (
          <div className="input-field">
            <div className="button-area">
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
              {this.props.icon && (
                <Button
                  className={`p-trigger p-button p-button-icon-only p-component pi icon-no-label ${this.props.icon}`}
                  onClick={(e) => {
                    this.setPopupVisible(!this.state.popupVisible);
                    e.preventDefault();
                  }}
                ></Button>
              )}
              <div className="button-area-arrows">
                <InputButton
                  style={{ borderBottomRightRadius: '0' }}
                  path={IconButtons.arrowUp}
                  onClick={(e: { preventDefault: () => void }) => {
                    this.props.onUpArrow?.();
                    e.preventDefault();
                  }}
                ></InputButton>
                <InputButton
                  style={{ borderTopRightRadius: '0' }}
                  path={IconButtons.arrowDown}
                  onClick={(e: { preventDefault: () => void }) => {
                    this.props.onDownArrow?.();
                    e.preventDefault();
                  }}
                ></InputButton>
              </div>
            </div>
            <InputText
              style={{ position: 'relative', top: '0%', right: '0%', width: '12em' }}
              id={this.props.name}
              name={this.props.name}
              //   className={`input-text-lg ${touched && error && 'p-invalid'}`}
              className="input-text-lg"
              value={this.state.value}
              onChange={(e) => {
                // handleInput(e.target.value);
                this.props.onChange?.(e.target.value, false);
              }}
              // onChange={(e) => setValue(e.value)}
              onKeyUp={(event) => {
                if (event.key === 'Enter') {
                  this.props.onChange?.(this.state.value, true);
                  event.stopPropagation();
                  event.preventDefault();
                }
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
        {/* {touched && error ? <small>{error}</small> : <small>⠀</small>} */}
      </div>
    );
  }
}
