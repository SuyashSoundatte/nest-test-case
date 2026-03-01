import { describe, it, expect, beforeAll, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { UserController } from '../../src/user/user.controller';
import { UserService } from '../../src/user/user.service';

describe('UserController', () => {
  let app: INestApplication;
  const mockService = {
    createUser: vi.fn(),
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

      console.log(res);

    expect(res.body.name).toBe('Suyash');
    expect(mockService.createUser).toHaveBeenCalled();
  });

  // it('should fail validation if mobile invalid', async () => {
  //   await request(app.getHttpServer())
  //     .post('/users')
  //     .send({ mobile: 'abc' })
  //     .expect(400);
  // });
});