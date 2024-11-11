import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import "../styles/Login.scss";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import { useNavigate } from "react-router-dom";

interface LoginFormInputs {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormInputs>({
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const onLogIn: SubmitHandler<LoginFormInputs> = async (
    formData: LoginFormInputs
  ) => {
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate("/");
    } catch (err) {
      setError("email", { type: "manual", message: "Invalid username" });
      setError("password", { type: "manual", message: "Invalid password" });
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit(onLogIn)}>
      <div className="login-form__input-row">
        <label htmlFor="login-email">
          Email <span className="asterix">*</span>
        </label>
        <input
          id="login-email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
              message: "Please enter a valid email address",
            },
          })}
          placeholder="Email"
        />
        {errors.email && (
          <div className="error-text">{errors.email.message}</div>
        )}
      </div>
      <div className="login-form__input-row">
        <label htmlFor="login-password">
          Password <span className="asterix">*</span>
        </label>
        <input
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters long",
            },
          })}
          type="password"
          placeholder="Password"
        />
        {errors.password && (
          <div className="error-text">{errors.password.message}</div>
        )}
      </div>
      <input type="submit" value="Login" />
      <div className="login-form__or-login-with">
        <span className="or-login-with__line"></span>
        <span className="or-login-with__text">or</span>
      </div>
      <button className="login-form__google-option">Login with Google</button>
    </form>
  );
};

export default Login;
