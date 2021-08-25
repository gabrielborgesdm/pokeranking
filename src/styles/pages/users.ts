import { Row } from 'react-bootstrap'
import styled from 'styled-components'

export const CustomUserBoxRow = styled(Row)`
  display: flex;
  margin: 25px 0;
  justify-content: space-between;
`

export const CustomUserBox = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  font-weight: bold;
  padding: 15px 25px;
  border-radius: 3px;
  transition: all 0.3s;
  &:hover {
    cursor: pointer;
    filter: brightness(0.9);
    -webkit-box-shadow: 5px 5px 0px 0px #404040, 10px 10px 0px 0px #595959, 15px 15px 0px 0px #737373; 
    box-shadow: 5px 5px 0px 0px #404040, 10px 10px 0px 0px #595959, 15px 15px 0px 0px #737373;
  }
`

export const CustomUserBoxTitle = styled.span`
  margin-left: 25px;
`
