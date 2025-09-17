import { useNavigate } from "react-router-dom";
import "../styles/home.css";

export default function Home(){
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/login");
  };

  return (
    <main className="page-home" dir="rtl">
      {/* שורת ברוכים הבאים + התנתקות */}
      <div className="home-header">
        <h1 className="home-title">
          היי {user?.name || "משתמש"} 👋
        </h1>
        <button className="btn btn-danger" onClick={logout}>התנתקות</button>
      </div>

      {/* שלוש האופציות */}
      <div className="home-options">
        <div className="circle" onClick={()=>nav("/mylists")}>
          <span>📋</span>
          <p>הרשימות שלי</p>
        </div>

        <div className="circle" onClick={()=>nav("/lists/new")}>
          <span>➕</span>
          <p>צור רשימה חדשה</p>
        </div>

        <div className="circle" onClick={()=>nav("/profile")}>
          <span>⚙️</span>
          <p>עדכון פרטים</p>
        </div>
      </div>
    </main>
  );
}

