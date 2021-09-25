import { IResponse } from './types/IResponse'

export const STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  NOT_FOUND: 'not_found',
  IMAGE_NOT_FOUND: 'image_not_found',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  ALREADY_REGISTERED: 'already_registered',
  FIELD_VALIDATION_ERROR: 'field_validation_error',
  INVALID_CREDENTIALS: 'invalid_credentials'
}

export const CODE = {
  SUCCESS: 200,
  ERROR: 500,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 200,
  IMAGE_NOT_FOUND: 200,
  ALREADY_REGISTERED: 200,
  FIELD_VALIDATION_ERROR: 200,
  INVALID_CREDENTIALS: 200
}

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
}

export const USER_KEYS = {
  _ID: '_id',
  ROLE: 'role',
  USERNAME: 'username',
  PASSWORD: 'password',
  BIO: 'bio',
  __V: '__v',
  EMAIL: 'email',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt'
}

export const MESSAGES = {
  en: {
    success: 'Operation executed with success',
    error: 'An unexpected error occurred',
    unauthorized: 'Unauthorized access',
    forbidden: 'Forbidden access',
    field_validation_error: 'There are invalid fields',
    not_found: 'Resource was not found',
    image_not_found: 'Image not found',
    already_registered: 'Resource was already registered',
    invalid_credentials: 'Invalid credentials'
  },
  pt: {
    success: 'Operação executada com sucesso',
    error: 'Um erro inesperado ocorreu',
    unauthorized: 'Acesso não autorizado',
    forbidden: 'Acesso proibido',
    field_validation_error: 'Há campos inválidos',
    not_found: 'Recurso não encontrado',
    image_not_found: 'Imagem não encontrada',
    already_registered: 'Recurso já foi registrado',
    invalid_credentials: 'Credenciais inválidas'
  }
}

export const IMAGE_ROUTE_URL = 'image'

export const SUCCESS: IResponse = {
  success: true,
  status: STATUS.SUCCESS,
  code: CODE.SUCCESS
}

export const ERROR: IResponse = {
  success: false,
  status: STATUS.ERROR,
  code: CODE.ERROR
}

export const UNAUTHORIZED: IResponse = {
  success: false,
  status: STATUS.UNAUTHORIZED,
  code: CODE.UNAUTHORIZED
}

export const FORBIDDEN: IResponse = {
  success: false,
  status: STATUS.FORBIDDEN,
  code: CODE.FORBIDDEN
}

export const FIELD_VALIDATION_ERROR: IResponse = {
  success: false,
  status: STATUS.FIELD_VALIDATION_ERROR,
  code: CODE.FIELD_VALIDATION_ERROR
}

export const POKEMON_NOT_FOUND: IResponse = {
  success: false,
  status: STATUS.NOT_FOUND,
  code: CODE.NOT_FOUND
}

export const USER_NOT_FOUND: IResponse = {
  success: false,
  status: STATUS.NOT_FOUND,
  code: CODE.NOT_FOUND
}

export const IMAGE_NOT_FOUND: IResponse = {
  success: false,
  status: STATUS.IMAGE_NOT_FOUND,
  code: CODE.IMAGE_NOT_FOUND
}

export const USER_ALREADY_REGISTERED: IResponse = {
  success: false,
  status: STATUS.ALREADY_REGISTERED,
  code: CODE.ALREADY_REGISTERED
}

export const POKEMON_ALREADY_REGISTERED: IResponse = {
  success: false,
  status: STATUS.ALREADY_REGISTERED,
  code: CODE.ALREADY_REGISTERED
}

export const INVALID_CREDENTIALS: IResponse = {
  success: false,
  status: STATUS.INVALID_CREDENTIALS,
  code: CODE.INVALID_CREDENTIALS
}

export const NUMBER_POKEMONS = 929
