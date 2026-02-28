import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.service.createUser(dto);
  }

  @Get()
  findAll() {
    return this.service.getAllUsers();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.getUser(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.service.updateUser(Number(id), dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.service.deleteUser(Number(id));
  }
}