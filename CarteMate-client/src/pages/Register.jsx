import { useState } from "react";
import { api } from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ name:"", email:"", password:"", phone:"" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg("");
    try {
      await api("/api/auth/register", { method:"POST", body: form });
      setMsg("נרשמת בהצלחה ✅ אפשר להתחבר");
      setTimeout(() => nav("/login"), 700);
    } catch (err) {
      setMsg(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{maxWidth:420, margin:"40px auto"}}>
      <h2>הרשמה</h2>
      <form onSubmit={submit} style={{display:"grid", gap:10}}>
        <input name="name" placeholder="שם" value={form.name} onChange={onChange} required />
        <input name="email" type="email" placeholder="אימייל" value={form.email} onChange={onChange} required />
        <input name="phone" placeholder="טלפון" value={form.phone} onChange={onChange} required />
        <input name="password" type="password" placeholder="סיסמה" value={form.password} onChange={onChange} required />
        <button disabled={loading}>{loading ? "שולח..." : "הרשמה"}</button>
      </form>
      <p>{msg}</p>
      <p>כבר יש לך חשבון? <Link to="/login">התחברי</Link></p>
    </div>
  );
}
