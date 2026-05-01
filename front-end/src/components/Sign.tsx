import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { isAxiosError } from "axios";
import * as authApi from "../api/auth";

export default function Sign({ text }: { text?: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setLoader(true);
      const user = await authApi.signin({ email, password });
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/");
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.status === 401) {
        setError("Incorrect credentials. Please check your email or password.");
      } else {
        setError("An error occurred during login. Please try again later.");
      }
    } finally {
      setLoader(false);
    }
  };

  const handleRegister = async () => {
    try {
      setLoader(true);
      const user = await authApi.signup({ name, email, password });
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/");
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setError("This email is already associated with an account.");
      } else {
        setError("An error occurred during registration. Please try again.");
      }
    } finally {
      setLoader(false);
    }
  };

  const handleClose = () => {
    setError("");
  };

  return (
    <div className="">
      <h1 className="mt-16 p-3 text-center text-4xl font-[Oswald] uppercase sm:text-5xl md:text-7xl">
        {text ? "Welcome Back" : "Welcome to Second Brain"}
      </h1>

      <div className="mt-4 flex w-full flex-col items-center justify-center">
        {error && (
          <div className="mb-5 flex items-center justify-between rounded-xl border-2 border-red-900 bg-red-400 px-3 py-2">
            <span className="flex items-center gap-2 text-xl font-semibold tracking-wide text-red-700">
              {error}
            </span>
            <button className="px-2 font-semibold text-red-800" type="button" onClick={handleClose}>
              ✕
            </button>
          </div>
        )}

        <div className="flex w-[450px] max-w-[95vw] flex-col gap-3 rounded-lg border p-5 py-10 shadow-xl">
          <h1 className="text-center text-3xl font-bold text-purple-700">
            {text ? "Log in to your Account " : "Create New Account"}
          </h1>

          {!text && (
            <>
              <label className="text-lg font-medium" htmlFor="name">
                Enter Your Name:
              </label>
              <input
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                value={name}
                id="name"
                className="rounded-lg border-zinc-600 px-4 py-2 focus:outline-purple-400"
                type="text"
                placeholder="Enter Your Name"
              />
            </>
          )}

          <label className="text-lg font-medium" htmlFor="email">
            Enter Your Email:
          </label>
          <input
            id="email"
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            value={email}
            className="rounded-lg border-zinc-600 px-4 py-2 focus:outline-purple-400"
            type="email"
            placeholder="Enter Your email"
          />

          <label className="text-lg font-medium" htmlFor="pass">
            Enter Your Password:
          </label>
          <input
            id="pass"
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            value={password}
            className="rounded-lg border-zinc-600 px-4 py-2 focus:outline-purple-400"
            type="password"
            placeholder="Enter Your Password"
          />

          <button
            disabled={loader}
            type="button"
            onClick={() => void (text ? handleLogin() : handleRegister())}
            className={`rounded-full bg-purple-500 px-7 py-3 font-bold text-white hover:text-white sm:text-xl ${
              loader ? "opacity-50" : ""
            }`}
          >
            {loader ? <span>Loading...</span> : <span>{!text ? "Create Account" : "Log In"}</span>}
          </button>

          <p className="text-center">
            {text ? "" : "Already Have an Account?"}{" "}
            <a className="text-purple-400 underline" href={!text ? "/login" : "/register"}>
              {text ? "Create New Account" : "Sign in"}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
