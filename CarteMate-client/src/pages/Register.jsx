import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import "../styles/auth.css";

const Eye = (p)=>(
  p.off ? (
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
  )
);

export default function Register(){
  const [form, setForm] = useState({name:"", email:"", phone:"", password:"", confirm:""});
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e)=>{
    e.preventDefault();
    if(form.password !== form.confirm){ setMsg("הסיסמאות אינן תואמות"); return; }
    setLoading(true); setMsg("");
    try{
      await api("/api/auth/register", { method:"POST", body:{
        name:form.name, email:form.email, phone:form.phone, password:form.password
      }});
      nav("/login");
    }catch(err){
      setMsg(err.message || "שגיאה בהרשמה");
    }finally{ setLoading(false); }
  };

  return (
    <main className="page-hero" dir="rtl">
      <section className="auth-shell">
        <aside className="illus glass" aria-hidden="true">
          <span className="illus-tag">בואי נתחיל</span>
          <img alt="Checklist notebook" src="/images/image.png" />
        </aside>

        <div className="auth-card glass">
          <h1 className="auth-title">הרשמה</h1>
          <p className="auth-sub">צרי חשבון חדש</p>

          {msg && <div className="alert">{msg}</div>}

          <form className="form" onSubmit={submit}>
            <label className="label" htmlFor="name">שם מלא</label>
            <input id="name" name="name" className="input" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required/>

            <label className="label" htmlFor="email">אימייל</label>
            <input id="email" name="email" type="email" dir="ltr" className="input"
                   value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required/>

            <label className="label" htmlFor="phone">טלפון</label>
            <input id="phone" name="phone" dir="ltr" className="input"
                   value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} required/>

            <label className="label" htmlFor="password">סיסמה</label>
            <div className="input-wrap">
              <input id="password" name="password" dir="ltr" type={show1?"text":"password"} className="input"
                     value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required/>
              <button type="button" className="eye" onClick={()=>setShow1(s=>!s)} aria-label={show1?"הסתר סיסמה":"הצג סיסמה"}>
                <Eye off={show1}/>
              </button>
            </div>

            <label className="label" htmlFor="confirm">אימות סיסמה</label>
            <div className="input-wrap">
              <input id="confirm" name="confirm" dir="ltr" type={show2?"text":"password"} className="input"
                     value={form.confirm} onChange={e=>setForm({...form, confirm:e.target.value})} required/>
              <button type="button" className="eye" onClick={()=>setShow2(s=>!s)} aria-label={show2?"הסתר סיסמה":"הצג סיסמה"}>
                <Eye off={show2}/>
              </button>
            </div>

            <button className="btn btn-primary" disabled={loading}>
              {loading ? "נרשמת..." : "הרשמה"}
            </button>
          </form>

          <p className="footer">
            כבר יש לך חשבון? <Link to="/login" className="link">להתחברות</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
