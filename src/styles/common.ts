import styled from 'styled-components'
import { Button, Navbar } from 'react-bootstrap'
import { colors } from './theme'

export const FullScreenContainer = styled.div`
  height: 100%;
  display: flex;
  justify-content:center;
  align-items: center;
`
export const BlueButton = styled(Button)`
  background: ${colors.blue};
  border: ${colors.blue};
  min-width: 80px;
`

export const AccountContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 35rem;
  border: 1px solid ${colors.dark};
  border-radius: 5px;
  background: ${colors.dark};
  padding: 15px 25px;
  color: ${colors.white};
`
export const MainContainer = styled.div`
  width: 100%;
  min-height: 100%;
  background: ${colors.dark};
  background-image: url("/images/background.png");
  background-repeat: repeat;
  color: ${colors.white};
`

export const YellowLink = styled.a`
  color: ${colors.yellow};
  text-decoration: none;
  cursor: pointer;
  &:hover {
    color: ${colors.blue};
  }
`
export const StatusContainer = styled.div`
  display: flex;
  padding: 2.5px 0;
  margin: 15px 0;
  border-radius: 3px;
  justify-content:center;
  align-items: center;
  transition: all 0.5s;
`

export const CustomNavbar = styled(Navbar)`
  background: ${colors.grey};
  color: white;
  padding: 15px 10px;
`

export const NavbarTitle = styled.span`
  font-size: 1.2rem;
  color: ${colors.grey};
  font-weight: bold;
`
