import React from 'react';
import ReactDOM from 'react-dom/client';

function App(){
 return (
  <div style={{fontFamily:'Arial',padding:'40px',background:'#0b1220',color:'white',minHeight:'100vh'}}>
    <h1>NEXVI</h1>
    <p>AI Travel Companion</p>
    <button style={{padding:'12px 20px'}}>Start Planning</button>
  </div>
 );
}
ReactDOM.createRoot(document.getElementById('root')!).render(<App/>);
