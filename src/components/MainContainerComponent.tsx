import React from 'react'
import { Container } from 'react-bootstrap'
import { MainContainer } from '../styles/common'
import NavbarComponent from './Navbar'

type Props = {
  children?: React.ReactNode
};

const MainContainerComponent: React.FC<Props> = ({ children }: Props) => {
  return (
      <MainContainer>
        <NavbarComponent />
        <Container fluid={true}>
          {children}
        </Container>
      </MainContainer>
  )
}

export default MainContainerComponent
