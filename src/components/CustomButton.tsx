import { faSpinner } from '@fortawesome/fontawesome-free-solid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { ReactNode } from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
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
  tooltip?: string;
}

const CustomButton: React.FC<ICustomButton> = ({
  className,
  children,
  type = 'submit',
  onClick,
  isLoading,
  isDisabled,
  color = colors.blue,
  tooltip
}: ICustomButton) => {
  const renderWithOverlay = (element) => {
    const renderTooltip = (props) => (
      <Tooltip id={tooltip} {...props}>
        {tooltip}
      </Tooltip>
    )

    return (
    <OverlayTrigger
      placement="bottom"
      overlay={renderTooltip}
    >
      {element}
    </OverlayTrigger>
    )
  }

  const button = (
    <BlueButton variant="secondary" style={{ backgroundColor: color }} className={className} type={type} onClick={onClick} disabled={isLoading || isDisabled}>
      {isLoading
        ? (
        <span>
          <FontAwesomeIcon icon={faSpinner} spin />&nbsp;
        </span>
          )
        : children}
    </BlueButton>
  )
  return (tooltip ? renderWithOverlay(button) : button)
}

export default CustomButton
