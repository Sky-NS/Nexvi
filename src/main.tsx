
import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter,Routes,Route,Link} from 'react-router-dom';

const input={display:'block',margin:'10px 0',padding:'12px',width:'340px',borderRadius:'10px',border:'1px solid #ddd'};

function Layout({children}:{children:React.ReactNode}){
return <div style={{minHeight:'100vh',background:'#0b1220',color:'#fff',fontFamily:'Arial'}}>
<header style={{display:'flex',justifyContent:'space-between',padding:'24px 48px',borderBottom:'1px solid #1f2937'}}>
<b>NEXVI</b>
<nav>
<Link to="/" style={{color:'#fff',marginRight:20}}>Home</Link>
<Link to="/planner" style={{color:'#fff'}}>Planner</Link>
</nav>
</header>
{children}
<footer style={{padding:30,textAlign:'center',color:'#94a3b8'}}>© 2026 Nexvi</footer>
</div>
}

function Home(){
return <Layout>
<section style={{padding:'60px 48px'}}>
<h1 style={{fontSize:64,margin:0}}>Plan less.<br/>Explore more.</h1>
<p style={{maxWidth:650,color:'#b8c0d6'}}>AI-powered travel planning with day-by-day itineraries.</p>
<Link to="/planner"><button style={{padding:'14px 22px',borderRadius:12}}>Create my trip</button></Link>
</section>
</Layout>
}

function Planner(){
return <Layout>
<div style={{padding:'40px 48px'}}>
<h2>Create your trip</h2>
<input style={input} placeholder="Country"/>
<input style={input} placeholder="City"/>
<input style={input} type="date"/>
<input style={input} type="date"/>
<input style={input} placeholder="Budget USD"/>
<select style={input}><option>Nature</option><option>Food</option><option>Nightlife</option></select>
<button style={{padding:'14px 22px',borderRadius:12}}>Generate demo itinerary</button>
</div>
</Layout>
}

ReactDOM.createRoot(document.getElementById('root')!).render(
<BrowserRouter>
<Routes>
<Route path="/" element={<Home/>}/>
<Route path="/planner" element={<Planner/>}/>
</Routes>
</BrowserRouter>
);
