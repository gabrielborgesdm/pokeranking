import React from 'react'
import { useRouter } from 'next/router'
import { IStatus, IStatusStyle, IStatusType } from '../../config/types/IStatus'
import { StatusContainer } from '../../styles/common'
import { colors } from '../../styles/theme'

const StatusBar: React.FC<IStatus> = ({ message = '', type = IStatusType.Success, onClickRoute }: IStatus) => {
  const router = useRouter()
  return (
    <StatusContainer style={{ ...getStatusStyle(message, type, onClickRoute) }}>
      <div onClick={onClickRoute ? () => router.push(onClickRoute) : () => { }}>
        {message || <>&nbsp;</>}
      </div>
    </StatusContainer>
  )
}

const getStatusStyle = (message: string, type: string, onClickRoute: string): IStatusStyle => {
  const styles: IStatusStyle = { color: colors.white, display: 'none' }
  if (onClickRoute) styles.cursor = 'pointer'
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
