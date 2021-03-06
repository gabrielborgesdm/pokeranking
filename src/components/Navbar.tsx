import {
  faGamepad,
  faQuestionCircle,
  faSignInAlt,
  faSignOutAlt,
  faTrophy,
  faUserCircle,
  faUsers,
  IconDefinition
} from '@fortawesome/fontawesome-free-solid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import React, { useContext } from 'react'
import { Container, Nav, Navbar } from 'react-bootstrap'
import { PAGE_URL } from '../configs/AppConfig'
import { AuthContext } from '../models/AuthContext'
import { CustomNavbar } from '../styles/common'
import { colors } from '../styles/theme'

const NavbarComponent: React.FC = () => {
  const router = useRouter()
  const { t } = useTranslation('common')
  const { checkIsAuthenticated } = useContext(AuthContext)

  const navigate = (link: string) => {
    router.push(link)
  }

  const getNavLink = (link: string, title: string, icon?: IconDefinition) => {
    return (
      <Nav.Link
        className={`nav-link d-flex align-items-center ml-10px ${
          router.pathname.includes(link) ? 'active-nav-link' : ''
        }`}
        href=""
        onClick={() => navigate(link)}
      >
        {icon && (
          <>
            <FontAwesomeIcon icon={icon} size="1x" />
            &nbsp;
          </>
        )}
        {title}
      </Nav.Link>
    )
  }

  return (
    <CustomNavbar
      variant="dark"
      expand="lg"
      style={{ backgroundColor: colors.blue }}
    >
      <Container fluid={true}>
        <Navbar.Brand
          href={PAGE_URL.USERS}
          className="d-flex align-items-center"
        >
          <img
            src="/images/pokeranking.png"
            style={{ width: '100%', maxHeight: '40px' }}
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            {checkIsAuthenticated() && getNavLink(PAGE_URL.POKEMONS, t('my-ranking'), faTrophy)}
            {getNavLink(PAGE_URL.USERS, t('users'), faUsers)}
            {getNavLink(PAGE_URL.ABOUT, t('about'), faQuestionCircle)}
            {getNavLink(PAGE_URL.LIST_POKEMONS, t('pokemons'), faGamepad)}
          </Nav>
          {checkIsAuthenticated()
            ? <Nav>
                {getNavLink(PAGE_URL.ACCOUNT, t('my-account'), faUserCircle)}
                {getNavLink(PAGE_URL.LOGIN, t('logout'), faSignOutAlt)}
              </Nav>
            : <Nav>
                {getNavLink(PAGE_URL.LOGIN, t('login'), faSignInAlt)}
              </Nav>
          }
        </Navbar.Collapse>
      </Container>
    </CustomNavbar>
  )
}

export default NavbarComponent
