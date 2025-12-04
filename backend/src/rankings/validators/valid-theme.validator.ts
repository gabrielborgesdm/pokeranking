import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isValidThemeId } from '@pokeranking/shared';

@ValidatorConstraint({ name: 'ValidTheme', async: false })
export class ValidTheme implements ValidatorConstraintInterface {
  validate(themeId: unknown) {
    // Optional field - undefined/null is valid
    if (themeId === undefined || themeId === null) {
      return true;
    }

    // Must be a string
    if (typeof themeId !== 'string') {
      return false;
    }

    // Must be a valid theme ID
    return isValidThemeId(themeId);
  }

  defaultMessage() {
    return 'Theme must be a valid theme ID';
  }
}
