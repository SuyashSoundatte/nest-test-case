import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async createUser(dto: CreateUserDto) {
    const userExists = await this.userRepository.findByNumber(dto.mobile);
    if(userExists) throw new BadRequestException("User already exists!");
    return this.userRepository.create(dto.mobile, dto.name);
  }

  async getAllUsers() {
    return this.userRepository.findAll();
  }

  async getUser(id: number) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    await this.getUser(id);

    return this.userRepository.update(id, dto.mobile, dto.name);
  }

  async deleteUser(id: number) {
    await this.getUser(id);
    return this.userRepository.delete(id);
  }
}