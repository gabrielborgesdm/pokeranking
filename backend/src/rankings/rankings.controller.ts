import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
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
  ApiQuery,
} from '@nestjs/swagger';
import { RankingsService } from './rankings.service';
import { CreateRankingDto } from './dto/create-ranking.dto';
import { UpdateRankingDto } from './dto/update-ranking.dto';
import {
  RankingQueryDto,
  RANKING_SORTABLE_FIELDS,
} from './dto/ranking-query.dto';
import {
  RankingResponseDto,
  RankingListResponseDto,
} from './dto/ranking-response.dto';
import { PaginatedRankingsResponseDto } from './dto/paginated-rankings-response.dto';
import { LikeResponseDto } from './dto/like-response.dto';
import { toDto } from '../common/utils/transform.util';
import { Public } from '../common/decorators/public.decorator';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

@ApiTags('rankings')
@ApiBearerAuth('JWT-auth')
@Controller('rankings')
export class RankingsController {
  constructor(private readonly rankingsService: RankingsService) { }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Browse all rankings with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, enum: RANKING_SORTABLE_FIELDS })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Rankings retrieved successfully',
    type: PaginatedRankingsResponseDto,
  })
  async findAll(
    @Query() query: RankingQueryDto,
  ): Promise<PaginatedRankingsResponseDto> {
    const { rankings, total } = await this.rankingsService.findPaginated(query);
    return {
      data: toDto(RankingListResponseDto, rankings),
      total,
      page: query.page || 1,
      limit: query.limit || 20,
    };
  }

  @Get('user/:username')
  @Public()
  @ApiOperation({ summary: 'Get rankings by username' })
  @ApiParam({
    name: 'username',
    description: 'Username to fetch rankings for',
    example: 'john_doe',
  })
  @ApiResponse({
    status: 200,
    description: 'User rankings retrieved successfully',
    type: [RankingListResponseDto],
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findByUsername(@Param('username') username: string) {
    const rankings = await this.rankingsService.findByUsername(username);
    return toDto(RankingListResponseDto, rankings);
  }

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
  async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const ranking = await this.rankingsService.findOne(id);
    return toDto(RankingResponseDto, ranking, {
      userId: req.user?._id?.toString(),
    });
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle like on a ranking' })
  @ApiParam({
    name: 'id',
    description: 'Ranking ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Like toggled successfully',
    type: LikeResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Ranking not found' })
  async toggleLike(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<LikeResponseDto> {
    return this.rankingsService.toggleLike(id, req.user._id);
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
