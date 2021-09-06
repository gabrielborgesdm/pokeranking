import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useTranslation from 'next-translate/useTranslation'
import React, { ReactNode } from 'react'
import { faSpinner } from '@fortawesome/fontawesome-free-solid'
import { BlueButton } from '../styles/common'

interface IFormButton {
  className?: string,
  children?: ReactNode,
  type?: string,
  isLoading?: boolean,
  isDisabled?: boolean,
  onClick?: Function,
}

const FormButton: React.FC<IFormButton> = ({ className, children, type = 'submit', onClick, isLoading, isDisabled }: IFormButton) => {
  const { t } = useTranslation('common')
  return (
    <BlueButton variant="secondary" className={className} type={type} onClick={onClick} disabled={isLoading || isDisabled}>
      {isLoading
        ? (
        <>
          <FontAwesomeIcon icon={faSpinner} spin />&nbsp;
          {t('loading')}
        </>
          )
        : children}
    </BlueButton>
  )
}

export default FormButton
