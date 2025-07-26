import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { loggedIn } from '../features/auth/authSlice';

export default function SignUpPage() {
  const navigate = useNavigate();
  // const auth = useSelector((state) => state.auth.value);
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/signup', {
        email,
        name,
        password,
        role : "user"
      })
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      dispatch(loggedIn());
      navigate('/dashboard');
    } catch (error) {
        console.error("Login error:", error.message?.data?.message || error.message);
        setErrorMessage(error.response?.data?.error || error.response?.data?.message || "Something went wrong");
        setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const cardStyle = {
    width: '300px',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)'
  };

  const inputStyle = {
    width: '90%',
    padding: '8px',
    margin: '10px 0',
    borderRadius: '4px',
    border: '1px solid #ccc'
  };

  const btnStyle = {
    padding: '8px 16px',
    margin: '10px 5px 0',
    backgroundColor: '#3D74B6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '94%'
  };

  const linkStyle = {
    marginTop: '10px',
    color: '#007bff',
    cursor: 'pointer',
    fontSize: '14px'
  };

  return (
    <div style={{
      height: '86vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <form onSubmit={handleSignup} style={cardStyle}>
        <h2>Sign Up</h2>
        <input
          type="text"
          placeholder="First Name"
          style={inputStyle}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          style={inputStyle}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          style={inputStyle}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {errorMessage && <h3 style={{ color: 'red', fontSize: '14px' }}>{errorMessage}</h3>}

        <button type="submit" style={btnStyle}>Sign Up</button>
        <br />
        <button style={btnStyle} onClick={() => window.location.href = 'http://localhost:3000/auth/google'}>Sign in with Google</button>

        <div style={linkStyle} onClick={() => navigate('/login')}>
          Already have an account? Login
        </div>
      </form>
    </div>
  );
}
