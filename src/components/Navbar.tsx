import {
  faQuestionCircle,
  faSignOutAlt,
  faTrophy,
  faUserCircle,
  faUsers,
  IconDefinition
} from '@fortawesome/fontawesome-free-solid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React from 'react'
import { Container, Nav, Navbar } from 'react-bootstrap'
import { PAGE_URL } from '../configs/AppConfig'
import { CustomNavbar, NavbarTitle } from '../styles/common'
import { colors } from '../styles/theme'

const NavbarComponent: React.FC = () => {
  const router = useRouter()
  const { t } = useTranslation('common')

  const navigate = (link: string) => {
    router.push(link)
  }

  const getNavLink = (link: string, title: string, icon?: IconDefinition) => {
    return (
      <Nav.Link
        className={`nav-link navbar-button ml-10px ${
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
          <Image src="/pokeball.svg" height={40} width={40} />
          <NavbarTitle>{t('title')}</NavbarTitle>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            {getNavLink(PAGE_URL.POKEMONS, t('ranking'), faTrophy)}
            {getNavLink(PAGE_URL.USERS, t('users'), faUsers)}
            {getNavLink(PAGE_URL.ABOUT, t('about'), faQuestionCircle)}
          </Nav>
          <Nav>
            {getNavLink(PAGE_URL.ACCOUNT, t('my-account'), faUserCircle)}
            {getNavLink(PAGE_URL.LOGIN, t('logout'), faSignOutAlt)}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </CustomNavbar>
  )
}

export default NavbarComponent
