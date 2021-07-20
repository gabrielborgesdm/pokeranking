
export const STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  NOT_FOUND: 'not_found',
  ALREADY_REGISTERED: 'already_registered',
  FIELD_VALIDATION_ERROR: 'field_validation_error',
  UNAUTHORIZED: 'unauthorized'
}

export const CODE = {
  SUCCESS: 200,
  ERROR: 500,
  NOT_FOUND: 200,
  ALREADY_REGISTERED: 200,
  FIELD_VALIDATION_ERROR: 422,
  UNAUTHORIZED: 401
}

export const SUCCESS = {
  success: true,
  message: 'Operation executed with success',
  status: STATUS.SUCCESS,
  code: CODE.SUCCESS
}

export const ERROR = {
  success: false,
  message: 'An unexpected error occurred',
  status: STATUS.ERROR,
  code: CODE.ERROR
}

export const USER_NOT_FOUND = {
  success: false,
  message: 'User was not found',
  status: STATUS.NOT_FOUND,
  code: CODE.NOT_FOUND
}

export const USER_ALREADY_REGISTERED = {
  success: false,
  message: 'User is already registered',
  status: STATUS.ALREADY_REGISTERED,
  code: CODE.ALREADY_REGISTERED
}

export const UNAUTHORIZED = {
  success: false,
  message: 'Unauthorized user',
  status: STATUS.UNAUTHORIZED,
  code: CODE.UNAUTHORIZED
}
