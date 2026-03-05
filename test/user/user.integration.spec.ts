import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { Pool } from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

describe('User Integration', () => {
  let app: INestApplication;
  let pool: Pool;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();

    pool = moduleRef.get<Pool>('PG_POOL');
  });

  beforeEach(async () => {
    await pool.query(`DELETE FROM "User"`);
  });

  afterAll(async () => {
    await pool.query(`DELETE FROM "User"`);
    await pool.end();
    await app.close();
  });

  it('should create a user successfully', async () => {
    const dto = {
      mobile: '9876543210',
      name: 'Suyash',
    };

    const response = await request(app.getHttpServer())
      .post('/users')
      .send(dto)
      .expect(201);

    expect(response.body).toMatchObject({
      mobile: dto.mobile,
      name: dto.name,
    });

    const result = await pool.query(
      `SELECT * FROM "User" WHERE mobile = $1`,
      [dto.mobile],
    );

    expect(result.rows.length).toBe(1);
    expect(result.rows[0].name).toBe(dto.name);
  });

  it('should fail if mobile already exists', async () => {
    const dto = {
      mobile: '9999999999',
      name: 'First User',
    };

    await request(app.getHttpServer()).post('/users').send(dto).expect(201);

    const duplicateResponse = await request(app.getHttpServer())
      .post('/users')
      .send(dto)
      .expect(400);

    expect(duplicateResponse.body.message).toBe('User already exists!');
  });

  it('should fail validation if mobile is not number string', async () => {
    const dto = {
      mobile: 'abc123',
      name: 'Invalid User',
    };

    await request(app.getHttpServer())
      .post('/users')
      .send(dto)
      .expect(400);
  });

  it('should return all users', async () => {
    await pool.query(
      `INSERT INTO "User"(mobile, name) VALUES ('1111111111', 'User1'), ('2222222222', 'User2')`,
    );

    const response = await request(app.getHttpServer())
      .get('/users')
      .expect(200);

    expect(response.body.length).toBe(2);
    expect(response.body[0]).toHaveProperty('mobile');
  });

  it('should return a user by id', async () => {
    const result = await pool.query(
      `INSERT INTO "User"(mobile, name) VALUES ('3333333333', 'FindMe') RETURNING *`,
    );

    const userId = result.rows[0].id;

    const response = await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .expect(200);

    expect(response.body.id).toBe(userId);
    expect(response.body.name).toBe('FindMe');
  });

  it('should return 404 if user not found', async () => {
    await request(app.getHttpServer())
      .get('/users/9999')
      .expect(404);
  });

  it('should update user successfully', async () => {
    const result = await pool.query(
      `INSERT INTO "User"(mobile, name) VALUES ('4444444444', 'OldName') RETURNING *`,
    );

    const userId = result.rows[0].id;

    const response = await request(app.getHttpServer())
      .patch(`/users/${userId}`)
      .send({
        name: 'NewName',
      })
      .expect(200);

    expect(response.body.name).toBe('NewName');

    const dbCheck = await pool.query(
      `SELECT * FROM "User" WHERE id = $1`,
      [userId],
    );

    expect(dbCheck.rows[0].name).toBe('NewName');
  });

  it('should return 404 when updating non-existing user', async () => {
    await request(app.getHttpServer())
      .patch('/users/9999')
      .send({
        name: 'DoesNotExist',
      })
      .expect(404);
  });

  it('should delete user successfully', async () => {
    const result = await pool.query(
      `INSERT INTO "User"(mobile, name) VALUES ('5555555555', 'DeleteMe') RETURNING *`,
    );

    const userId = result.rows[0].id;

    await request(app.getHttpServer())
      .delete(`/users/${userId}`)
      .expect(204);

    const dbCheck = await pool.query(
      `SELECT * FROM "User" WHERE id = $1`,
      [userId],
    );

    expect(dbCheck.rows.length).toBe(0);
  });

  it('should return 404 when deleting non-existing user', async () => {
    await request(app.getHttpServer())
      .delete('/users/9999')
      .expect(404);
  });
});