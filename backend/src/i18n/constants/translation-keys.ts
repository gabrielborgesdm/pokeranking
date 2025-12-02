export const TK = {
  AUTH: {
    INVALID_CREDENTIALS: 'auth.invalidCredentials',
    EMAIL_NOT_VERIFIED: 'auth.emailNotVerified',
    INVALID_VERIFICATION_CODE: 'auth.invalidVerificationCode',
    EMAIL_ALREADY_VERIFIED: 'auth.emailAlreadyVerified',
  },
  USERS: {
    NOT_FOUND: 'users.notFound',
    EMAIL_EXISTS: 'users.emailExists',
    USERNAME_EXISTS: 'users.usernameExists',
    CANNOT_UPDATE_OTHERS: 'users.cannotUpdateOthers',
  },
  POKEMON: {
    NOT_FOUND: 'pokemon.notFound',
    NAME_EXISTS: 'pokemon.nameExists',
  },
  RANKINGS: {
    NOT_FOUND: 'rankings.notFound',
    TITLE_EXISTS: 'rankings.titleExists',
    CANNOT_MODIFY_OTHERS: 'rankings.cannotModifyOthers',
    ZONE_EXCEEDS_POKEMON: 'rankings.zoneExceedsPokemon',
  },
  BOXES: {
    NOT_FOUND: 'boxes.notFound',
    NAME_EXISTS: 'boxes.nameExists',
    CANNOT_FAVORITE_OWN: 'boxes.cannotFavoriteOwn',
    CANNOT_MODIFY_OTHERS: 'boxes.cannotModifyOthers',
    UNABLE_TO_GENERATE_NAME: 'boxes.unableToGenerateName',
  },
  COMMON: {
    TOO_MANY_VERIFICATION_ATTEMPTS: 'common.tooManyVerificationAttempts',
    TOO_MANY_RESEND_ATTEMPTS: 'common.tooManyResendAttempts',
  },
} as const;
