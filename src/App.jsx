import { useState } from "react";
import Three from "./Three";
import NavBar from "./NavBar";
import { createContext, useContext } from 'react';

export const currentCar = createContext(null);
function App() {
  const [parked, setParked] = useState(false);
  const [option, setOption] = useState(0)
  return (
    <>
    <currentCar.Provider value={{option,setOption}}>
      <NavBar/>
      {parked && <div className="text"> Hurray the car is parked</div>}
      <Three setParked={setParked} />
      </currentCar.Provider>
    </>
  );
}

export default App;
