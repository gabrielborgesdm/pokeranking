import React from 'react'
import { IStatus, IStatusStyle, IStatusType } from '../../config/types/IStatus'
import { StatusContainer } from '../../styles/common'
import { colors } from '../../styles/theme'

const StatusBar: React.FC<IStatus> = ({ message = '', type = 'success' }: IStatus) => {
  return (
    <StatusContainer style={{ ...getStatusStyle(message, type) }}>
      {message || <>&nbsp;</>}
    </StatusContainer>
  )
}

const getStatusStyle = (message: string, type: string): IStatusStyle => {
  const styles: IStatusStyle = { color: colors.white, display: 'none' }
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
