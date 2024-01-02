import { useState, useEffect } from 'react'
import './App.css'
import Board from './components/board.jsx';

function App() {
  const [brushColor, setBrushColor] = useState('black');
  const [brushSize, setBrushSize] = useState(5);
  const [clearCanvas, setClearCanvas] = useState(false);

  return (
    <>
    <div className="App" >
   
      <h1>Collaborative Whiteboard</h1>
      <div>
      <Board brushColor={brushColor} brushSize={brushSize} clearCanvas={clearCanvas} setClearCanvas={setClearCanvas} />
        <div className='tools' >
          <div>
            <span>Color: </span>
            <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} />
          </div>
          <div>
            <span>Size: </span>
            <input type="range" color='#fac176'
              min="1" max="100" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} />
            <span>{brushSize}</span>
          </div>
          <div>
            <button onClick={(e) => setClearCanvas(true)}>Clear</button>
          </div>
        </div>
      </div>
 
      </div>
    </>
  )
}

export default App
