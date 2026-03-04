import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request  from 'supertest';
import { AppModule } from '../../src/app.module';
import { Pool } from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

describe('User Integration - Create User', () => {
  let app: INestApplication;
  let pool: Pool;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule], // 👈 Full wiring but still integration scope
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
    await pool.query(`DELETE FROM "User"`); // Clean DB
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

    // Verify directly in DB
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

    await request(app.getHttpServer())
      .post('/users')
      .send(dto)
      .expect(201);

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
});