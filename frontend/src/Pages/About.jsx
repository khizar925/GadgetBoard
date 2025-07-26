import React from 'react';

export default function About() {
  return (
    <div style={{ height: "86vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ textAlign: "center", maxWidth: "600px" }}>
        <h1>About This App</h1>
        <p style={{ fontSize: "18px" }}>
          This Todo List app is built to help you manage your tasks easily. It is simple, fast, and efficient — perfect for students, professionals, or anyone who wants to stay organized.
        </p>
      </div>
    </div>
  );
}
