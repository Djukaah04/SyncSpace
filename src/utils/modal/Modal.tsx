import React from "react";
import ReactDom from "react-dom";

const Modal = ({ children, isOpen, onClose }) => {
  if (!isOpen) return;

  return ReactDom.createPortal(
    <>
      <div className="overlay" />
      <div className="modal">
        <button className="close" onClick={onClose}>
          <img className="x-logo" src="assets/svg/x.svg" alt="close" />
        </button>
        {children}
      </div>
    </>,
    document.getElementById("portal") as HTMLElement
  );
};

export default Modal;
