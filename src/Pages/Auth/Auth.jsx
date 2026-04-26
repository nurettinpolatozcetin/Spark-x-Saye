import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../Database/Supabase";
import "./Auth.css";

function Auth({ setIsDevBypass }) {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAuth = async (e) => {
    e.preventDefault();

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      alert("Login successful!");
      navigate("/");
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (error) {
        console.log("Sign up error:", error);
        alert(error.message);
        return;
      }

      alert("Sign up successful! Please create your profile.");
      navigate("/build");

      if (error) {
        alert(error.message);
        return;
      }

      alert("Sign up successful! Please create your profile.");
      navigate("/build");
    }
  };

  return (
    <div className="auth-card">
      <h2>{isLogin ? "Login" : "Sign Up"}</h2>

      <p>
        {isLogin
          ? "Login to access Saye Collective."
          : "Create an account to start using Saye Collective."}
      </p>

      <form className="auth-form" onSubmit={handleAuth}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button className="auth-submit-btn" type="submit">
          {isLogin ? "Login" : "Sign Up"}
        </button>

        <button
          type="button"
          className="switch-auth-btn"
          onClick={() => setIsDevBypass(true)}
        >
          Continue as Demo User
        </button>
      </form>

      <button
        className="switch-auth-btn"
        type="button"
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin
          ? "Don't have an account? Sign Up"
          : "Already have an account? Login"}
      </button>
    </div>
  );
}

export default Auth;
