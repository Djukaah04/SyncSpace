import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../config/firebase";
import { addDoc, collection } from "firebase/firestore";
import UserInfo from "../../models/UserInfo";

interface RegisterFormInputs {
  email: string;
  password: string;
  displayName: string;
  age: number;
}

const Register = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterFormInputs>({
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const onRegister: SubmitHandler<RegisterFormInputs> = async (
    formData: RegisterFormInputs
  ) => {
    console.log("%c formData", "color: orange; font-size: 25px", formData);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      console.log("%c cred", "color: orange; font-size: 25px", cred);
      const usersCollection = collection(db, "users");

      const newUser: UserInfo = {
        uid: cred.user.uid,
        displayName: formData.displayName,
        age: formData.age,
        email: formData.email,
      };

      const querySnapshot = await addDoc(usersCollection, newUser);
    } catch (err) {
      setError("email", { type: "manual", message: "Invalid username" });
      setError("password", { type: "manual", message: "Invalid password" });
      console.log("%c Error: ", "color: red; font-size: 25px", err);
    }
  };

  const goToLogin = () => {
    navigate("/login");
  };
  return (
    <form className="form" onSubmit={handleSubmit(onRegister)}>
      <h1>Register</h1>
      <div className="form__input-row">
        <label htmlFor="register-display-name">
          Display name: <span className="asterix">*</span>
        </label>
        <input
          id="register-display-name"
          {...register("displayName", {
            required: "Email is required",
            minLength: 5,
          })}
        />
      </div>
      <div className="form__input-row">
        <label htmlFor="register-age">
          Age: <span className="asterix">*</span>
        </label>
        <input
          id="register-age"
          type="number"
          {...register("age", {
            required: "Age is required",
            min: 1,
          })}
        />
      </div>
      <div className="form__input-row">
        <label htmlFor="register-email">
          Email <span className="asterix">*</span>
        </label>
        <input
          id="register-email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
              message: "Please enter a valid email address",
            },
          })}
        />
        {errors.email && (
          <div className="error-text">{errors.email.message}</div>
        )}
      </div>
      <div className="form__input-row">
        <label htmlFor="register-password">
          Password <span className="asterix">*</span>
        </label>
        <input
          id="register-password"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters long",
            },
          })}
          type="password"
        />
        {errors.password && (
          <div className="error-text">{errors.password.message}</div>
        )}
      </div>
      <input type="submit" value="Register" />
      <button onClick={goToLogin}>Log In</button>
    </form>
  );
};

export default Register;
