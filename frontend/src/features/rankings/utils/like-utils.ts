import type { RankingUserResponseDto } from "@pokeranking/api-client";

/**
 * Checks if a user has liked a ranking based on the likedBy array
 */
export function isLikedByUser(
  likedBy: RankingUserResponseDto[] | undefined,
  userId: string | undefined
): boolean {
  if (!likedBy || !userId) return false;
  return likedBy.some((user) => user._id === userId);
}
