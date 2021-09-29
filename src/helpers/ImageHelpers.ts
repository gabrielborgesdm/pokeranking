export const convertImageToBase64 = async (image: File): Promise<string> => {
  if (image) {
    const reader = new FileReader()

    return new Promise(resolve => {
      reader.onload = ev => {
        resolve(ev.target.result.toString())
      }
      reader.readAsDataURL(image)
    })
  }
}
