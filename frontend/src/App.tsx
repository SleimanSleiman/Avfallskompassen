import React, { useState } from 'react';
import './App.css'

function App() {
  const [message, setMessage] = useState('');

  const handleClick = async (value: number) => {
    const res = await fetch(`http://localhost:8080/api/message?value=${value}`);
    const text = await res.text();
    setMessage(text);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', textAlign: 'center' }}>Simple Test Page</h1>
      
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2>Welcome to Avfallskompassen!</h2>
        
        <p>This is a simple test page.</p>
        
        <div style={{ 
          background: '#e8f4f8', 
          padding: '15px', 
          borderRadius: '5px',
          border: '1px solid #b3d9e8',
          marginBottom: '20px'
        }}>
          <strong>Quick Test:</strong> Change the background color of this box by modifying the style above!
        </div>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button onClick={() => handleClick(1)} style={{ marginRight: '10px' }}>Button 1</button>
          <button onClick={() => handleClick(2)}>Button 2</button>
        </div>

        {message && (
          <div style={{ textAlign: 'center', color: '#00796b', fontWeight: 'bold' }}>{message}</div>
        )}
        
        <footer style={{ 
          marginTop: '40px', 
          textAlign: 'center', 
          color: '#666',
          borderTop: '1px solid #eee',
          paddingTop: '20px'
        }}>
          <p>Edit src/App.tsx to modify this page</p>
        </footer>
      </div>
    </div>
  )
}

export default App
