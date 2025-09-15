import React from "react";
import "../styles/modal.css";

export default function Modal({ open, onClose, title, children, danger }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className={`modal-card glass ${danger ? "danger" : ""}`} 
        onClick={(e)=>e.stopPropagation()}
      >
        <h2 className="modal-title">{title}</h2>
        <div className="modal-body">{children}</div>
        <button className="btn btn-primary" onClick={onClose}>
          סגור
        </button>
      </div>
    </div>
  );
}
