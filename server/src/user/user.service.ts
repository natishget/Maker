import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

import * as bcrypt from 'bcrypt';

import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  private handlePrismaError(e: unknown) {
    if (e && typeof e === 'object' && 'code' in (e as any)) {
      const err = e as Prisma.PrismaClientKnownRequestError;
      if (err.code === 'P2002') {
        throw new ConflictException('Email or username already registered');
      }
      throw new BadRequestException(err.message);
    }
    throw e;
  }

  async findAll() {
    try {
      return await this.prisma.employees.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          Position: true,
          createdAt: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  async findAllCompany() {
    try {
      return await this.prisma.company.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          tg_bot_token: true,
          tg_chat_id: true,
          createdAt: true,
        },
      });
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.prisma.employees.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          Position: true,
          createdAt: true,
        },
      });
      if (!user) {
        throw new NotFoundException(`User not found`);
      }
      return user;
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  async findOneCompany(id: string) {
    try {
      const user = await this.prisma.company.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          tg_bot_token: true,
          tg_chat_id: true,
          name: true,
          createdAt: true,
        },
      });
      if (!user) {
        throw new NotFoundException(`Company not found`);
      }
      return user;
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.prisma.employees.findUnique({
        where: { id },
      });
      if (!user) {
        throw new NotFoundException(`User not found`);
      }

      const {
        companyId,
        password: plainPassword,
        position,
        ...rest
      } = updateUserDto as UpdateUserDto & { position?: string };

      let password: string | undefined;
      if (plainPassword) {
        password = await bcrypt.hash(plainPassword, 10);
      }

      if (updateUserDto.email) {
        const conflictCompany = await this.prisma.company.findFirst({
          where: {
            id: { not: id },
            email: updateUserDto.email,
          },
        });

        const conflictEmployee = await this.prisma.employees.findFirst({
          where: {
            id: { not: id },
            email: updateUserDto.email,
          },
        });

        if (conflictCompany || conflictEmployee) {
          throw new ConflictException('Email Can not be Used');
        }
      }

      const data: Prisma.EmployeesUpdateInput = {
        ...rest,
        ...(position ? { Position: position } : {}),
        ...(password ? { password } : {}),
        ...(companyId ? { company: { connect: { id: companyId } } } : {}),
      };

      return await this.prisma.employees.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          Position: true,
          createdAt: true,
        },
      });
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  async updateCompany(id: string, updateCompanyDto: UpdateCompanyDto) {
    try {
      const user = await this.prisma.company.findUnique({
        where: { id },
      });
      if (!user) {
        throw new NotFoundException(`Company not found`);
      }

      if (updateCompanyDto.email) {
        const conflictCompany = await this.prisma.company.findFirst({
          where: {
            id: { not: id },
            email: updateCompanyDto.email,
          },
        });

        const conflictEmployee = await this.prisma.employees.findFirst({
          where: {
            id: { not: id },
            email: updateCompanyDto.email,
          },
        });

        if (conflictCompany || conflictEmployee) {
          throw new ConflictException('Email Can not be Used');
        }
      }

      return await this.prisma.company.update({
        where: { id },
        data: {
          ...updateCompanyDto,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  async remove(id: string) {
    try {
      const user = await this.prisma.employees.findUnique({
        where: { id },
      });
      if (!user) {
        throw new NotFoundException(`User not found`);
      }
      return await this.prisma.employees.delete({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  async removeCompany(id: string) {
    try {
      const user = await this.prisma.company.findUnique({
        where: { id },
      });
      if (!user) {
        throw new NotFoundException(`Company not found`);
      }
      return await this.prisma.company.delete({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });
    } catch (e) {
      this.handlePrismaError(e);
    }
  }
}
