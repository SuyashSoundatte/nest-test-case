import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserService } from '../../src/user/user.service';
import { UserRepository } from '../../src/user/user.repository';
import { BadRequestException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let repo: UserRepository;

  beforeEach(() => {
    repo = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByNumber: vi.fn(),
    } as unknown as UserRepository;

    service = new UserService(repo);
  });

  it('should create a user successfully', async () => {
    vi.spyOn(repo, 'findByNumber').mockResolvedValue(false);
    vi.spyOn(repo, 'create').mockResolvedValue({
      id: 1,
      mobile: '9999999999',
      name: 'Suyash',
    });

    const result = await service.createUser({
      mobile: '9999999999',
      name: 'Suyash',
    });

    expect(repo.findByNumber).toHaveBeenCalledWith('9999999999');
    expect(repo.create).toHaveBeenCalled();
    expect(result.name).toBe('Suyash');
  });

  // it('should throw if user already exists', async () => {
  //   vi.spyOn(repo, 'findByNumber').mockResolvedValue(true);

  //   await expect(
  //     service.createUser({ mobile: '9999999999' }),
  //   ).rejects.toThrow(BadRequestException);
  // });
});