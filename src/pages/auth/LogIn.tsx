import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '.';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

export const LogIn = () => {
  let navigate = useNavigate();
  let location = useLocation();
  let auth = useAuth();

  let from = location.state?.from?.pathname || '/';

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let formData = new FormData(event.currentTarget);
    let username = formData.get('email') as string;

    auth.signin(username, () => {
      username && navigate(from, { replace: true });
    });
  }

  return (
    <div className="flex justify-content-center p-2">
      <form onSubmit={handleSubmit} className="text-center w-full md:w-25rem">
        <span className="p-float-label my-5">
          <InputText id="email" name="email" type="text" className="p-3 input-text-lg w-full" />
          <label htmlFor="email">Email</label>
        </span>
        <span className="p-float-label my-5">
          <InputText
            id="password"
            name="password"
            type="password"
            className="p-3 input-text-lg w-full"
          />
          <label htmlFor="password">Password</label>
        </span>
        <Button size="large" type="submit" className="mb-4">
          Login
        </Button>
      </form>
    </div>
  );
};
