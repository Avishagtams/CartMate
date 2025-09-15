import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import "../styles/auth.css";
import Modal from "../components/Modal";

export default function Profile(){
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [form, setForm] = useState({ name:"", email:"", phone:"", password:"" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(()=>{
    if(user){
      setForm({ name:user.name, email:user.email, phone:user.phone, password:"" });
    }
  }, []);

  // ולידציה
  const isValidEmail = (email)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone)=>/^05\d{8}$/.test(phone);
  const isValidPassword = (password)=>/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);

  const submit = async (e)=>{
    e.preventDefault();
    const newErrors = [];

    if (!form.name.trim()) newErrors.push("חובה למלא שם מלא");
    if (!isValidEmail(form.email)) newErrors.push("האימייל לא תקין");
    if (!isValidPhone(form.phone)) newErrors.push("מספר טלפון חייב להתחיל ב־05 ולהיות 10 ספרות");
    if (form.password && !isValidPassword(form.password)) newErrors.push("סיסמה חדשה חייבת להיות לפחות 8 תווים, לכלול אות גדולה, אות קטנה, מספר ותו מיוחד");

    if (newErrors.length > 0){
      setErrors(newErrors);
      setShowModal(true);
      return;
    }

    setLoading(true);
    try{
      const updated = await api("/api/auth/update", { 
        method:"PUT", 
        body: form,
        auth: true // נעביר טוקן אוטומטית אם ה־api שלך יודע להשתמש בזה
      });
      localStorage.setItem("user", JSON.stringify(updated.user));
      nav("/home");
    }catch(err){
      setErrors([err.message || "שגיאה בעדכון פרטים"]);
      setShowModal(true);
    }finally{
      setLoading(false);
    }
  };

  return (
    <main className="page-hero" dir="rtl">
       <button
  type="button"
  onClick={() =>{
    console.log("נלחץ");
    nav("/home");
  }}
  style={{
    position: "fixed",   // נשאר במקום גם כשגוללים
    top: "20px",         // רווח מהחלק העליון
    right: "20px",       // רווח מהצד הימני
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "24px",
    zIndex: 1000         // כדי שיהיה מעל כל תוכן אחר
  }}
>
  →
</button>

      <section className="auth-shell">
        <div className="auth-card glass">
          <h1 className="auth-title">עדכון פרטים אישיים</h1>
          <p className="auth-sub">כאן תוכלי לעדכן את המידע שלך</p>

          
          <form className="form" onSubmit={submit}>
            <label className="label" htmlFor="name">שם מלא</label>
            <input id="name" className="input"
              value={form.name}
              onChange={e=>setForm({...form, name:e.target.value})}
              required />

            <label className="label" htmlFor="email">אימייל</label>
            <input id="email" className="input" dir="ltr"
              value={form.email}
              onChange={e=>setForm({...form, email:e.target.value})}
              required />

            <label className="label" htmlFor="phone">טלפון</label>
            <input id="phone" className="input" dir="ltr"
              value={form.phone}
              onChange={e=>setForm({...form, phone:e.target.value})}
              required />

            <label className="label" htmlFor="password">סיסמה חדשה (לא חובה)</label>
            <input id="password" type="password" dir="ltr" className="input"
              value={form.password}
              onChange={e=>setForm({...form, password:e.target.value})} />

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "שומרת..." : "שמירה"}
            </button>
          </form>
        </div>
      </section>

      <Modal
        open={showModal}
        onClose={()=>setShowModal(false)}
        title="שגיאות בטופס"
        danger
      >
        <ul style={{textAlign:"right"}}>
          {errors.map((err,i)=><li key={i}>{err}</li>)}
        </ul>
      </Modal>
    </main>
  );
}
