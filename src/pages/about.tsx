import useTranslation from 'next-translate/useTranslation'
import React from 'react'
import { Col, Row } from 'react-bootstrap'
import CustomPokemonImage from '../components/CustomPokemonImage'
import MainContainerComponent from '../components/MainContainerComponent'
import PokemonAvatar from '../components/PokemonAvatar'
import { getPokemonImagePath } from '../helpers/PokemonHelpers'
import { CustomBoxRow, FloatingContainer } from '../styles/common'
import { FormContainer } from '../styles/pages/account'

export const About: React.FC = () => {
  const { t } = useTranslation('about')
  const { t: c } = useTranslation('common')

  return (
    <div>
      <MainContainerComponent>
        <CustomBoxRow>
          <FloatingContainer>
            <FormContainer className="mx-auto pb-5 text-justify" xs={12}>
              <Row>
                <Col className="d-flex justify-content-center">
                  <CustomPokemonImage avatar={getPokemonImagePath('ellie_soph.png')} name="Ellie do crashlespaul" />
                </Col>
                <Col className="d-flex justify-content-center">
                  <CustomPokemonImage avatar={getPokemonImagePath('gc3hby6hcmvqfbahybrr.png')} name="Bixo feio mas simpático" />
                </Col>
                <Col className="d-flex justify-content-center">
                  <CustomPokemonImage avatar={getPokemonImagePath('lola_soph.png')} name="Lola da kssi4" />
                </Col>
              </Row>

              <Row>
                <Col className="col-12 col-md-4">
                  <Row>
                    <Col xs={12}>
                      <h3>{c('about')}</h3>
                      <hr />
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12}>
                      <p>{t('about-pokeranking')}&nbsp;</p>
                    </Col>
                  </Row>
                </Col>
                <Col className="col-12 col-md-4">
                  <Row>
                    <Col xs={12}>
                      <h3>{t('developer')}</h3>
                      <hr />
                    </Col>
                  </Row>

                  <Row>
                    <Col xs={12}>
                      <p>
                        {t('about-developer')}&nbsp;
                        <a
                          href="https://github.com/gabrielborgesdm"
                          className="text-light"
                        >
                          {c('click-here-to-have-access-to-it')}
                        </a>
                      </p>
                    </Col>
                  </Row>
                </Col>
                <Col className="col-12 col-md-4">
                  <Row>
                    <Col xs={12}>
                      <h3>{t('repository')}</h3>
                      <hr />
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12}>
                      <p>
                        {t('about-repository')}&nbsp;
                        <a
                          href="https://github.com/gabrielborgesdm/pokeranking"
                          className="text-light"
                        >
                          {c('click-here-to-have-access-to-it')}
                        </a>
                      </p>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col xs={12} className="mx-auto pt-2">
                  <h3>{t('how-to-use')}</h3>
                  <hr />
                </Col>
              </Row>
              <Row>
                <Col className="col-12 col-md-4">
                  <h5>{t('my-ranking')}</h5>
                  {t('instructions-of-my-ranking')}
                </Col>
                <Col className="col-12 col-md-4">
                  <h5>{t('users')}</h5>
                  {t('instructions-of-users')}
                </Col>
                <Col className="col-12 col-md-4">
                  <h5>{t('pokemons')}</h5>
                  {t('instructions-of-pokemons')}
                </Col>
              </Row>
            </FormContainer>
          </FloatingContainer>
        </CustomBoxRow>
      </MainContainerComponent>
    </div>
  )
}

export default About
