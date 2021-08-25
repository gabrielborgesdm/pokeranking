import { createGlobalStyle } from 'styled-components'
import { colors } from './theme'

export default createGlobalStyle`
  @font-face {
    font-family: "Roboto";
    src: url("/fonts/roboto/Roboto-Regular.ttf");
    font-style: normal;
    font-weight: 400;
    font-display: swap;
  }
  @font-face {
    font-family: "Roboto";
    src: url("/fonts/roboto/Roboto-Medium.ttf");
    font-style: medium;
    font-weight: 500;
    font-display: swap;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    background-color: ${props => props.theme.colors.background};
    background-image: url("/images/background.png");
    color: ${props => props.theme.colors.text};
  }

  .nav-link {
    font-size: 1.2rem;
  }
  
  

  html,
  body,
  body > div:first-child,
  div#__next,
  div#__next > div {
    height: 100%;
    font-family: 'Roboto', sans-serif !important;

  }
  .navbar-dark .navbar-nav .nav-link {
    color: ${colors.grey};
    font-weight: 500;
  }

  .active-nav-link {
    color: ${colors.red} !important;
    font-weight: 500;
  }
`
