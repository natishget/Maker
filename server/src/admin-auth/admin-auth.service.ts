import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAdminAuthDto } from './dto/create-admin-auth.dto';
import { UpdateAdminAuthDto } from './dto/update-admin-auth.dto';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private handlePrismaError(error: unknown): never {
    if (error instanceof HttpException) {
      throw error;
    }

    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as Prisma.PrismaClientKnownRequestError;

      switch (prismaError.code) {
        case 'P2002': {
          const target = Array.isArray(prismaError.meta?.target)
            ? prismaError.meta?.target.join(', ')
            : String(prismaError.meta?.target ?? 'unique field');

          if (target.includes('username')) {
            throw new ConflictException('Admin username already exists');
          }

          if (target.includes('password')) {
            throw new ConflictException('Admin password already exists');
          }

          throw new ConflictException('Unique constraint violation');
        }

        case 'P2025':
          throw new NotFoundException('Admin not found');

        default:
          throw new BadRequestException(prismaError.message);
      }
    }

    if (error instanceof Error) {
      throw new InternalServerErrorException(error.message);
    }

    throw new InternalServerErrorException('Unexpected error');
  }

  async create(createAdminAuthDto: CreateAdminAuthDto) {
    try {
      const hashedPassword = await bcrypt.hash(createAdminAuthDto.password, 10);
      const created = await this.prisma.admins.create({
        data: {
          id: randomUUID(),
          username: createAdminAuthDto.username,
          password: hashedPassword,
        },
      });

      return {
        id: created.id,
        username: created.username,
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async login(createAdminAuthDto: CreateAdminAuthDto) {
    try {
      const admin = await this.prisma.admins.findUnique({
        where: { username: createAdminAuthDto.username },
      });

      if (
        !admin ||
        !(await bcrypt.compare(createAdminAuthDto.password, admin.password))
      ) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = { sub: admin.id, username: admin.username };
      return {
        access_token: this.jwtService.sign(payload),
        admin: {
          id: admin.id,
          username: admin.username,
        },
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll() {
    try {
      return this.prisma.admins.findMany({
        select: {
          id: true,
          username: true,
          createdAt: true,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findOne(id: string) {
    if (!id) {
      throw new BadRequestException('Admin id is required');
    }

    try {
      const admin = await this.prisma.admins.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          createdAt: true,
        },
      });

      if (!admin) {
        throw new NotFoundException('Admin not found');
      }

      return admin;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: string, updateAdminAuthDto: UpdateAdminAuthDto) {
    if (!id) {
      throw new BadRequestException('Admin id is required');
    }

    if (
      updateAdminAuthDto.username === undefined &&
      updateAdminAuthDto.password === undefined
    ) {
      throw new BadRequestException('No update data provided');
    }

    try {
      const updated = await this.prisma.admins.update({
        where: { id },
        data: {
          ...(updateAdminAuthDto.username !== undefined
            ? { username: updateAdminAuthDto.username }
            : {}),
          ...(updateAdminAuthDto.password !== undefined
            ? { password: await bcrypt.hash(updateAdminAuthDto.password, 10) }
            : {}),
        },
        select: {
          id: true,
          username: true,
          createdAt: true,
        },
      });

      return updated;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string) {
    if (!id) {
      throw new BadRequestException('Admin id is required');
    }

    try {
      await this.prisma.admins.delete({
        where: { id },
      });

      return {
        message: 'Admin deleted successfully',
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }
}
