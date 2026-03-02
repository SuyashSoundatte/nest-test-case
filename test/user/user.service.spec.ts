import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserService } from '../../src/user/user.service';
import { UserRepository } from '../../src/user/user.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';

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

  // -------------------------
  // createUser
  // -------------------------
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
    expect(repo.create).toHaveBeenCalledWith('9999999999', 'Suyash');
    expect(result.name).toBe('Suyash');
  });

  it('should throw if user already exists', async () => {
    vi.spyOn(repo, 'findByNumber').mockResolvedValue(true);

    await expect(
      service.createUser({ mobile: '9999999999', name: 'Suyash' }),
    ).rejects.toThrow(BadRequestException);
  });

  // -------------------------
  // getAllUsers
  // -------------------------
  it('should return all users', async () => {
    const mockUsers = [
      { id: 1, mobile: '123', name: 'A' },
      { id: 2, mobile: '456', name: 'B' },
    ];
    vi.spyOn(repo, 'findAll').mockResolvedValue(mockUsers);

    const result = await service.getAllUsers();

    expect(result).toEqual(mockUsers);
    expect(repo.findAll).toHaveBeenCalledTimes(1);
  });

  // -------------------------
  // getUser
  // -------------------------
  it('should return user by id', async () => {
    const mockUser = { id: 1, mobile: '123', name: 'A' };
    vi.spyOn(repo, 'findById').mockResolvedValue(mockUser);

    const result = await service.getUser(1);

    expect(result).toEqual(mockUser);
    expect(repo.findById).toHaveBeenCalledWith(1);
  });

  it('should throw if user not found', async () => {
    vi.spyOn(repo, 'findById').mockResolvedValue(null);

    await expect(service.getUser(99)).rejects.toThrow(NotFoundException);
  });

  // -------------------------
  // updateUser
  // -------------------------
  it('should update a user successfully', async () => {
    const mockUser = { id: 1, mobile: '123', name: 'A' };
    vi.spyOn(service, 'getUser').mockResolvedValue(mockUser);
    vi.spyOn(repo, 'update').mockResolvedValue({ ...mockUser, name: 'Updated' });

    const result = await service.updateUser(1, { mobile: '123', name: 'Updated' });

    expect(result).toEqual({ ...mockUser, name: 'Updated' });
    expect(repo.update).toHaveBeenCalledWith(1, '123', 'Updated');
  });

  it('should throw if updating non-existent user', async () => {
    vi.spyOn(service, 'getUser').mockRejectedValue(new NotFoundException());

    await expect(service.updateUser(99, { mobile: '123', name: 'X' }))
      .rejects.toThrow(NotFoundException);
  });

  // -------------------------
  // deleteUser
  // -------------------------
  it('should delete a user successfully', async () => {
    const mockUser = { id: 1, mobile: '123', name: 'A' };
    vi.spyOn(service, 'getUser').mockResolvedValue(mockUser);
    vi.spyOn(repo, 'delete').mockResolvedValue();

    const result = await service.deleteUser(1);

    expect(result).toBeUndefined();
    expect(repo.delete).toHaveBeenCalledWith(1);
  });

  it('should throw if deleting non-existent user', async () => {
    vi.spyOn(service, 'getUser').mockRejectedValue(new NotFoundException());

    await expect(service.deleteUser(99)).rejects.toThrow(NotFoundException);
  });
});