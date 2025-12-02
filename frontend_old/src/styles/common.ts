import styled from 'styled-components'
import { Button, Col, Navbar, Row } from 'react-bootstrap'
import { colors } from './theme'

export const FullScreenContainer = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`
export const CustomButtonStyle = styled(Button)`
  background: ${colors.blue};
  border: ${colors.blue};
  min-width: 80px;

  &:hover {
    filter: brightness(0.9);
  }
`

export const AccountContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 35rem;
  border: 1px solid ${colors.dark};
  border-radius: 5px;
  margin: 15px;
  background: ${colors.dark};
  padding: 15px 25px;
  color: ${colors.white};
`
export const MainContainer = styled.div`
  width: 100%;
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
  justify-content: center;
  align-items: center;
  transition: all 0.5s;
`

export const CustomNavbar = styled(Navbar)`
  background: ${colors.grey};
  color: white;
  padding: 10px 10px;
`

export const NavbarTitle = styled.span`
  font-size: 1.2rem;
  color: ${colors.grey};
  font-weight: bold;
`

export const CustomBoxRow = styled(Row)`
  display: flex;
  margin: 25px 0;
  justify-content: space-between;
  flex-grow: 1;
`

export const PokemonListingContainer = styled(Col)`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: calc(100vh - 260px);
  @media (min-width: 768px) and (max-width: 846px), (max-width: 346px) {
    img.pokemon-image {
      display: none !important;
    }
  }
  .container-name {
    width: 10%;
  }
  .container-name span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`
export const FloatingContainer = styled(Col)`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`

export const CustomBox = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0;
  font-size: 1.2rem;
  font-weight: bold;
  height: 110px;
  padding: 0 10px;
  border-radius: 3px;
  position: relative;
  transition: all 0.3s;
  &:hover {
    cursor: pointer;
    filter: brightness(0.9);
    -webkit-box-shadow: 5px 5px 0px 0px #404040, 10px 10px 0px 0px #595959,
      15px 15px 0px 0px #737373;
    box-shadow: 5px 5px 0px 0px #404040, 10px 10px 0px 0px #595959,
      15px 15px 0px 0px #737373;
  }
`

export const CustomBoxTitle = styled.span`
  margin-left: 25px;
`
