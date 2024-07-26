  import { useState } from 'react'
  import Three from './Three'

  function App() {
    const [parked, setParked] = useState(false)
    return <>
    {parked && <div className="text"> Hurray the car is parked</div>}
    <Three setParked={setParked}/>
    </>
  }

  export default App
