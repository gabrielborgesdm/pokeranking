import { registerDecorator, ValidationOptions } from 'class-validator';

interface ZoneWithInterval {
  interval: [number, number | null];
}

export function AreZonesNonOverlapping(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'areZonesNonOverlapping',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(zones: ZoneWithInterval[]) {
          if (!Array.isArray(zones) || zones.length === 0) {
            return true; // Empty or single zone is valid
          }

          // Sort zones by start position
          const sorted = [...zones].sort(
            (a, b) => a.interval[0] - b.interval[0],
          );

          // Check for overlaps
          for (let i = 0; i < sorted.length - 1; i++) {
            const currentZone = sorted[i];
            const nextZone = sorted[i + 1];

            if (!currentZone || !nextZone) {
              continue;
            }

            const currentEnd = currentZone.interval[1];
            const nextStart = nextZone.interval[0];

            // If current zone has null end (unbounded), it must be the last zone
            // Having a zone after an unbounded zone means they overlap
            if (currentEnd === null) {
              return false;
            }

            // If current zone ends at or after next zone starts, they overlap
            if (currentEnd >= nextStart) {
              return false; // Overlap detected
            }
          }

          return true;
        },
        defaultMessage() {
          return 'Zone intervals must not overlap. Unbounded zones (with null end) must be last.';
        },
      },
    });
  };
}
