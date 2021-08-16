import React from 'react'
import { IStatus, IStatusStyle, IStatusType } from '../configs/types/IStatus'
import { StatusContainer } from '../styles/common'
import { colors } from '../styles/theme'

const StatusBar: React.FC<IStatus> = ({ message = '', type = IStatusType.Success, onClick }: IStatus) => {
  return (
    <StatusContainer style={{ ...getStatusStyle(message, type, onClick) }}>
      <div onClick={onClick ? () => { onClick() } : () => {}}>
        {message || <>&nbsp;</>}
      </div>
    </StatusContainer>
  )
}

const getStatusStyle = (message: string, type: string, onClick: Function): IStatusStyle => {
  const styles: IStatusStyle = { color: colors.white, display: 'none' }
  if (onClick) styles.cursor = 'pointer'
  if (!message) return styles
  switch (type) {
    case IStatusType.Warning:
      styles.backgroundColor = colors.yellow
      styles.color = colors.lightGrey
      break

    case IStatusType.Danger:
      styles.backgroundColor = colors.red
      break

    default:
      styles.backgroundColor = colors.green
      break
  }
  delete styles.display
  return styles
}

export default StatusBar
