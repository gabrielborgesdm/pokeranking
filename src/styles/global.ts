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


  .ml-10px { 
    margin-left: 10px;
  }
  
  .ml-0 { 
    margin-left: 0px;
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
    color: ${colors.white} !important;
    font-weight: 500;
  }

  /* width */
  ::-webkit-scrollbar {
    width: 12px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    box-shadow: inset 0 0 2px grey; 
    border-radius: 5px;
  }
  
  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: ${colors.blue}; 
    border-radius: 10px;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: ${colors.lightGrey};
  }

  .modal-content {
    background-color: ${colors.blue};
    color: ${colors.white};
  }

  .modal-header {
    border: none;
    box-shadow: 0 1px 4px 1px ${colors.dark};
  }

  .cursor-pointer {
    cursor: pointer;
  }
`
