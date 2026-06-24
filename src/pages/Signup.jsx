import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./Login.css";

const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    // 🔐 Password match
    if (password !== confirmPassword) {
      setMessage("Passwords do not match ❌");
      return;
    }

    // 🔐 Password length
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    // 🔥 SIGNUP WITH USERNAME IN METADATA
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name, // 👈 IMPORTANT
        },
      },
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    const user = data.user || data.session?.user;

    if (!user) {
      setMessage("Check your email to confirm signup 📧");
      return;
    }

    // 🔥 INSERT INTO PROFILES TABLE
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([
        {
          id: user.id,
          name: name, // 👈 USERNAME
          email,
        },
      ]);

    if (profileError) {
      console.log(profileError);
      setMessage("Signup done but profile not saved ❌");
      return;
    }

    setMessage("Signup successful 🎉 Redirecting...");

    setTimeout(() => {
      navigate("/");
    }, 1500);
  };

  return (
    <div className="login-page">
      <div className="login-card animate-slideUp">
        <div className="login-header">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <img src="/assests/logo-dark.png" alt="Brain Logo" style={{ height: "42px", objectFit: "contain" }} />
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "2rem", fontWeight: "700", color: "var(--ink)", letterSpacing: "-0.02em" }}>Connect</span>
          </div>
          <p>Join Connect and start building 🚀</p>
        </div>

        <form onSubmit={handleSignup} className="login-form">

          <div className="input-group">
            <span className="input-icon">👤</span>
            <input
              type="text"
              placeholder="Username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>



          <div className="input-group">
            <span className="input-icon">✉️</span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <span className="input-icon">🔒</span>
            <input
              type="password"
              placeholder="Strong Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <span className="input-icon">🔒</span>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary login-btn">
            Signup
          </button>
        </form>

        <p style={{ color: "red", marginTop: "10px" }}>{message}</p>

        <p className="signup-link">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;