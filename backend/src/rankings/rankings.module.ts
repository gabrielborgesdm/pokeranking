import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RankingsController } from './rankings.controller';
import { RankingsService } from './rankings.service';
import { Ranking, RankingSchema } from './schemas/ranking.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ranking.name, schema: RankingSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => UsersModule),
  ],
  controllers: [RankingsController],
  providers: [RankingsService],
  exports: [RankingsService, MongooseModule],
})
export class RankingsModule {}
