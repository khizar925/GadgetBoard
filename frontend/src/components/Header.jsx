import { useDispatch } from 'react-redux'
import {useNavigate} from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png'
import {loggedOut} from "../features/auth/authSlice.js";
export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  const Logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch(loggedOut());
    navigate('/');
  }

  return (
  <div style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    fontSize: "18px",
    fontWeight: "bold",
    borderBottom: "1px solid #ccc"
  }}>
    <div>Khizar Todo</div>

    <div style={{ display: "flex", gap: "20px" }}>
      <Link style={{textDecoration: 'none', color: "#3D74B6"}} to="/">Home</Link>
      <Link style={{textDecoration: 'none', color: "#3D74B6"}} to="/about">About</Link>
      <Link style={{textDecoration: 'none', color: "#3D74B6"}} to="/contact">Contact Us</Link>
    </div>

    {!isDashboard ? (<div>
      <img src={logo} alt="Logo" style={{ width: '40px', height: '40px' }} />
    </div>) : (<button className={"btn btn-primary"} onClick={Logout}>Logout</button>)}
  </div>
);

}
