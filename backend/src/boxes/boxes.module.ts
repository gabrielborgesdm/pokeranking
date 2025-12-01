import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BoxesController } from './boxes.controller';
import { BoxesService } from './boxes.service';
import { Box, BoxSchema } from './schemas/box.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { PokemonModule } from '../pokemon/pokemon.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Box.name, schema: BoxSchema },
      { name: User.name, schema: UserSchema },
    ]),
    PokemonModule, // For PokemonService.findAll()
  ],
  controllers: [BoxesController],
  providers: [BoxesService],
  exports: [BoxesService, MongooseModule],
})
export class BoxesModule {}
