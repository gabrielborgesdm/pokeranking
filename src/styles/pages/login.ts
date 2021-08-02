import styled from 'styled-components'
import { colors } from '../theme'

export const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 35rem;
  border: 1px solid ${colors.dark};
  border-radius: 5px;
  background: ${colors.dark};
  padding: 15px;
  color: ${colors.white}
`
