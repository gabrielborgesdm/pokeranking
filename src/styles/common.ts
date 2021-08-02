import styled from 'styled-components'
import { Button } from 'react-bootstrap'
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
  padding: 15px;
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
