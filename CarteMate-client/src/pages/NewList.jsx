import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import "../styles/auth.css";
import Modal from "../components/Modal";

export default function NewList() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sharedWith, setSharedWith] = useState([]); // כאן נשמור אובייקטים {phone, name}
  const [errors, setErrors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValidPhone = (p) => /^05\d{8}$/.test(p);

  const addPhone = async () => {
    if (!isValidPhone(phone)) {
      setErrors(["מספר טלפון חייב להתחיל ב־05 ולהיות 10 ספרות"]);
      setShowModal(true);
      return;
    }
    if (sharedWith.find((u) => u.phone === phone)) {
      setErrors(["המספר כבר קיים ברשימה"]);
      setShowModal(true);
      return;
    }

    try {
      // בדיקה מול השרת
      const user = await api(`/api/lists/check/${phone}`, { method: "GET" });
      setSharedWith([...sharedWith, { phone, name: user.name }]);
      setPhone("");
    } catch (err) {
      setErrors([`המספר ${phone} לא רשום במערכת`]);
      setShowModal(true);
    }
  };

  const removePhone = (p) => {
    setSharedWith(sharedWith.filter((u) => u.phone !== p));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrors(["חובה להזין שם רשימה"]);
      setShowModal(true);
      return;
    }

    setLoading(true);
    try {
        const newList = await api("/api/lists", {
        method: "POST",
        body: { 
          name, 
          sharedWith: sharedWith.map((u) => u.phone) 
        },
        auth: true
      });
      nav(`/lists/${newList._id}`); // 👈 עכשיו שולח ישירות לדף הרשימה שנוצרה
    } catch (err) {
      setErrors([err.message || "שגיאה בשמירת הרשימה"]);
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-hero" dir="rtl">
      <section className="auth-shell">
        <div className="auth-card glass">
          <h1 className="auth-title">צור רשימה חדשה</h1>

          <form className="form" onSubmit={submit}>
            <label className="label" htmlFor="name">שם הרשימה</label>
            <input
              id="name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label className="label" htmlFor="phone">הוסף שותפים לפי טלפון</label>
            <div className="input-wrap">
              <input
                id="phone"
                className="input"
                dir="ltr"
                placeholder="05XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <button type="button" className="btn btn-primary" onClick={addPhone}>
                ➕ הוסף
              </button>
            </div>

            <ul style={{ marginTop: "1rem" }}>
              {sharedWith.map((u) => (
                <li key={u.phone}>
                  {u.name} ({u.phone})
                  <button
                    type="button"
                    onClick={() => removePhone(u.phone)}
                    style={{ marginRight: "0.5rem", color: "red" }}
                  >
                    ❌
                  </button>
                </li>
              ))}
            </ul>

            <button type="submit" className="btn btn-primary" style={{ marginTop: "1.5rem" }} disabled={loading}>
              {loading ? "שומר..." : "שמירה"}
            </button>
          </form>
        </div>
      </section>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="שגיאות בטופס"
        danger
      >
        <ul style={{ textAlign: "right" }}>
          {errors.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      </Modal>
    </main>
  );
}
