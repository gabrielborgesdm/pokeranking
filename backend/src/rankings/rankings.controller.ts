import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { RankingsService } from './rankings.service';
import { CreateRankingDto } from './dto/create-ranking.dto';
import { UpdateRankingDto } from './dto/update-ranking.dto';
import { RankingResponseDto } from './dto/ranking-response.dto';
import { toDto } from '../common/utils/transform.util';
import { Public } from '../common/decorators/public.decorator';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

@ApiTags('rankings')
@ApiBearerAuth('JWT-auth')
@Controller('rankings')
export class RankingsController {
  constructor(private readonly rankingsService: RankingsService) {}

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get ranking by ID' })
  @ApiParam({
    name: 'id',
    description: 'Ranking ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Ranking retrieved successfully',
    type: RankingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Ranking not found' })
  async findOne(@Param('id') id: string) {
    const ranking = await this.rankingsService.findOne(id);
    return toDto(RankingResponseDto, ranking);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new ranking' })
  @ApiBody({ type: CreateRankingDto })
  @ApiResponse({
    status: 201,
    description: 'Ranking created successfully',
    type: RankingResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid data or validation error' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Ranking with this title already exists for user',
  })
  async create(
    @Body() createRankingDto: CreateRankingDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const ranking = await this.rankingsService.create(
      req.user._id,
      createRankingDto,
    );
    return toDto(RankingResponseDto, ranking);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update ranking (owner only)' })
  @ApiParam({
    name: 'id',
    description: 'Ranking ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdateRankingDto })
  @ApiResponse({
    status: 200,
    description: 'Ranking updated successfully',
    type: RankingResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner only' })
  @ApiResponse({ status: 404, description: 'Ranking not found' })
  @ApiResponse({ status: 400, description: 'Invalid data or validation error' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Ranking with this title already exists for user',
  })
  async update(
    @Param('id') id: string,
    @Body() updateRankingDto: UpdateRankingDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const ranking = await this.rankingsService.update(
      id,
      req.user._id,
      updateRankingDto,
    );
    return toDto(RankingResponseDto, ranking);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete ranking (owner only)' })
  @ApiParam({
    name: 'id',
    description: 'Ranking ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({ status: 204, description: 'Ranking deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner only' })
  @ApiResponse({ status: 404, description: 'Ranking not found' })
  async remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    await this.rankingsService.remove(id, req.user._id);
  }
}
