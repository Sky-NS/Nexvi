
import React from 'react';
import ReactDOM from 'react-dom/client';

const styles={
page:{fontFamily:'Arial',background:'#0b1220',color:'white',minHeight:'100vh',padding:'40px'},
card:{background:'#162033',padding:'20px',borderRadius:'16px',marginTop:'20px'}
};

function App(){
return <div style={styles.page}>
<h1>NEXVI</h1>
<p>AI Travel Companion</p>

<div style={styles.card}>
<h2>Demo itinerary</h2>
<b>Day 1 — Bali</b>
<ul>
<li>08:00 Breakfast</li>
<li>10:00 Ubud</li>
<li>13:00 Lunch</li>
<li>16:00 Rice terraces</li>
<li>19:00 Sunset</li>
</ul>
</div>

<div style={styles.card}>
<h2>Roadmap</h2>
<ul>
<li>✔ Landing</li>
<li>✔ Planner</li>
<li>⏳ AI generation</li>
<li>⏳ Maps</li>
<li>⏳ Authentication</li>
</ul>
</div>
</div>
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
