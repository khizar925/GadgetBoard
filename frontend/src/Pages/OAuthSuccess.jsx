import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loggedIn } from '../features/auth/authSlice';

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const id = params.get("id");
    const name = params.get("name");
    const email = params.get("email");
    const role = params.get("role");

    if (!token || !email) return;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify({ id, name, email, role }));
    dispatch(loggedIn({ name, email }));
    navigate("/dashboard");
  }, []);


  return <p>Signing you in with Google...</p>;
}
