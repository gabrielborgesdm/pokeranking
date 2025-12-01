import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { BoxesService } from './boxes.service';
import { CreateBoxDto } from './dto/create-box.dto';
import { UpdateBoxDto } from './dto/update-box.dto';
import { BoxResponseDto } from './dto/box-response.dto';
import { CommunityBoxQueryDto } from './dto/community-box-query.dto';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { toDto } from '../common/utils/transform.util';

@ApiTags('boxes')
@ApiBearerAuth('JWT-auth')
@Controller('boxes')
export class BoxesController {
  constructor(private readonly boxesService: BoxesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new box' })
  @ApiBody({ type: CreateBoxDto })
  @ApiResponse({
    status: 201,
    description: 'Box created successfully',
    type: BoxResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Box name already exists' })
  async create(
    @Body() createBoxDto: CreateBoxDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const box = await this.boxesService.create(req.user._id, createBoxDto);
    return toDto(BoxResponseDto, box);
  }

  @Get()
  @ApiOperation({ summary: 'Get all boxes for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Boxes retrieved successfully (includes default box)',
    type: [BoxResponseDto],
  })
  async findAll(@Request() req: AuthenticatedRequest) {
    const boxes = await this.boxesService.findAllByUser(req.user._id);
    return toDto(BoxResponseDto, boxes);
  }

  @Get('community')
  @ApiOperation({ summary: 'Get all public boxes from the community' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'favoriteCount'],
  })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'ownerUsername', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Community boxes retrieved successfully',
  })
  async findCommunity(
    @Query() query: CommunityBoxQueryDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const { boxes, total } = await this.boxesService.findCommunityBoxes(
      req.user._id,
      query,
    );
    return {
      data: toDto(BoxResponseDto, boxes),
      total,
      page: query.page || 1,
      limit: query.limit || 20,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single box by ID' })
  @ApiParam({ name: 'id', description: 'Box ID or "default"' })
  @ApiResponse({
    status: 200,
    description: 'Box retrieved successfully',
    type: BoxResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Box not found' })
  async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const box = await this.boxesService.findOne(id, req.user._id);

    // Default box doesn't need transformation
    if ('isDefault' in box) {
      return box;
    }

    return toDto(BoxResponseDto, box);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update box (owner only)' })
  @ApiParam({ name: 'id', description: 'Box ID' })
  @ApiBody({ type: UpdateBoxDto })
  @ApiResponse({
    status: 200,
    description: 'Box updated successfully',
    type: BoxResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Box not found' })
  @ApiResponse({ status: 409, description: 'Box name already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateBoxDto: UpdateBoxDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const box = await this.boxesService.update(id, req.user._id, updateBoxDto);
    return toDto(BoxResponseDto, box);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete box (owner only)' })
  @ApiParam({ name: 'id', description: 'Box ID' })
  @ApiResponse({ status: 204, description: 'Box deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Box not found' })
  async remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    await this.boxesService.remove(id, req.user._id);
  }

  @Post(':id/favorite')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Favorite a public box (creates a copy)' })
  @ApiParam({ name: 'id', description: 'Box ID to favorite' })
  @ApiResponse({
    status: 200,
    description: 'Box favorited successfully',
    type: BoxResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Cannot favorite own box or private box',
  })
  @ApiResponse({ status: 404, description: 'Box not found' })
  async favoriteBox(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const box = await this.boxesService.favoriteBox(id, req.user._id);
    return toDto(BoxResponseDto, box);
  }
}
