export default class BadRequestException extends Error {
  statusCode: number
  message: string
  constructor (message: string) {
    super(message)

    this.message = message
    this.statusCode = 400
  }
}
