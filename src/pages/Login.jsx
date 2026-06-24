import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import './Login.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const navigate = useNavigate()

  // 🔐 Email Login
  const handleSubmit = async (e) => {
    e.preventDefault()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage("Login successful 🎉")
      navigate("/home")
    }
  }

  // 🔥 Google Login
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/home"
      }
    })

    if (error) {
      setMessage(error.message)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card animate-slideUp">

        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Login to continue to Connect</p>
        </div>

        {/* 🔥 Social Login */}
        <div className="social-login">
          <button 
            className="social-btn google"
            onClick={handleGoogleLogin}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" />
            Continue with Google
          </button>

          
        </div>

        <div className="divider">
          <span>or login with email</span>
        </div>

        {/* 🔐 Email Form */}
        <form onSubmit={handleSubmit} className="login-form">

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
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="forgot-link">
            <a href="#">Forgot password?</a>
          </div>

          <button type="submit" className="btn btn-primary login-btn">
            Login
          </button>
        </form>

        {/* 🔥 Message */}
        <p style={{ color: "red", marginTop: "10px" }}>{message}</p>

        <p className="signup-link">
          Don't have an account? <Link to="/signup">Create one</Link>
        </p>

      </div>
    </div>
  )
}

export default Login