import React from 'react'
import { Container, Nav, Navbar } from 'react-bootstrap'
import { CustomNavbar } from '../styles/common'

const NavbarComponent: React.FC = () => {
  return (
    <CustomNavbar variant="dark">
      <Container>
      <Navbar.Brand href="#home">Navbar</Navbar.Brand>
      <Nav className="me-auto">
        <Nav.Link href="#home">Home</Nav.Link>
        <Nav.Link href="#features">Features</Nav.Link>
        <Nav.Link href="#pricing">Pricing</Nav.Link>
      </Nav>
      </Container>
    </CustomNavbar>
  )
}

export default NavbarComponent
