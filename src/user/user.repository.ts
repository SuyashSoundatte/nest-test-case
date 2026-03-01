import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';

export interface User {
  id: number;
  mobile: string;
  name?: string;
}

@Injectable()
export class UserRepository {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  async create(mobile: string, name?: string): Promise<User> {
    const result = await this.pool.query(
      `INSERT INTO "User" (mobile, name)
       VALUES ($1, $2)
       RETURNING *`,
      [mobile.toString(), name],
    );

    return result.rows[0];
  }

  async findAll(): Promise<User[]> {
    const result = await this.pool.query(`SELECT * FROM "User" ORDER BY id`);
    return result.rows;
  }

  async findById(id: number): Promise<User | null> {
    const result = await this.pool.query(
      `SELECT * FROM "User" WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async update(
    id: number,
    mobile?: string,
    name?: string,
  ): Promise<User> {
    const result = await this.pool.query(
      `UPDATE "User"
       SET mobile = COALESCE($1, mobile),
           name   = COALESCE($2, name)
       WHERE id = $3
       RETURNING *`,
      [mobile ? mobile.toString() : null, name ?? null, id],
    );

    return result.rows[0] ?? null;
  }

  async delete(id: number): Promise<void> {
    await this.pool.query(`DELETE FROM "User" WHERE id = $1`, [id]);
  }

  async findByNumber(mobile: string): Promise<boolean>{
    const result = await this.pool.query('SELECT id FROM "User" WHERE mobile = $1', [mobile]);

    if(result.rows.length === 0){
      return false;
    }
    return true;
  }
}