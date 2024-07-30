import  Card  from "./Card"
import React from 'react'
import cab from "./assets/cab.png"
import car1 from "./assets/car1.png"
import car2 from "./assets/car2.png"

function SelectCars({closeModel}) {
    const cars=[car1,car2,cab]
  return (
    <div className="cars-container h-fit">
        {cars.map((item,index)=><Card key={index} index={index} closeModel={closeModel} source={item}/>)}
    </div>
  )
}

export default SelectCars