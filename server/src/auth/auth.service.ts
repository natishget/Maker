import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateUserDto, CreateAdminDto } from './dto/create-user.dto';
import { LoginAdminDto, LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private handlePrismaError(e: unknown) {
    if (e && typeof e === 'object' && 'code' in (e as any)) {
      const err = e as Prisma.PrismaClientKnownRequestError;
      if (err.code === 'P2002')
        throw new ConflictException('Email Can not be used');
      throw new BadRequestException(err.message);
    }
    throw e;
  }

  private sanitizeEmployee(user: {
    id: string;
    email: string;
    name: string | null;
  }) {
    return { id: user.id, email: user.email, name: user.name };
  }

  private sanitizeAdmin(admin: { id: string; username: string }) {
    return { id: admin.id, username: admin.username };
  }

  async registerCompany(dto: CreateCompanyDto) {
    try {
      const existingCompany = await this.prisma.company.findFirst({
        where: {
          OR: [{ name: dto.name }, { email: dto.email }],
        },
      });

      const existingEmployee = await this.prisma.employees.findUnique({
        where: { email: dto.email },
      });

      if (existingEmployee || existingCompany)
        throw new ConflictException('Email Can not be Used');

      const created = await this.prisma.company.create({
        data: {
          id: randomUUID(),
          name: dto.name,
          email: dto.email,
          tg_bot_token: dto.tg_bot_token,
          tg_chat_id: dto.tg_chat_id,
        },
      });

      return { id: created.id, name: created.name, email: created.email };
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  async registerUser(dto: CreateUserDto) {
    try {
      const existingEmployee = await this.prisma.employees.findUnique({
        where: { email: dto.email },
      });

      const existingCompany = await this.prisma.company.findUnique({
        where: { email: dto.email },
      });

      if (existingEmployee || existingCompany)
        throw new ConflictException('Email Can not be Used');

      const company = await this.prisma.company.findUnique({
        where: { id: dto.companyId },
      });
      if (!company) throw new NotFoundException('Company not found');

      const hash = await bcrypt.hash(dto.password, 10);
      const created = await this.prisma.employees.create({
        data: {
          id: randomUUID(),
          email: dto.email,
          name: dto.name,
          password: hash,
          Position: dto.position,
          companyId: dto.companyId,
        },
      });

      return this.sanitizeEmployee(created);
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  async registerAdmin(dto: CreateAdminDto) {
    try {
      const existingAdmin = await this.prisma.admins.findUnique({
        where: { username: dto.username },
      });

      if (existingAdmin)
        throw new ConflictException('Username Can not be Used');

      const hash = await bcrypt.hash(dto.password, 10);
      const created = await this.prisma.admins.create({
        data: {
          id: randomUUID(),
          username: dto.username,
          password: hash,
        },
      });

      return this.sanitizeAdmin(created);
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  async loginUser(dto: LoginUserDto) {
    try {
      const user = await this.prisma.employees.findUnique({
        where: { email: dto.email },
      });
      if (!user) throw new BadRequestException('Invalid credentials');

      const ok = await bcrypt.compare(dto.password, user.password);
      if (!ok) throw new BadRequestException('Invalid credentials');

      const access_token = this.jwtService.sign({
        userId: user.id,
        email: user.email,
        name: user.name,
        position: user.Position,
        companyId: user.companyId,
        role: 'employee',
      });

      return {
        access_token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          position: user.Position,
          companyId: user.companyId,
          role: 'employee',
        },
      };
    } catch (e) {
      this.handlePrismaError(e);
      throw e;
    }
  }

  async loginAdmin(dto: LoginAdminDto) {
    try {
      const user = await this.prisma.admins.findUnique({
        where: { username: dto.username },
      });
      if (!user) throw new BadRequestException('Invalid credentials');

      const ok = await bcrypt.compare(dto.password, user.password);
      if (!ok) throw new BadRequestException('Invalid credentials');

      const access_token = this.jwtService.sign({
        userId: user.id,
        username: user.username,
        role: 'admin',
      });

      return {
        access_token,
        user: {
          id: user.id,
          username: user.username,
          role: 'admin',
        },
      };
    } catch (e) {
      this.handlePrismaError(e);
      throw e;
    }
  }
}
