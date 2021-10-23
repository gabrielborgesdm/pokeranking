export const handleScrollAndGetNumberOfElementsToRender = (
  event: any,
  numberOfElementsRendered: number,
  allElements: number
) => {
  let newNumberOfElementsRendered = numberOfElementsRendered
  const container = event.target
  const isNearBottom =
    container.scrollHeight - container.scrollTop <= container.clientHeight + 300
  if (isNearBottom) {
    newNumberOfElementsRendered =
      numberOfElementsRendered + 30 > allElements
        ? allElements
        : numberOfElementsRendered + 30
  }
  return newNumberOfElementsRendered
}

export const scrollBackToTop = () => {
  const container = document.querySelector('.container')
  if (!container) return
  container.scrollTo(0, 0)
}
