import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useTranslation from 'next-translate/useTranslation'
import React, { ReactNode } from 'react'
import { faSpinner } from '@fortawesome/fontawesome-free-solid'
import { BlueButton } from '../styles/common'
import { colors } from '../styles/theme'

interface ICustomButton {
  className?: string;
  children?: ReactNode;
  type?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  onClick?: Function;
  color?: string;
}

const CustomButton: React.FC<ICustomButton> = ({
  className,
  children,
  type = 'submit',
  onClick,
  isLoading,
  isDisabled,
  color = colors.blue
}: ICustomButton) => {
  const { t } = useTranslation('common')
  return (
    <BlueButton variant="secondary" style={{ backgroundColor: color }} className={className} type={type} onClick={onClick} disabled={isLoading || isDisabled}>
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

export default CustomButton
