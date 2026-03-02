import { describe, it, expect, beforeAll, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  INestApplication,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import request from 'supertest';
import { UserController } from '../../src/user/user.controller';
import { UserService } from '../../src/user/user.service';

describe('UserController', () => {
  let app: INestApplication;
  const mockService = {
    createUser: vi.fn(),
    findByNumber: vi.fn(),
    getAllUsers: vi.fn(),
    getUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn()
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockService,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  it('POST /users should create user', async () => {
    mockService.createUser.mockResolvedValue({
      id: 1,
      mobile: '9999999999',
      name: 'Suyash',
    });

    const res = await request(app.getHttpServer())
      .post('/users')
      .send({
        mobile: '9999999999',
        name: 'Suyash',
      })
      .expect(201);

    expect(res.body.name).toBe('Suyash');
    expect(mockService.createUser).toHaveBeenCalled();
  });

  it('should user fail validation if mobile invalid', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({ mobile: 'abc' })
      .expect(400);
  });

  it('user should not created if mobile number already exists', async () => {
    mockService.createUser.mockRejectedValue(
      new BadRequestException('User already exists!'),
    );

    await request(app.getHttpServer())
      .post('/users')
      .send({ mobile: '9049052182', name: 'suyash' })
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toBe('User already exists!');
      });
  });

  it('get all users', async () => {
    const mockUsers = [
      { id: 1, name: 'suyash', mobile: '9049052182' },
      { id: 2, name: 'parth', mobile: '9049052183' },
    ];

    mockService.getAllUsers.mockResolvedValue(mockUsers);

    const res = await request(app.getHttpServer()).get('/users');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockUsers);
    expect(mockService.getAllUsers).toHaveBeenCalledTimes(1);
  });

  it('get all users if no users exists', async () => {
    mockService.getAllUsers.mockResolvedValue([]);

    const res = await request(app.getHttpServer()).get('/users');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('should return user by id', async () => {
    const mockUser = {
      id: 1,
      name: 'suyash',
      mobile: '9049052182',
    };

    mockService.getUser.mockResolvedValue(mockUser);

    const res = await request(app.getHttpServer()).get('/users/1');

    expect(res.body).toEqual(mockUser);
    expect(mockService.getUser).toHaveBeenCalledWith(1);
    expect(mockService.getUser).toHaveBeenCalledTimes(1);
  });

  it('should return user not found when id is wrong', async () => {
    mockService.getUser.mockRejectedValue(
      new NotFoundException('User not found'),
    );

    const res = await request(app.getHttpServer()).get('/users/9999');

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('User not found');
  });

  it('should update the user', async () =>{
    const dto = {
      mobile: '9049052813',
      name: 'Suyash'
    }

    const updatedUser = {
      id: 1,
      mobile: '9049052812',
      name: 'Suyash',
    };

    mockService.updateUser.mockResolvedValue(updatedUser);

    const res = await request(app.getHttpServer())
      .patch('/users/1')
      .send(dto);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(updatedUser); 
    expect(mockService.updateUser).toHaveBeenCalledWith(1, dto);
    expect(mockService.updateUser).toHaveBeenCalledTimes(1); 
  });

  it('should return user not found when id is wrong while updating user', async () => {
    const dto = {
      mobile: '9049052813',
      name: 'Suyash'
    }
    
    mockService.updateUser.mockRejectedValue(
      new NotFoundException('User not found'),
    );

    const res = await request(app.getHttpServer())
    .patch('/users/9999')
    .send(dto);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('User not found');
    expect(mockService.updateUser).toHaveBeenCalledWith(9999, dto);
  });

  it('should delete the user', async () => {
    mockService.deleteUser.mockResolvedValue({
      affected: 1,
    });

    const res = await request(app.getHttpServer())
      .delete('/users/1');

    expect(res.statusCode).toBe(204);
    expect(res.body).toEqual({});

    expect(mockService.deleteUser).toHaveBeenCalledWith(1);
    expect(mockService.deleteUser).toHaveBeenCalledTimes(1);
  });

  it('should throw if user not found', async () => {
    mockService.deleteUser.mockRejectedValue(
      new NotFoundException('User not found'),
    );

    const res = await request(app.getHttpServer())
      .delete('/users/99');

    expect(res.statusCode).toBe(404);

    expect(mockService.deleteUser).toHaveBeenCalledWith(99);
  });
});
