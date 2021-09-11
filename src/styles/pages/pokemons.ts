import { Col, Popover } from 'react-bootstrap'
import styled from 'styled-components'
import { colors } from '../theme'

export const CustomPokemonContainer = styled(Col)`
  overflow-x: auto;

  @media (min-width: 768px) and (max-width: 846px), (max-width: 346px) {
    img {
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

export const CustomPokemonBox = styled.div`
  display: flex;
  align-items: center;
  margin: 15px 0;
  height: 110px;
  padding: 0 10px;
  border-radius: 3px;
  position: relative;
  transition: all 0.3s;
  svg {
    &:hover {
      filter: brightness(0.8);
      cursor: pointer;
    }
  }
`

export const CustomPokemonBoxTitle = styled.span`
  margin-left: 10px;
  font-size: 1.1rem;
`
export const CustomPokemonToolsBox = styled.div`
  position: absolute;
  display: flex;
  top: 15px;
  right: 15px;
`
export const CustomPokemonPopover = styled(Popover)`
  width: 400px;
`

export const CustomPokemonPopoverHeader = styled(Popover.Header)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${colors.blue};
  color: ${colors.white};
  svg{
    cursor: pointer;
  }
`

export const CustomPokerankingNav = styled.div`
  background-color: ${colors.dark};
  border-radius: 5px;
  margin: 0 4px; 
  padding: 25px 15px;
  justify-content: space-between;
  font-size: 1.2rem;

  h3 {
    margin-bottom: 0;
  }

  .nav-title {
    display: flex;
    align-items: center;
    
  }

  .nav-buttons {
    display: flex;
    align-items: center;
  }
`
