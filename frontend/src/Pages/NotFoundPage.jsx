import React from 'react'

export default function NotFoundPage() {
  const cardStyle = {
    width: '300px',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)'
  };
  return (
    <div style={{
      height: '86vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={cardStyle}>
        <h1 style={{fontSize: "30px", color:"red"}}>
          Error 404
        </h1>
        <h1 style={{fontSize: "30px", color: "red"}}>
          Page Not Found
        </h1>
      </div>
    </div>
  );
}
