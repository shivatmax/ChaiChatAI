import prisma from '../lib/prisma';
import { User } from '@prisma/client';

export const createUser = async (
  user: Omit<User, 'id' | 'created_at' | 'updated_at'>
): Promise<User> => {
  return prisma.user.create({
    data: user,
  });
};

export const getUser = async (id: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { id },
  });
};

export const updateUser = async (
  id: string,
  updates: Partial<User>
): Promise<User> => {
  return prisma.user.update({
    where: { id },
    data: updates,
  });
};

export const deleteUser = async (id: string): Promise<void> => {
  await prisma.user.delete({
    where: { id },
  });
};
