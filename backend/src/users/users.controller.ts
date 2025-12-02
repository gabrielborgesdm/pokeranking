import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Request,
  ForbiddenException,
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
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto, USER_SORTABLE_FIELDS } from './dto/user-query.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { PublicUserResponseDto } from './dto/public-user-response.dto';
import { PaginatedUsersResponseDto } from './dto/paginated-users-response.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { toDto } from '../common/utils/transform.util';
import { TK } from '../i18n/constants/translation-keys';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active users with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, enum: USER_SORTABLE_FIELDS })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'username', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: PaginatedUsersResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() query: UserQueryDto,
  ): Promise<PaginatedUsersResponseDto> {
    const { users, total } = await this.usersService.findAll(query);
    return {
      data: toDto(PublicUserResponseDto, users),
      total,
      page: query.page || 1,
      limit: query.limit || 20,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const user = await this.usersService.findOne(id);

    // Admin or viewing self - return full UserResponseDto with email
    const isAdmin = req.user.role === UserRole.Admin;
    const isSelf = req.user._id === id;

    if (isAdmin || isSelf) {
      return toDto(UserResponseDto, user);
    }

    // Viewing someone else - return PublicUserResponseDto without email
    return toDto(PublicUserResponseDto, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user (Admin or self only)' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only update own profile',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: AuthenticatedRequest,
  ) {
    // Only allow admins or the user themselves to update
    if (req.user.role !== UserRole.Admin && req.user._id !== id) {
      throw new ForbiddenException({ key: TK.USERS.CANNOT_UPDATE_OTHERS });
    }

    const user = await this.usersService.update(id, updateUserDto);
    return toDto(UserResponseDto, user);
  }

  @Delete(':id')
  @Roles(UserRole.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
