
import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter,Routes,Route,Link} from 'react-router-dom';

const Home=()=>(
<div style={{minHeight:'100vh',background:'#0B1220',color:'white',fontFamily:'Inter,Arial',padding:'40px'}}>
<nav style={{display:'flex',justifyContent:'space-between',marginBottom:60}}>
<b>NEXVI</b>
<div style={{display:'flex',gap:20}}>
<Link to='/' style={{color:'white'}}>Home</Link>
<Link to='/planner' style={{color:'white'}}>Planner</Link>
</div>
</nav>
<h1 style={{fontSize:56,marginBottom:10}}>Stop planning.<br/>Start exploring.</h1>
<p style={{maxWidth:600,color:'#b6bfd3'}}>AI Travel Companion that will build your journey.</p>
<Link to='/planner'><button style={{marginTop:30,padding:'14px 22px',borderRadius:12,border:0,cursor:'pointer'}}>Start Planning</button></Link>
</div>);
const Planner=()=>(
<div style={{padding:40,fontFamily:'Arial'}}>
<h2>Create your trip</h2>
<input placeholder='Country' style={{display:'block',margin:'10px 0',padding:10,width:300}}/>
<input placeholder='City' style={{display:'block',margin:'10px 0',padding:10,width:300}}/>
<button>Generate (demo)</button>
</div>);
ReactDOM.createRoot(document.getElementById('root')!).render(
<BrowserRouter><Routes><Route path='/' element={<Home/>}/><Route path='/planner' element={<Planner/>}/></Routes></BrowserRouter>);
