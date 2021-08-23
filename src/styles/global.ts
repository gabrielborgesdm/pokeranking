import { createGlobalStyle } from 'styled-components'
import { colors } from './theme'

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

  .nav-link {
    font-size: 1.2rem;
  }
  
  .active-nav-link {
    color: ${colors.yellow} !important;
  }

  html,
  body,
  body > div:first-child,
  div#__next,
  div#__next > div {
    height: 100%;
    font-family: 'Roboto', sans-serif;

  }
`
