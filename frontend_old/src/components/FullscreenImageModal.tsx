import React from 'react'
import { Image, Modal } from 'react-bootstrap'

interface IFullscreenImageModal {
  isVisible: boolean
  setIsVisible: (isVisible: boolean) => void
  imageURL: string
  modalTitle: string
}

export const FullscreenImageModal: React.FC<IFullscreenImageModal> = ({
  isVisible,
  setIsVisible,
  imageURL,
  modalTitle
}: IFullscreenImageModal) => {
  return (
    <Modal
      show={isVisible}
      fullscreen={true}
      onHide={() => setIsVisible(false)}
      className="fullscreen-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>{modalTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Image fluid src={imageURL} />
      </Modal.Body>
    </Modal>
  )
}
