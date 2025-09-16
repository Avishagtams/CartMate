import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import "../styles/list.css";
import Modal from "../components/Modal";

export default function ListView() {
  const { id } = useParams();
  const nav = useNavigate();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // שיתוף/הוספת משתמשים
  const [showAddUsers, setShowAddUsers] = useState(false);
  const [phone, setPhone] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchList = async () => {
      try {
        const data = await api(`/api/lists/${id}`, { method: "GET", auth: true });
        setList(data);
      } catch (err) {
        setErrors([err.message || "שגיאה בטעינת הרשימה"]);
        setShowModal(true);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [id]);

  const toggleItem = async (itemId) => {
    try {
      const updated = await api(`/api/lists/${id}/toggle/${itemId}`, { method: "PUT", auth: true });
      setList(updated);
    } catch (err) {
      setErrors([err.message || "שגיאה בעדכון פריט"]);
      setShowModal(true);
    }
  };

  if (loading) return <p>טוען...</p>;
  if (!list) return <p>הרשימה לא נמצאה</p>;

  return (
    <main className="page-list" dir="rtl">
      {/* שם הרשימה */}
      <header className="list-header glass">
        <h1 className="list-title">{list.name}</h1>
        <p className="list-sub">שותפים: {list.sharedWith.map(u => u.name).join(", ") || "אין"}</p>
      </header>

      {/* רשימת מוצרים */}
      <section className="list-items">
        {list.items.length === 0 && <p>אין מוצרים עדיין</p>}
        <ul>
          {list.items.map((item) => (
            <li 
              key={item._id} 
              className={item.done ? "done" : ""} 
              onClick={() => toggleItem(item._id)}
            >
              {item.name} ({item.quantity})
              {item.done && <span className="checkmark">✔️</span>}
            </li>
          ))}
        </ul>
      </section>

      {/* סרגל תחתון */}
      <footer className="list-footer glass">
        {list.owner._id === user.id && (
          <button className="icon-btn" onClick={() => setShowAddUsers(true)}>➕👤</button>
        )}
        <button className="icon-btn" onClick={() => alert("הוספת מוצר")}>➕</button>
        <button className="icon-btn" onClick={() => alert("יוצאים לקניות!")}>🛒</button>
        <button className="icon-btn" onClick={() => alert("עזיבה מהקבוצה")}>🚪</button>
      </footer>

      {/* מודאל הוספת משתמשים */}
      <Modal
        open={showAddUsers}
        onClose={() => setShowAddUsers(false)}
        title="הוספת משתמשים"
      >
        <div className="form">
          <label className="label">מספר טלפון</label>
          <input
            className="input"
            dir="ltr"
            placeholder="05XXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={async () => {
              try {
                const updated = await api(`/api/lists/${id}/add-users`, {
                  method: "PUT",
                  body: { phones: [phone] },
                  auth: true,
                });
                setList(updated);
                setPhone("");
                setShowAddUsers(false);
              } catch (err) {
                setErrors([err.message || "שגיאה בהוספת משתמש"]);
                setShowModal(true);
              }
            }}
          >
            הוסף
          </button>
        </div>
      </Modal>

      {/* מודאל שגיאות */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="שגיאה"
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
