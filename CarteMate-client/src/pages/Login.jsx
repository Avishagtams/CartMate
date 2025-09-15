
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import "../styles/auth.css";
import Modal from "../components/Modal"; // ✨ ייבוא המודאל

function Eye({off}) {
  return off ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M6 7.8A11 11 0 003 12c1.7 3 4.9 5.5 9 5.5 1.3 0 2.6-.2 3.7-.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M9.9 5.2A11 11 0 0121 12c-1.7 3-4.9 5.5-9 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

export default function Login(){
  const [form, setForm] = useState({ email:"", password:"" });
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); // ✨ שליטה על המודאל
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault(); 
    setMsg(""); 
    setLoading(true);
    try{
      const data = await api("/api/auth/login", { method:"POST", body: form });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      nav("/home");
    }catch(err){
      setMsg(err.message || "שגיאה בהתחברות");
      setShowModal(true); // 
    }finally{ 
      setLoading(false); 
    }
  };

  return (
    <main className="page-hero" dir="rtl">
      <section className="auth-shell">
        {/* אילוסטרציה */}
        <aside className="illus glass" aria-hidden="true">
          <span className="illus-tag">ברוכה הבאה</span>
          <img alt="Checklist notebook" src="/images/image.png" />
        </aside>

        {/* טופס */}
        <div className="auth-card glass">
          <h1 className="auth-title">התחברות</h1>
          <p className="auth-sub">כדי להמשיך ל-CartMate</p>

          <form className="form" onSubmit={submit}>
            <label className="label" htmlFor="email">אימייל</label>
            <input
              id="email" name="email" type="text" dir="ltr"
              className="input" placeholder="name@example.com"
              value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required
            />

            <label className="label" htmlFor="password">סיסמה</label>
            <div className="input-wrap">
              <input
                id="password" name="password" dir="ltr"
                type={show ? "text":"password"} className="input" placeholder="••••••••"
                value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required
              />
              <button type="button" className="eye" onClick={()=>setShow(s=>!s)} aria-label={show?"הסתר סיסמה":"הצג סיסמה"}>
                <Eye off={show}/>
              </button>
            </div>

            <button className="btn btn-primary" disabled={!form.email || !form.password || loading}>
              {loading ? "מתחבר..." : "התחבר"}
            </button>
          </form>

          <p className="footer">
            אין לך חשבון? <Link to="/register" className="link">להרשמה</Link>
          </p>
        </div>
      </section>

      {/* ✨ מודאל הודעות */}
      <Modal 
        open={showModal} 
        onClose={()=>setShowModal(false)} 
        title="שגיאה"
        danger
      >
        {msg}
      </Modal>
    </main>
  );
}

