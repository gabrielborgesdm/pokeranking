import { Col } from 'react-bootstrap'
import styled from 'styled-components'
import { colors } from '../theme'

export const FormContainer = styled(Col)`
  background-color: ${colors.blue};
  padding: 20px;
  border-radius: 5px;
  margin: 35px 0;

`

export const CustomPokemonAvatar = styled.div`
  width: 250px;
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 15px;
  margin-bottom: 15px;
  padding: 10px;
  position: relative;
  .toolbox {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 1;
  }
  .toolbox svg {
    color: ${colors.yellow};
    transition: all 0.2s;
    :hover {
      color: ${colors.orange};
      cursor: pointer;
    }
  }
`
