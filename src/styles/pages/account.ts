import { Col } from 'react-bootstrap'
import styled from 'styled-components'
import { colors } from '../theme'

export const AccountFormContainer = styled(Col)`
  background-color: ${colors.blue};
  padding: 15px;
  border-radius: 3px;
  margin: 35px 0;

`

export const CustomPokemonAvatar = styled.div`
  width: 250px;
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${colors.grey};
  border-radius: 15px;
  margin-bottom: 15px;
  padding: 20px;
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
