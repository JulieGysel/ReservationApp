import React from 'react';

import { Button } from 'primereact/button';
import { PrimeIcons } from 'primereact/api';
import { InputText } from 'primereact/inputtext';

import { useFormik } from 'formik';

import './Whitelist.css';

const validate = (email: string) => {
  if (!email) {
    return false;
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
    return false;
  }
  return true;
};

export class Whitelist extends React.Component {
  state = {
    users: [''],
    text: '',
    ok: false,
  };

  constructor(props: {} | Readonly<{}>) {
    super(props);
  }

  componentDidMount(): void {
    this.setState({
      users: ['somebody@gmail.com', 'friend1@gmail.com'],
    });
  }

  public render() {
    return (
      <div className="whitelist">
        {this.state.users.map((x, i) => {
          return (
            <div className="whitelist-user" key={'user_' + i}>
              <div className="text">{x}</div>
              <Button
                onClick={() => {
                  let users = this.state.users;
                  users.splice(i, 1);
                  this.setState({
                    users: users,
                  });
                }}
                className={`pi button-secondary icon-no-label ${PrimeIcons.TRASH}`}
              ></Button>
            </div>
          );
        })}

        <div className="add-area">
          <div className="flex flex-column gap-1">
            <label style={{ fontSize: '0.9em' }} htmlFor={'add-user-input'}>
              Email
            </label>
            <InputText
              value={this.state.text}
              id="add-user-input"
              name="add-user-input"
              onChange={(e) =>
                this.setState({
                  text: e.target.value,
                  ok: validate(e.target.value),
                })
              }
            ></InputText>
          </div>
          <span style={{ flexGrow: '1' }}></span>
          <div className="flex" style={{ alignItems: 'end' }}>
            <Button
              className={`pi add-button icon-no-label ${PrimeIcons.CHECK}`}
              onClick={() => {
                let users = this.state.users;
                users.push(this.state.text);
                this.setState({
                  users: users,
                  text: '',
                  ok: false,
                });
              }}
              disabled={!this.state.ok}
            ></Button>
          </div>
        </div>
      </div>
    );
  }
}
