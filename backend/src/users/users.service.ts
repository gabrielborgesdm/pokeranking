import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { stripUndefined } from 'src/common/utils/transform.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  async comparePassword(
    candidatePassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  private async checkEmailUniqueness(
    email: string,
    excludeId?: string,
  ): Promise<void> {
    const query: { email: string; _id?: { $ne: string } } = { email };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await this.userModel.findOne(query).exec();
    if (existing) {
      throw new ConflictException(`User with email "${email}" already exists`);
    }
  }

  private async checkUsernameUniqueness(
    username: string,
    excludeId?: string,
  ): Promise<void> {
    const query: { username: string; _id?: { $ne: string } } = { username };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await this.userModel.findOne(query).exec();
    if (existing) {
      throw new ConflictException(
        `User with username "${username}" already exists`,
      );
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    await this.checkEmailUniqueness(createUserDto.email);
    await this.checkUsernameUniqueness(createUserDto.username);

    // Hash password before saving
    const hashedPassword = await this.hashPassword(createUserDto.password);

    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    return await user.save();
  }

  async findAll(): Promise<User[]> {
    return await this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .populate({
        path: 'rankings',
        populate: { path: 'pokemon' },
      })
      .exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email }).select('+password').exec();
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.userModel
      .findOne({ username })
      .select('+password')
      .exec();
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return await this.userModel
      .findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: new Date() },
      })
      .exec();
  }

  async findByEmailAndVerificationCode(
    email: string,
    code: string,
  ): Promise<User | null> {
    return await this.userModel
      .findOne({
        email: email.toLowerCase(),
        emailVerificationCode: code,
        emailVerificationExpires: { $gt: new Date() },
      })
      .exec();
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    return await this.userModel
      .findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() },
      })
      .exec();
  }

  async count(): Promise<number> {
    return await this.userModel.countDocuments().exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check for email uniqueness if email is being updated
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      await this.checkEmailUniqueness(updateUserDto.email, id);
    }

    // Check for username uniqueness if username is being updated
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      await this.checkUsernameUniqueness(updateUserDto.username, id);
    }

    // Hash password if it's being updated
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashPassword(updateUserDto.password);
    }
    // Apply updates, ignoring undefined fields
    Object.assign(user, stripUndefined(updateUserDto));
    return await user.save();
  }

  async remove(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await user.deleteOne();
    return user;
  }
}
