import { useState } from "react";
import { api } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email:"", password:"" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg("");
    try {
      const data = await api("/api/auth/login", { method:"POST", body: form });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      nav("/dashboard");
    } catch (err) {
      setMsg(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{maxWidth:420, margin:"40px auto"}}>
      <h2>התחברות</h2>
      <form onSubmit={submit} style={{display:"grid", gap:10}}>
        <input name="email" type="email" placeholder="אימייל" value={form.email} onChange={onChange} required />
        <input name="password" type="password" placeholder="סיסמה" value={form.password} onChange={onChange} required />
        <button disabled={loading}>{loading ? "בודקת..." : "התחברי"}</button>
      </form>
      <p style={{color:"crimson"}}>{msg}</p>
      <p>אין לך חשבון? <Link to="/register">הרשמה</Link></p>
    </div>
  );
}
