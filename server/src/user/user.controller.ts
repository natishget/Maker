import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from 'src/admin-auth/guards/jwt-auth.guard';
import { BadRequestException } from '@nestjs/common';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.userService.create(createUserDto);
  // }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: any) {
    if (!req?.user || req.user.role !== 'admin') {
      throw new BadRequestException('Access Denied');
    }
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('company')
  findAllCompany(@Req() req: any) {
    if (!req?.user || req.user.role !== 'admin') {
      throw new BadRequestException('Access Denied');
    }
    return this.userService.findAllCompany();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    if (!req?.user || req.user.role !== 'admin') {
      throw new BadRequestException('Access Denied');
    }
    return this.userService.findOne(id);
  }

  @Get('/company/:id')
  findOneCompany(@Param('id') id: string) {
    return this.userService.findOneCompany(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Patch('/company/:id')
  updateCompany(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return this.userService.updateCompany(id, updateCompanyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Delete('/company/:id')
  removeCompany(@Param('id') id: string) {
    return this.userService.removeCompany(id);
  }
}
