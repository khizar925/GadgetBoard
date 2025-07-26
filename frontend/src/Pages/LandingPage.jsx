import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { loggedOut } from '../features/auth/authSlice';

export default function LandingPage() {
  const auth = useSelector((state) => state.auth.value);
  const dispatch = useDispatch()
  const navigate = useNavigate();
  const redirectLogin = () => {
    navigate("/login");
  }
  const redirectSignup = () => {
    navigate("/signup");
  }
  const redirectDashboard = () => {
    navigate("/dashboard");
  }

  const Logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch(loggedOut());
  }
  const btnStyle = {
    padding: '8px 16px',
    margin: '5px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  };
  return (
    <div style={{ height: "86vh", display: "flex", justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h1>Welcome to my Todo-List</h1>
        <p style={{ fontSize: "20px" }}>Your Simple, fast, and efficient Todo Manager.</p>
        {!auth && <div>
          <button onClick={redirectLogin} style={btnStyle}>Login</button>
          <button style={btnStyle} onClick={() => window.location.href = 'http://localhost:3000/auth/google'}>Sign in with Google</button>

          <button onClick={redirectSignup} style={btnStyle}>Signup</button>
        </div>}

        {auth && <div>
          <button onClick={redirectDashboard} style={btnStyle}>Dashboard</button>
          <button onClick={Logout} style={btnStyle}>Logout</button>
        </div>}
        <p style={{ fontSize: "20px" }}>Organize your life, one task at a time</p>
      </div>
    </div>
  )
}
