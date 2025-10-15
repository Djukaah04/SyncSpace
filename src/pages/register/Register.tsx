import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import { auth, db, storage } from "../../config/firebase";
import { SubmitHandler, useForm } from "react-hook-form";
import React, { ChangeEvent, useState } from "react";
import UserStatus from "../../enums/UserStatus";
import { useNavigate } from "react-router-dom";
import UserInfo from "../../models/UserInfo";

interface RegisterFormInputs {
  email: string;
  password: string;
  displayName: string;
  age: number;
  picture: File;
}

const Register = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | undefined>(undefined);
  const [preview, setPreview] = useState<string | null>(null);

  const maxFileSize = 2 * 1024 * 1024; // 2MB

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<RegisterFormInputs>({
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileToAdd = e.target.files[0];

      if (fileToAdd.size > maxFileSize) {
        setError("picture", {
          type: "manual",
          message: "File size should not exceed 2MB",
        });
        setPreview(null);
        setFile(undefined);
        return;
      }

      clearErrors("picture");
      setPreview(URL.createObjectURL(fileToAdd));
      setFile(fileToAdd);
    }
  };

  const uploadProfilePicture = async (userId: string) => {
    if (!file) return;

    try {
      const storageRef = ref(storage, `profilePictures/${userId}`);
      await uploadBytes(storageRef, file);
      const photoUrl = await getDownloadURL(storageRef);

      const userRef = doc(db, "users", userId);
      await setDoc(userRef, { photoUrl }, { merge: true });
    } catch (err) {
      throw new Error("Greska pri postavljanju profilne slike." + err);
    }
  };

  const getRandomColor = (): string => {
    return `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")}`;
  };

  const onRegister: SubmitHandler<RegisterFormInputs> = async (
    formData: RegisterFormInputs
  ) => {
    console.log("%c formData", "color: orange; font-size: 25px", formData);
    try {
      console.log("%c auth", "color: orange; font-size: 25px", auth);
      const cred = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const usersCollection = collection(db, "users");

      const newUser: UserInfo = {
        id: cred.user.uid,
        displayName: formData.displayName,
        age: formData.age,
        email: formData.email,
        status: UserStatus.OFFLINE,
        color: getRandomColor(),
      };

      await setDoc(doc(usersCollection, newUser.id), newUser);
      uploadProfilePicture(cred.user.uid);
    } catch (err) {
      setError("email", { type: "manual", message: "Invalid username" });
      setError("password", { type: "manual", message: "Invalid password" });
      throw new Error("Greska pri registraciji korisnika." + err);
    }
  };

  const goToLogin = () => {
    navigate("/login");
  };
  return (
    <form className="form register-form" onSubmit={handleSubmit(onRegister)}>
      <img
        onClick={goToLogin}
        className="back-logo"
        src="assets/svg/back.svg"
        alt="back-logo"
      />
      <h1 className="register-form__title">Register</h1>
      <div className="form__input-row">
        <label htmlFor="register-display-name">
          Display name: <span className="asterix">*</span>
        </label>
        <input
          id="register-display-name"
          {...register("displayName", {
            required: "Display name is required",
            minLength: {
              value: 5,
              message: "Minimum length is 5",
            },
          })}
        />
        <div className="error-text">{errors.displayName?.message}</div>
      </div>
      <div className="form__input-row">
        <label htmlFor="register-age">Age:</label>
        <input
          id="register-age"
          type="number"
          min={0}
          {...register("age", {
            min: {
              value: 18,
              message: "You must be over 18 years old",
            },
          })}
        />
        <div className="error-text">{errors.age?.message}</div>
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

        <div className="error-text">{errors.email?.message}</div>
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

        <div className="error-text">{errors.password?.message}</div>
      </div>
      <div className="form__input-row">
        <label htmlFor="register-picture" className="picture-upload">
          <img
            src="assets/svg/upload.svg"
            className="upload-logo"
            alt="upload-logo"
          />
          <p>Upload Picture</p>
        </label>
        <input
          id="register-picture"
          {...register("picture", {
            required: "Picture is required",
          })}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        <div className="profile-preview-container">
          {preview && <img src={preview} alt="profile-preview" />}
        </div>

        <div className="error-text">{errors.picture?.message}</div>
      </div>
      <div className="register-container">
        <input className="register" type="submit" value="REGISTER" />
      </div>
    </form>
  );
};

export default Register;
