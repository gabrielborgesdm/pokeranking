import { createGlobalStyle } from 'styled-components'
import background from '../assets/images/background.png'

export default createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    background-image: url("/images/background.png");
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
    font: 400 16px Roboto, sans-serif;
  }

  html,
  body,
  body > div:first-child,
  div#__next,
  div#__next > div {
    height: 100%;
  }
`
