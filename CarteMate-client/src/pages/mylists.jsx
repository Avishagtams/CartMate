import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import "../styles/mylists.css";

export default function MyLists() {
  const nav = useNavigate();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const data = await api("/api/lists", { method: "GET", auth: true });
        setLists(data);
      } catch (err) {
        setError(err.message || "שגיאה בטעינת הרשימות");
      } finally {
        setLoading(false);
      }
    };
    fetchLists();
  }, []);

  if (loading) return <p>טוען את הרשימות...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <main className="page-mylists" dir="rtl">
      <h1 className="mylists-title">📋 הרשימות שלי</h1>

      {lists.length === 0 ? (
        <p>אין לך רשימות עדיין. לחץ על ➕ כדי ליצור אחת חדשה.</p>
      ) : (
        <div className="mylists-grid">
          {lists.map((list) => (
            <div
              key={list._id}
              className="list-card"
              onClick={() => nav(`/lists/${list._id}`)}
            >
              <h2>{list.name}</h2>
              <p>שותפים: {list.sharedWith?.length || 0}</p>
              {list.items?.length > 0 && (
                <p>סה״כ פריטים: {list.items.length}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
