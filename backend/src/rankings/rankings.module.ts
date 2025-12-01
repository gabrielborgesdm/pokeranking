import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RankingsController } from './rankings.controller';
import { RankingsService } from './rankings.service';
import { Ranking, RankingSchema } from './schemas/ranking.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ranking.name, schema: RankingSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [RankingsController],
  providers: [RankingsService],
  exports: [RankingsService, MongooseModule],
})
export class RankingsModule {}
