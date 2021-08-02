import React, { useState } from "react";

// // Styles:
// import "./handling.scss";

function Handling({ setModal, claimInfo }) {
  const onClickModalHandler = () => {
    setModal(false);
  };
  return (
    <>
      <div className="modal">
        <h1 className="modalTitle">
          {claimInfo.type === "failure" ? "Oops..." : "Success!"}
        </h1>
        <span className="modalMsg">{claimInfo.payload?.message}</span>
        <button className="modalBut" onClick={onClickModalHandler}>
          Cheers!
        </button>
      </div>
      <div className="overlay" />
    </>
  );
}

export default Handling;
