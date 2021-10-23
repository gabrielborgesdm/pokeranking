import React from 'react'
import { Container } from 'react-bootstrap'
import { MainContainer } from '../styles/common'
import NavbarComponent from './Navbar'

type Props = {
  children?: React.ReactNode
  className?: string
}

const MainContainerComponent: React.FC<Props> = ({
  children,
  className
}: Props) => {
  return (
    <MainContainer className={className}>
      <NavbarComponent />
      <Container fluid={true}>{children}</Container>
    </MainContainer>
  )
}

export default MainContainerComponent
