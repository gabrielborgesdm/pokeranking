import { Transform } from 'class-transformer';
import type { TransformOptionsWithContext } from '../../common/utils/transform.util';

interface LikedByItem {
  _id?: { toString(): string };
  toString(): string;
}

interface RankingWithLikedBy {
  likedBy?: LikedByItem[];
}

/**
 * Transform decorator to check if the current user has liked a ranking
 * Expects userId to be passed in transformation options
 */
export function TransformIsLiked() {
  return Transform(({ obj, options }) => {
    const userId = (options as TransformOptionsWithContext)?.userId;
    if (!userId) return false;

    const ranking = obj as RankingWithLikedBy;
    return (
      ranking.likedBy?.some((item: LikedByItem) => {
        const itemId = item._id ?? item;
        return itemId.toString() === userId;
      }) ?? false
    );
  });
}
