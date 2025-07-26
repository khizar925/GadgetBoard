import axios from "axios";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { useDispatch } from "react-redux";
import { loggedOut } from '../features/auth/authSlice';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState("");

  const handleDelete = async () => {
    if (!email) return setMessage("Enter an email");

    try {
      const res = await axios.delete(`http://localhost:3000/delete/${email}`);
      setMessage(res.data.message);
      setTimeout(function () {
        setMessage("")
      }, 3000);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setMessage(err.response.data.message);
        setTimeout(function () {
          setMessage("")
        }, 3000);
      } else {
        setMessage("Failed to delete user");
        setTimeout(function () {
          setMessage("")
        }, 3000);
      }
    }

  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch(loggedOut());
    navigate("/");
  }
  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Admin Dashboard</h2>

      <input
        type="email"
        placeholder="Enter user email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
        required
      />
      <p>{message}</p>
      <button onClick={handleDelete} style={styles.buttonDelete}>
        Delete User
      </button>
      <button onClick={handleLogout} style={styles.button}>
        Logout
      </button>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  heading: {
    marginBottom: '10px',
    fontSize: '28px',
    color: '#333',
  },
  input: {
    padding: '10px',
    width: '300px',
    fontSize: '16px',
    borderRadius: '6px',
    border: '1px solid #ccc',
  },
  buttonBlock: {
    padding: '10px 20px',
    width: '320px',
    fontSize: '16px',
    backgroundColor: '#ff9800',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  button: {
    padding: '10px 20px',
    width: '320px',
    fontSize: '16px',
    backgroundColor: '#3D74B6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  buttonDelete: {
    padding: '10px 20px',
    width: '320px',
    fontSize: '16px',
    backgroundColor: '#f44336',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};