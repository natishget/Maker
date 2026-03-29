import { Injectable } from '@nestjs/common';
import { CreateAdminAuthDto } from './dto/create-admin-auth.dto';
import { UpdateAdminAuthDto } from './dto/update-admin-auth.dto';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  async create(createAdminAuthDto: CreateAdminAuthDto) {
    try {
      const created = this.prisma.admins.create({
        data: {
          id: randomUUID(),
          username: createAdminAuthDto.username,
          password: createAdminAuthDto.password,
        },
      });

      return created;
    } catch (error) {
      throw error;
    }
  }

  async login(createAdminAuthDto: CreateAdminAuthDto) {
    try {
      const admin = await this.prisma.admins.findUnique({
        where: { username: createAdminAuthDto.username },
      });

      if (!admin || admin.password !== createAdminAuthDto.password) {
        throw new Error('Invalid credentials');
      }

      const payload = { sub: admin.id, username: admin.username };
      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      throw error;
    }
  }

  findAll() {
    return `This action returns all adminAuth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} adminAuth`;
  }

  update(id: number, updateAdminAuthDto: UpdateAdminAuthDto) {
    return `This action updates a #${id} adminAuth`;
  }

  remove(id: number) {
    return `This action removes a #${id} adminAuth`;
  }
}
