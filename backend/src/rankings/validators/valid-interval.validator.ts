import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'ValidInterval', async: false })
export class ValidInterval implements ValidatorConstraintInterface {
  validate(interval: unknown) {
    if (!Array.isArray(interval) || interval.length !== 2) {
      return false;
    }

    const [start, end] = interval as [unknown, unknown];

    // Start must be a number
    if (typeof start !== 'number') {
      return false;
    }

    // Start must be >= 1
    if (start < 1) {
      return false;
    }

    // End can be null (unbounded) or a number >= start
    if (end === null) {
      return true;
    }

    if (typeof end !== 'number') {
      return false;
    }

    // End must be >= start (allows single position zones like [5,5])
    if (end < start) {
      return false;
    }

    return true;
  }

  defaultMessage() {
    return 'Interval must be [start, end] where start >= 1 and end >= start (or null for unbounded)';
  }
}
