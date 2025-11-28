import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { PokemonService } from './pokemon.service';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PokemonResponseDto } from './dto/pokemon-response.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { toDto } from '../common/utils/transform.util';

@ApiTags('pokemon')
@ApiBearerAuth('JWT-auth')
@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) { }

  @Post()
  @Roles(UserRole.Admin)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new pokemon (Admin only)' })
  @ApiBody({ type: CreatePokemonDto })
  @ApiResponse({
    status: 201,
    description: 'Pokemon created successfully',
    type: PokemonResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 409, description: 'Pokemon already exists' })
  async create(@Body() createPokemonDto: CreatePokemonDto) {
    const pokemon = await this.pokemonService.create(createPokemonDto);
    return toDto(PokemonResponseDto, pokemon);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pokemon' })
  @ApiResponse({
    status: 200,
    description: 'Pokemon retrieved successfully',
    type: [PokemonResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll() {
    const pokemon = await this.pokemonService.findAll();
    return toDto(PokemonResponseDto, pokemon);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pokemon by ID' })
  @ApiParam({
    name: 'id',
    description: 'Pokemon ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Pokemon retrieved successfully',
    type: PokemonResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Pokemon not found' })
  async findOne(@Param('id') id: string) {
    const pokemon = await this.pokemonService.findOne(id);
    return toDto(PokemonResponseDto, pokemon);
  }

  @Patch(':id')
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Update pokemon (Admin only)' })
  @ApiParam({
    name: 'id',
    description: 'Pokemon ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdatePokemonDto })
  @ApiResponse({
    status: 200,
    description: 'Pokemon updated successfully',
    type: PokemonResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Pokemon not found' })
  async update(
    @Param('id') id: string,
    @Body() updatePokemonDto: UpdatePokemonDto,
  ) {
    Logger.log('Controller - Updating pokemon:', updatePokemonDto);
    const pokemon = await this.pokemonService.update(id, updatePokemonDto);
    return toDto(PokemonResponseDto, pokemon);
  }

  @Delete(':id')
  @Roles(UserRole.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete pokemon (Admin only)' })
  @ApiParam({
    name: 'id',
    description: 'Pokemon ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({ status: 204, description: 'Pokemon deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Pokemon not found' })
  remove(@Param('id') id: string) {
    return this.pokemonService.remove(id);
  }
}
