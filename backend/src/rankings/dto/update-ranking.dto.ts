import { PartialType } from '@nestjs/swagger';
import { CreateRankingDto } from './create-ranking.dto';

export class UpdateRankingDto extends PartialType(CreateRankingDto) {}
