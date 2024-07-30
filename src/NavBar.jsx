import React from "react";
import {Modal,Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, useDisclosure,ModalContent} from "@nextui-org/react";
import SelectCars from "./SelectCars";
export default function  App() {
  // const [isOpen, setIsOpen] = React.useState(false);
  
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const closeModel=()=>{
    setIsOpen(false)
  }
  return (
    <Navbar>
      <NavbarBrand>
        {/* <AcmeLogo /> */}
        <p className="font-bold text-inherit">Fast and Furious</p>
      </NavbarBrand>

      <NavbarContent className="sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link color="foreground" href="#">
            Features
          </Link>
        </NavbarItem>
        <NavbarItem isActive>
          <Link href="#" onPress={onOpen} aria-current="page" color="secondary">
            Cars
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#">
            Integrations
          </Link>
        </NavbarItem>
      </NavbarContent>

      {/* <NavbarContent as="div" justify="end">
        
      </NavbarContent> */}
      <Modal size="4xl" style={{boxShadow:"none", background:"transparent",padding:"2rem", width:"50vw"}} isOpen={isOpen} onOpenChange={onOpenChange}> 
      <ModalContent >

      {(onClose) => (
        <SelectCars closeModel={closeModel}/>
      )}
      </ModalContent>
      </Modal>
    </Navbar>
  );
}
