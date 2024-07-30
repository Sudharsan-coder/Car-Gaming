import React from "react";
import {Card, CardFooter, Image, Button} from "@nextui-org/react";
import {currentCar} from "./App"
export default function app({index,source,closeModel}) {
  const { option, setOption } = React.useContext(currentCar);
  return (
    <Card
      isFooterBlurred
      radius="lg"
      className="border-none justify-end items-center"
    >
      <Image
        alt="Woman listing to music"
        className="object-cover"
        height={200}
        src={source}
        width='fit-content'
      />
     
        <Button style={option==index+1?{border:"3px solid blue"}:{}} onPress={()=>{setOption(index+1)}} className="text-tiny text-white bg-black/20 w-full h-full z-10 border-4 border-indigo-600  absolute" variant="flat" color="default" radius="lg" size="lm">
          Select
        </Button>
    </Card>
  );
}
