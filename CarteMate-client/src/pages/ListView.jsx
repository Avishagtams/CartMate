// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { api } from "../api";
// import "../styles/list.css";
// import Modal from "../components/Modal";

// export default function ListView() {
//   const { id } = useParams();
//   const [list, setList] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [errors, setErrors] = useState([]);
//   const [showModal, setShowModal] = useState(false);

//   // שיתוף/הוספת משתמשים
//   const [showAddUsers, setShowAddUsers] = useState(false);
//   const [phone, setPhone] = useState("");

//   // הוספת מוצר
//   const [showAddItem, setShowAddItem] = useState(false);
//   const [itemName, setItemName] = useState("");
//   const [itemQty, setItemQty] = useState(1);

//   // עריכת מוצר
//   const [editItem, setEditItem] = useState(null);
//   const [editName, setEditName] = useState("");
//   const [editQty, setEditQty] = useState(1);

//   const user = JSON.parse(localStorage.getItem("user"));

//   // פונקציה לבדיקת בעלות
//   const isOwner = () => {
//     if (!list || !user) return false;
//     return (list.owner._id ? list.owner._id : list.owner) === user.id;
//   };

//   useEffect(() => {
//     const fetchList = async () => {
//       try {
//         const data = await api(`/api/lists/${id}`, { method: "GET", auth: true });
//         setList(data);
//       } catch (err) {
//         setErrors([err.message || "שגיאה בטעינת הרשימה"]);
//         setShowModal(true);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchList();
//   }, [id]);

//   const toggleItem = async (itemId) => {
//     try {
//       const updated = await api(`/api/lists/${id}/toggle/${itemId}`, {
//         method: "PUT",
//         auth: true,
//       });
//       setList(updated);
//     } catch (err) {
//       setErrors([err.message || "שגיאה בעדכון פריט"]);
//       setShowModal(true);
//     }
//   };

//   if (loading) return <p>טוען...</p>;
//   if (!list) return <p>הרשימה לא נמצאה</p>;

//   return (
//     <main className="page-list" dir="rtl">
//       {/* טור ימין: פרטי הרשימה + כפתורים */}
//       <aside className="list-info glass">
//         <header className="list-header">
//           <h1 className="list-title">{list.name}</h1>
//           <p className="list-sub">
//             שותפים: {list.sharedWith.map((u) => u.name).join(", ") || "אין"}
//           </p>
//         </header>

//         <footer className="list-footer">
//           {isOwner() && (
//             <button className="icon-btn" onClick={() => setShowAddUsers(true)}>
//               <span>➕👤</span>
//               <span className="icon-label">הוספת אנשים</span>
//             </button>
//           )}
//           <button className="icon-btn" onClick={() => setShowAddItem(true)}>
//             <span>➕</span>
//             <span className="icon-label">הוספת מוצר</span>
//           </button>
//           <button className="icon-btn" onClick={() => alert("יוצאים לקניות!")}>
//             <span>🛒</span>
//             <span className="icon-label">יצאתי לקניות</span>
//           </button>
//           <button className="icon-btn" onClick={() => alert("עזיבה מהקבוצה")}>
//             <span>🚪</span>
//             <span className="icon-label">עזיבת רשימה</span>
//           </button>
//         </footer>
//       </aside>

//       {/* טור שמאל: הרשימה */}
//       <section className="list-items">
//         {/* כותרת רשימה */}
//         <div className="list-heading">רשימת מוצרים:</div>

//         {list.items.length === 0 && (<p className="no-items">אין מוצרים עדיין</p>)}
//         <ul>
//           {list.items.map((item) => (
//             <li
//               key={item._id}
//               className={item.done ? "done" : ""}
//               onDoubleClick={() => {
//                 setEditItem(item);
//                 setEditName(item.name);
//                 setEditQty(item.quantity);
//               }}
//             >
//               <input
//                 type="checkbox"
//                 checked={item.done}
//                 onChange={() => toggleItem(item._id)}
//               />
//               <span>
//                 {item.name} ({item.quantity})
//               </span>
//             </li>
//           ))}
//         </ul>
//       </section>

//       {/* מודאל הוספת משתמשים */}
//       <Modal
//         open={showAddUsers}
//         onClose={() => setShowAddUsers(false)}
//         title="הוספת משתמשים"
//       >
//         <div className="form">
//           <label className="label">מספר טלפון</label>
//           <input
//             className="input"
//             dir="ltr"
//             placeholder="05XXXXXXXX"
//             value={phone}
//             onChange={(e) => setPhone(e.target.value)}
//           />
//           <button
//             className="btn btn-primary"
//             onClick={async () => {
//               try {
//                 const updated = await api(`/api/lists/${id}/add-users`, {
//                   method: "PUT",
//                   body: { phones: [phone] },
//                   auth: true,
//                 });
//                 setList(updated);
//                 setPhone("");
//                 setShowAddUsers(false);
//               } catch (err) {
//                 setErrors([err.message || "שגיאה בהוספת משתמש"]);
//                 setShowModal(true);
//               }
//             }}
//           >
//             הוסף
//           </button>
//         </div>
//       </Modal>

//       {/* מודאל הוספת מוצר */}
//       <Modal
//         open={showAddItem}
//         onClose={() => setShowAddItem(false)}
//         title="הוספת מוצר לרשימה"
//       >
//         <div className="form">
//           <label className="label">שם מוצר</label>
//           <input
//             className="input"
//             value={itemName}
//             onChange={(e) => setItemName(e.target.value)}
//             placeholder="לדוגמה: חלב"
//             required
//           />

//           <label className="label">כמות</label>
//           <input
//             type="number"
//             className="input"
//             value={itemQty}
//             onChange={(e) => setItemQty(parseInt(e.target.value))}
//             min="1"
//           />

//           <button
//             className="btn btn-primary"
//             onClick={async () => {
//               if (!itemName.trim()) {
//                 setErrors(["חובה להזין שם מוצר"]);
//                 setShowModal(true);
//                 return;
//               }

//               // בדיקה אם המוצר כבר קיים
//               const exists = list.items.some(
//                 (i) => i.name.trim() === itemName.trim()
//               );
//               if (exists) {
//                 setErrors([
//                   "המוצר הזה כבר מופיע ברשימה. ניתן לעדכן אותו על ידי שתי לחיצות עליו."
//                 ]);
//                 setShowModal(true);
//                 return;
//               }

//               try {
//                 const updated = await api(`/api/lists/${id}/items`, {
//                   method: "POST",
//                   body: { name: itemName, quantity: itemQty },
//                   auth: true,
//                 });
//                 setList(updated);
//                 setItemName("");
//                 setItemQty(1);
//                 setShowAddItem(false);
//               } catch (err) {
//                 setErrors([err.message || "שגיאה בהוספת מוצר"]);
//                 setShowModal(true);
//               }
//             }}
//           >
//             הוסף
//           </button>
//         </div>
//       </Modal>

//       {/* מודאל עריכת מוצר */}
//       <Modal
//         open={!!editItem}
//         onClose={() => setEditItem(null)}
//         title="עריכת מוצר"
//       >
//         <div className="form">
//           <label className="label">שם מוצר</label>
//           <input
//             className="input"
//             value={editName}
//             onChange={(e) => setEditName(e.target.value)}
//           />

//           <label className="label">כמות</label>
//           <input
//             type="number"
//             className="input"
//             value={editQty}
//             min="1"
//             onChange={(e) => setEditQty(parseInt(e.target.value))}
//           />

//           {/* שמירה */}
//           <button
//             className="btn btn-primary"
//             onClick={async () => {
//               try {
//                 const updated = await api(`/api/lists/${id}/items/${editItem._id}`, {
//                   method: "PUT",
//                   body: { name: editName, quantity: editQty },
//                   auth: true,
//                 });
//                 setList(updated);
//                 setEditItem(null);
//               } catch (err) {
//                 setErrors([err.message || "שגיאה בעריכת מוצר"]);
//                 setShowModal(true);
//               }
//             }}
//           >
//             שמור שינויים
//           </button>

//           {/* מחיקה */}
//           <button
//             className="btn btn-danger"
//             onClick={async () => {
//               if (!window.confirm("למחוק את הפריט הזה?")) return;
//               try {
//                 const updated = await api(`/api/lists/${id}/items/${editItem._id}`, {
//                   method: "DELETE",
//                   auth: true,
//                 });
//                 setList(updated);
//                 setEditItem(null);
//               } catch (err) {
//                 setErrors([err.message || "שגיאה במחיקת מוצר"]);
//                 setShowModal(true);
//               }
//             }}
//           >
//             🗑️ מחק פריט
//           </button>
//         </div>
//       </Modal>

//       {/* מודאל שגיאות */}
//       <Modal
//         open={showModal}
//         onClose={() => setShowModal(false)}
//         title="שגיאה"
//         danger
//       >
//         <ul style={{ textAlign: "right" }}>
//           {errors.map((err, i) => (
//             <li key={i}>{err}</li>
//           ))}
//         </ul>
//       </Modal>
//     </main>
//   );
// }


import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import "../styles/list.css";
import Modal from "../components/Modal";

export default function ListView() {
  const { id } = useParams();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // שיתוף/הוספת משתמשים
  const [showAddUsers, setShowAddUsers] = useState(false);
  const [phone, setPhone] = useState("");

  // הוספת מוצר
  const [showAddItem, setShowAddItem] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemQty, setItemQty] = useState(1);

  // עריכת מוצר
  const [editItem, setEditItem] = useState(null);
  const [editName, setEditName] = useState("");
  const [editQty, setEditQty] = useState(1);

  // יצאתי לקניות
  const [lockTime, setLockTime] = useState(10); // ברירת מחדל: 10 דקות
  const [showLockModal, setShowLockModal] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  // פונקציה לבדיקת בעלות
  const isOwner = () => {
    if (!list || !user) return false;
    return (list.owner._id ? list.owner._id : list.owner) === user.id;
  };

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
      const updated = await api(`/api/lists/${id}/toggle/${itemId}`, {
        method: "PUT",
        auth: true,
      });
      setList(updated);
    } catch (err) {
      setErrors([err.message || "שגיאה בעדכון פריט"]);
      setShowModal(true);
    }
  };

  // יצאתי לקניות – פתיחת מודאל
  const handleStartShopping = () => {
    setShowLockModal(true);
  };

  // אישור שליחת מיילים ונעילת הרשימה
  const confirmLockAndSendMail = async () => {
    try {
      const result = await api(`/api/lists/${id}/lock`, {
        method: "POST",
        auth: true,
        body: { minutes: lockTime },
      });
      setErrors([result.msg || "המייל נשלח בהצלחה לשותפים ברשימה"]);
    } catch (err) {
      setErrors([err.message || "שגיאה בשליחת המייל"]);
    } finally {
      setShowModal(true);
      setShowLockModal(false);
    }
  };

  if (loading) return <p>טוען...</p>;
  if (!list) return <p>הרשימה לא נמצאה</p>;

  return (
    <main className="page-list" dir="rtl">
      {/* טור ימין: פרטי הרשימה + כפתורים */}
      <aside className="list-info glass">
        <header className="list-header">
          <h1 className="list-title">{list.name}</h1>
          <p className="list-sub">
            שותפים: {list.sharedWith.map((u) => u.name).join(", ") || "אין"}
          </p>
        </header>

        <footer className="list-footer">
          {isOwner() && (
            <button className="icon-btn" onClick={() => setShowAddUsers(true)}>
              <span>➕👤</span>
              <span className="icon-label">הוספת אנשים</span>
            </button>
          )}
          <button className="icon-btn" onClick={() => setShowAddItem(true)}>
            <span>➕</span>
            <span className="icon-label">הוספת מוצר</span>
          </button>
          <button className="icon-btn" onClick={handleStartShopping}>
            <span>🛒</span>
            <span className="icon-label">יצאתי לקניות</span>
          </button>
          <button className="icon-btn" onClick={() => alert("עזיבה מהקבוצה")}>
            <span>🚪</span>
            <span className="icon-label">עזיבת רשימה</span>
          </button>
        </footer>
      </aside>

      {/* טור שמאל: הרשימה */}
      <section className="list-items">
        <div className="list-heading">רשימת מוצרים:</div>

        {list.items.length === 0 && <p className="no-items">אין מוצרים עדיין</p>}
        <ul>
          {list.items.map((item) => (
            <li
              key={item._id}
              className={item.done ? "done" : ""}
              onDoubleClick={() => {
                setEditItem(item);
                setEditName(item.name);
                setEditQty(item.quantity);
              }}
            >
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => toggleItem(item._id)}
              />
              <span>
                {item.name} ({item.quantity})
              </span>
            </li>
          ))}
        </ul>
      </section>

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

      {/* מודאל הוספת מוצר */}
      <Modal
        open={showAddItem}
        onClose={() => setShowAddItem(false)}
        title="הוספת מוצר לרשימה"
      >
        <div className="form">
          <label className="label">שם מוצר</label>
          <input
            className="input"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="לדוגמה: חלב"
            required
          />

          <label className="label">כמות</label>
          <input
            type="number"
            className="input"
            value={itemQty}
            onChange={(e) => setItemQty(parseInt(e.target.value))}
            min="1"
          />

          <button
            className="btn btn-primary"
            onClick={async () => {
              if (!itemName.trim()) {
                setErrors(["חובה להזין שם מוצר"]);
                setShowModal(true);
                return;
              }

              const exists = list.items.some(
                (i) => i.name.trim() === itemName.trim()
              );
              if (exists) {
                setErrors([
                  "המוצר הזה כבר מופיע ברשימה. ניתן לעדכן אותו על ידי שתי לחיצות עליו.",
                ]);
                setShowModal(true);
                return;
              }

              try {
                const updated = await api(`/api/lists/${id}/items`, {
                  method: "POST",
                  body: { name: itemName, quantity: itemQty },
                  auth: true,
                });
                setList(updated);
                setItemName("");
                setItemQty(1);
                setShowAddItem(false);
              } catch (err) {
                setErrors([err.message || "שגיאה בהוספת מוצר"]);
                setShowModal(true);
              }
            }}
          >
            הוסף
          </button>
        </div>
      </Modal>

      {/* מודאל עריכת מוצר */}
      <Modal
        open={!!editItem}
        onClose={() => setEditItem(null)}
        title="עריכת מוצר"
      >
        <div className="form">
          <label className="label">שם מוצר</label>
          <input
            className="input"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />

          <label className="label">כמות</label>
          <input
            type="number"
            className="input"
            value={editQty}
            min="1"
            onChange={(e) => setEditQty(parseInt(e.target.value))}
          />

          <button
            className="btn btn-primary"
            onClick={async () => {
              try {
                const updated = await api(`/api/lists/${id}/items/${editItem._id}`, {
                  method: "PUT",
                  body: { name: editName, quantity: editQty },
                  auth: true,
                });
                setList(updated);
                setEditItem(null);
              } catch (err) {
                setErrors([err.message || "שגיאה בעריכת מוצר"]);
                setShowModal(true);
              }
            }}
          >
            שמור שינויים
          </button>

          <button
            className="btn btn-danger"
            onClick={async () => {
              if (!window.confirm("למחוק את הפריט הזה?")) return;
              try {
                const updated = await api(`/api/lists/${id}/items/${editItem._id}`, {
                  method: "DELETE",
                  auth: true,
                });
                setList(updated);
                setEditItem(null);
              } catch (err) {
                setErrors([err.message || "שגיאה במחיקת מוצר"]);
                setShowModal(true);
              }
            }}
          >
            🗑️ מחק פריט
          </button>
        </div>
      </Modal>

      {/* מודאל נעילה ושליחת מיילים */}
      <Modal
        open={showLockModal}
        onClose={() => setShowLockModal(false)}
        title="כמה זמן לתת למשתתפים לעדכן?"
      >
        <p>הרשימה תינעל אחרי כמה דקות שתבחר. המשתתפים יקבלו מייל ויוכלו להוסיף מוצרים עד אז.</p>
        <input
          type="number"
          className="input"
          value={lockTime}
          min="1"
          onChange={(e) => setLockTime(e.target.value)}
        />
        <button className="btn btn-primary" onClick={confirmLockAndSendMail}>
          התחלת קניות 🚀
        </button>
      </Modal>

      {/* מודאל שגיאות / הצלחות */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="הודעה"
        danger={errors.some((e) => e.toLowerCase().includes("שגיאה"))}
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
