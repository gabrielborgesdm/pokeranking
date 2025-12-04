import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

const ALLOWED_EXTENSIONS = ['.png'];
const INVALID_CHARS = /[/\\<>:"|?*]/; // Path traversal and special chars
const PATH_TRAVERSAL = /\.\./;

function isValidFilename(value: string): boolean {
  // Check for path traversal
  if (PATH_TRAVERSAL.test(value)) {
    return false;
  }

  // Check for invalid characters
  if (INVALID_CHARS.test(value)) {
    return false;
  }

  // Check extension
  const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) =>
    value.toLowerCase().endsWith(ext),
  );

  return hasValidExtension;
}

function isValidWhitelistedUrl(value: string): boolean {
  try {
    const url = new URL(value);

    // Get allowed domains from environment
    const allowedDomains =
      process.env.ALLOWED_IMAGE_DOMAINS || 'res.cloudinary.com';
    const domainList = allowedDomains.split(',').map((d) => d.trim());

    // Check if domain matches any in whitelist (support subdomain matching)
    return domainList.some(
      (domain) =>
        url.hostname === domain || url.hostname.endsWith(`.${domain}`),
    );
  } catch {
    return false; // Invalid URL format
  }
}

export function IsImageString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isImageString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') {
            return false;
          }

          // Accept either a valid filename OR a valid whitelisted URL
          return isValidFilename(value) || isValidWhitelistedUrl(value);
        },
        defaultMessage(args: ValidationArguments) {
          const allowedDomains =
            process.env.ALLOWED_IMAGE_DOMAINS || 'res.cloudinary.com';
          return `${args.property} must be either a valid filename (${ALLOWED_EXTENSIONS.join(', ')}) without path traversal characters, or a URL from allowed domains (${allowedDomains})`;
        },
      },
    });
  };
}
