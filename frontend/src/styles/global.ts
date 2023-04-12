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
    background: url("/images/background.png"), ${colors.dark};
    background-repeat: repeat;
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
    background-color: ${colors.dark};
  }

  /* Track */
  ::-webkit-scrollbar-track {
    box-shadow: inset 0 0 2px grey; 
    border-radius: 0;
  }
  
  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: ${colors.blue}; 
    border-radius: 0;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: ${colors.lightGrey};
  }

  .modal-content {
    background-color: ${colors.blue};
    color: ${colors.white};
    box-shadow: 0 1px 10px 1px ${colors.dark};
  }

  .modal-header {
    border: none;
  }

  .cursor-pointer {
    cursor: pointer;
  }
  .cursor-zoom-in {
    cursor: zoom-in;
  }

  .fullscreen-modal .modal-header {
    background-color: ${colors.blue};
  }

  .fullscreen-modal .modal-body {
    background-color: ${colors.dark};
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .fullscreen-modal img {
    margin: 0 auto;
    height: 100%;
    object-fit: contain;
  }

  .img-modal {
    object-fit: contain;
    width: 100%;
    max-height: 300px;
  }

  .text-justify{
    text-align: justify;
  }

  .bg-gold{
    background:linear-gradient(to right, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C);
  }

  .bg-silver { 
    background: linear-gradient(to right, #ADB5BD, #DEE2E6, #A4ADB6, #F3F5F6, #343A40);
  }

  .bg-bronze { 
    background: linear-gradient(to right, #b9722d, #d28c47, #a46628, #d7995b, #905923);
  }

  .bg-silver span, .bg-gold span, .bg-bronze span  {
    color: ${colors.lightGrey} !important;
  }
`
