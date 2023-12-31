import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Board from './components/board.jsx';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div className="App" >
   
      <h1>Collaborative Whiteboard</h1>
      <div>
      <Board />
      </div>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
      </div>
    </>
  )
}

export default App
