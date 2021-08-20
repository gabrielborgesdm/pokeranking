import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useTranslation from 'next-translate/useTranslation'
import React from 'react'
import { faSpinner } from '@fortawesome/fontawesome-free-solid'
import { BlueButton } from '../styles/common'

interface IFormButton {
  title: string,
  type?: string,
  isLoading?: boolean,
  isDisabled?: boolean,
  onClick?: Function,
}

const FormButton: React.FC<IFormButton> = ({ title, type = 'submit', onClick, isLoading, isDisabled }: IFormButton) => {
  const { t } = useTranslation('common')
  return (
    <BlueButton variant="secondary" type={type} onClick={onClick} disabled={isLoading || isDisabled}>
      {isLoading
        ? (
        <>
          <FontAwesomeIcon icon={faSpinner} spin />&nbsp;
          {t('loading')}
        </>
          )
        : title}
    </BlueButton>
  )
}

export default FormButton
