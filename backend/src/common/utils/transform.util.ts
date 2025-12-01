import { plainToInstance, ClassConstructor } from 'class-transformer';
import { Types } from 'mongoose';

/**
 * Transform plain object(s) to DTO instance(s) with excludeExtraneousValues enabled
 * @param cls The DTO class constructor
 * @param plain The plain object or array of objects to transform
 * @returns Transformed DTO instance or array of instances
 */
export function toDto<T>(cls: ClassConstructor<T>, plain: unknown[]): T[];
export function toDto<T>(cls: ClassConstructor<T>, plain: unknown): T;
export function toDto<T>(cls: ClassConstructor<T>, plain: unknown): T | T[] {
  return plainToInstance(cls, plain, { excludeExtraneousValues: true });
}

/**
 * Transform ObjectId to string for DTO responses
 * Use with @Transform decorator
 */
export const transformObjectId = ({
  obj,
}: {
  obj: Record<string, unknown>;
}) => {
  const id = obj['_id'];
  if (id && typeof id === 'object' && 'toString' in id) {
    return (id as Types.ObjectId).toString();
  }
  return id;
};

/**
 * Transform array of ObjectIds to array of strings
 * Use with @Transform decorator
 */
export const transformObjectIdArray = ({
  obj,
  key,
}: {
  obj: Record<string, unknown>;
  key: string;
}): string[] => {
  const value = obj[key];
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (item && typeof item === 'object' && 'toString' in item) {
        return (item as Types.ObjectId).toString();
      }
      return String(item);
    });
  }
  return [];
};

export const stripUndefined = <T extends object>(obj: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
};
