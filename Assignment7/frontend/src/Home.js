
// Home.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Home() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('All');

  useEffect(() => {
    axios.get('http://localhost:5000/products')
      .then(res => setProducts(res.data));
  }, []);

  const filtered = category === 'All' 
    ? products 
    : products.filter(p => p.category === category);

  return (
    <div>
      <div style={{textAlign:'center'}}>
        <button onClick={()=>setCategory('All')}>All</button>
        <button onClick={()=>setCategory('Electronics')}>Electronics</button>
        <button onClick={()=>setCategory('Clothing')}>Clothing</button>
      </div>

      <div style={{display:'flex', flexWrap:'wrap', justifyContent:'center'}}>
        {filtered.map(p => (
          <div key={p._id} style={{border:'1px solid gray', margin:10, padding:10, width:200}}>
            <img src={p.image} alt='' width='100%' />
            <h3>{p.name}</h3>
            <p>₹{p.price}</p>
            <button>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;