import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { CreateAdminAuthDto } from './dto/create-admin-auth.dto';
import { UpdateAdminAuthDto } from './dto/update-admin-auth.dto';

@Controller('admin-auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('/register')
  create(@Body() createAdminAuthDto: CreateAdminAuthDto) {
    return this.adminAuthService.create(createAdminAuthDto);
  }

  @Post('/login')
  login(@Body() createAdminAuthDto: CreateAdminAuthDto) {
    return this.adminAuthService.login(createAdminAuthDto);
  }

  @Get()
  findAll() {
    return this.adminAuthService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminAuthService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAdminAuthDto: UpdateAdminAuthDto,
  ) {
    return this.adminAuthService.update(id, updateAdminAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminAuthService.remove(id);
  }
}
