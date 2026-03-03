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

  it('should throw if user already exists', async () => {
    vi.spyOn(repo, 'findByNumber').mockResolvedValue(true);

    await expect(service.createUser({ mobile: '9999999999' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should get all users', async () => {
    const mockUsers = [
      { id: 1, mobile: '9049052182', name: 'Suyash' },
      { id: 2, mobile: '9049052183', name: 'Parth' },
      { id: 3, mobile: '9049052184', name: 'Ritesh' },
    ];

    vi.spyOn(repo, 'findAll').mockResolvedValue(mockUsers);

    const result = await service.getAllUsers();

    expect(repo.findAll).toHaveBeenCalled();
    expect(result).toEqual(mockUsers);
  });

  it('should get user by id', async () => {
    const user = {
      id: 1,
      mobile: '9049052182',
      name: 'Suyash',
    };
    vi.spyOn(repo, 'findById').mockResolvedValue(user);

    const result = await service.getUser(1);

    expect(result).toEqual(user);
    expect(repo.findById).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException if user not found', async () => {
    vi.spyOn(repo, 'findById').mockResolvedValue(null);

    await expect(service.getUser(1)).rejects.toThrow('User not found');

    expect(repo.findById).toHaveBeenCalledWith(1);
  });

  it('should update user', async () => {
    const dto = { mobile: '9999999999', name: 'Updated Name' };

    vi.spyOn(service, 'getUser').mockResolvedValue({
      id: 1,
      mobile: '9049052182',
      name: 'Suyash',
    });

    vi.spyOn(repo, 'update').mockResolvedValue({
      id: 1,
      ...dto,
    });

    const result = await service.updateUser(1, dto);

    expect(service.getUser).toHaveBeenCalledWith(1);
    expect(repo.update).toHaveBeenCalledWith(1, dto.mobile, dto.name);
    expect(result).toEqual({ id: 1, ...dto });
  });

  it('should throw if user not found while updating', async () => {
    vi.spyOn(service, 'getUser').mockRejectedValue(
      new NotFoundException('User not found'),
    );

    await expect(
      service.updateUser(1, {
        mobile: '9999999999',
        name: 'Updated Name',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should delete user', async () => {
    vi.spyOn(service, 'getUser').mockResolvedValue({
      id: 1,
      mobile: '9049052182',
      name: 'Suyash',
    });

    vi.spyOn(repo, 'delete').mockResolvedValue(undefined);

    const result = await service.deleteUser(1);

    expect(service.getUser).toHaveBeenCalledWith(1);
    expect(repo.delete).toHaveBeenCalledWith(1);
    expect(result).toBe(undefined);
  });

  it('should throw if user not found while deleting', async () => {
    vi.spyOn(service, 'getUser').mockRejectedValue(
      new NotFoundException('User not found'),
    );

    await expect(service.deleteUser(1)).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(repo.delete).not.toHaveBeenCalled();
  });
});
