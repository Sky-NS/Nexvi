import React from 'react';
import {createRoot} from 'react-dom/client';
import './styles.css';

function App(){
return <div className="wrap">
<h1>✈️ TripCraft</h1>
<p>Создай идеальное путешествие за несколько минут.</p>
<div className="card">
<input placeholder="Страна"/>
<input placeholder="Город"/>
<input type="date"/>
<input type="date"/>
<input placeholder="Бюджет (USD)"/>
<button onClick={()=>alert('В следующей версии здесь появится генерация маршрута!')}>Создать маршрут</button>
</div>
</div>
}
createRoot(document.getElementById('root')).render(<App/>);
