import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../../services/auth.service.js';

function LoginForm() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    authService.login(data.email, data.password).then(() => {
      navigate("/");
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        name="email"
        type="email"
        {...register("email", { required: true })}
      />
      <input
        type="password"
        name="password"
        {...register("password", { required: true })}
      />
      {errors.exampleRequired && <span>This field is required</span>}
      <input type="submit" />
    </form>
  );
}

export default LoginForm;
