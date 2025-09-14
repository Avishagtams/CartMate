import { useEffect, useState } from "react";
import { api } from "../api";

export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api("/api/auth/me", { auth:true })
      .then(setMe)
      .catch(e => setErr(e.message));
  }, []);

  return (
    <div style={{maxWidth:700, margin:"40px auto"}}>
      <h2>דשבורד</h2>
      {err && <p style={{color:"crimson"}}>שגיאה: {err}</p>}
      {me ? <pre>{JSON.stringify(me, null, 2)}</pre> : <p>טוען...</p>}
      <button onClick={() => { localStorage.clear(); location.href="/login"; }}>
        התנתקות
      </button>
    </div>
  );
}
