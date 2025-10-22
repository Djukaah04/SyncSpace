import React, { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import "./Login.scss";

interface LoginFormInputs {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormInputs>({
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const onLogIn: SubmitHandler<LoginFormInputs> = async (formData) => {
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate("/");
    } catch (err) {
      setError("email", { type: "manual", message: "Invalid email" });
      setError("password", { type: "manual", message: "Invalid password" });
    }
  };

  const goToRegister = () => navigate("/register");

  useEffect(() => {
    if (user) navigate("/");
  }, [navigate, user]);

  return (
    <div className="login-page">
      <form className="form" onSubmit={handleSubmit(onLogIn)}>
        <h1>Log In</h1>

        <div className="form__input-row">
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

        <div className="form__input-row">
          <label htmlFor="login-password">
            Password <span className="asterix">*</span>
          </label>
          <input
            id="login-password"
            type="password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters long",
              },
            })}
            placeholder="Password"
          />
          {errors.password && (
            <div className="error-text">{errors.password.message}</div>
          )}
        </div>

        <input type="submit" value="Login" className="login-btn" />

        <button type="button" onClick={goToRegister} className="register-link">
          Don't have an account? Register
        </button>

        <div className="or-login-with">
          <span className="or-login-with__line"></span>
          <span className="or-login-with__text">or</span>
        </div>

        <button type="button" className="google-option">
          Login with Google
        </button>
      </form>
    </div>
  );
};

export default Login;
