import { BrowserRouter, Routes, Route } from "react-router-dom";
import TopBar from "./components/TopBar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";        
import Profile from "./pages/Profile";
import NewList from "./pages/NewList";
import ListView from "./pages/ListView";
import MyLists from "./pages/mylists";  
import "./styles/tokens.css"; // נטען טוקנים פעם אחת

export default function App(){
  return (
    <BrowserRouter>
      <TopBar/>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
        <Route path="/home" element={<ProtectedRoute><Home/></ProtectedRoute>}/>
        <Route path="*" element={<Login/>}/>
        <Route path="/profile" element={<Profile/>} />
        <Route path="/lists/new" element={<NewList />} /> {/* 👈 חדש */}
        <Route path="/lists/:id" element={<ListView />} />
        <Route path="/mylists" element={<MyLists />} /> {/* 👈 חדש */}
      </Routes>
    </BrowserRouter>
  );
}
