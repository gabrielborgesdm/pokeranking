import { Col } from 'react-bootstrap'
import styled from 'styled-components'
import { colors } from '../theme'

export const CustomUserBox = styled(Col)`
  border: 1px solid ${colors.blue};
  border-radius: 5px;
  background: ${colors.dark};
  padding: 15px;
  color: ${colors.white}
`
