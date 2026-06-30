
import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter,Routes,Route,Link} from 'react-router-dom';

const card={background:'#151d2f',padding:20,borderRadius:16,flex:'1',minWidth:220};

function Home(){
return <div style={{background:'#0b1220',minHeight:'100vh',color:'#fff',fontFamily:'Arial'}}>
<header style={{display:'flex',justifyContent:'space-between',padding:'24px 48px'}}>
<b>NEXVI</b><nav><Link to='/' style={{color:'#fff',marginRight:20}}>Home</Link><Link to='/planner' style={{color:'#fff'}}>Planner</Link></nav>
</header>
<section style={{padding:'40px 48px'}}>
<h1 style={{fontSize:60,margin:0}}>Your AI Travel Companion</h1>
<p style={{maxWidth:640,color:'#b8c0d6'}}>Build detailed trips in seconds with AI.</p>
<Link to='/planner'><button style={{padding:'14px 24px',borderRadius:12,border:0}}>Start Planning</button></Link>
<div style={{display:'flex',gap:20,marginTop:60,flexWrap:'wrap'}}>
<div style={card}><h3>🤖 AI Routes</h3><p>Automatic day-by-day plans.</p></div>
<div style={card}><h3>🗺 Smart Maps</h3><p>Optimized travel order.</p></div>
<div style={card}><h3>💰 Budget</h3><p>Track expenses by day.</p></div>
</div>
</section>
</div>
}
function Planner(){
return <div style={{padding:40,fontFamily:'Arial'}}>
<h2>Create Trip</h2>
<input placeholder='Country' style={{display:'block',margin:'8px 0',padding:12,width:320}}/>
<input placeholder='City' style={{display:'block',margin:'8px 0',padding:12,width:320}}/>
<input placeholder='Budget (USD)' style={{display:'block',margin:'8px 0',padding:12,width:320}}/>
<button style={{padding:'12px 20px'}}>Generate Demo</button>
</div>}
ReactDOM.createRoot(document.getElementById('root')).render(
<BrowserRouter><Routes><Route path='/' element={<Home/>}/><Route path='/planner' element={<Planner/>}/></Routes></BrowserRouter>);
