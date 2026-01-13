import { Transform } from 'class-transformer';
import type { TransformOptionsWithContext } from '../../common/utils/transform.util';

/**
 * Transform decorator to check if the current user has liked a ranking
 * Expects userId to be passed in transformation options
 */
export function TransformIsLiked() {
  return Transform(({ obj, options }) => {
    const userId = (options as TransformOptionsWithContext)?.userId;
    if (!userId) return false;

    return (
      obj.likedBy?.some((item: any) => {
        // Handle both populated user objects and plain ObjectIds
        const itemId = item._id || item;
        return itemId.toString() === userId;
      }) ?? false
    );
  });
}
