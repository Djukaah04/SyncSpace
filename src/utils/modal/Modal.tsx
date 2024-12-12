import React from "react";
import "./Modal.scss";
import ReactDom from "react-dom";

const Modal = ({ children, isOpen, onClose }) => {
  if (!isOpen) return null;

  return ReactDom.createPortal(
    <>
      <div className="overlay" />
      <div className="modal">
        <button onClick={onClose}>Close</button>
        <div>Modal: {children}</div>
      </div>
    </>,
    document.getElementById("portal") as HTMLElement
  );
};

export default Modal;
