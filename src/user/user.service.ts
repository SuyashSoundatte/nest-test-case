import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly repo: UserRepository) {}

  async createUser(dto: CreateUserDto) {
    const userExists = await this.repo.findByNumber(dto.mobile);
    if(userExists) throw new BadRequestException("User already exists!");
    return this.repo.create(dto.mobile, dto.name);
  }

  async getAllUsers() {
    return this.repo.findAll();
  }

  async getUser(id: number) {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    await this.getUser(id);

    return this.repo.update(id, dto.mobile, dto.name);
  }

  async deleteUser(id: number) {
    await this.getUser(id);
    return this.repo.delete(id);
  }
}