import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  Res,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAdminDto, CreateUserDto } from './dto/create-user.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { LoginAdminDto, LoginUserDto } from './dto/login-user.dto';
import { Response, Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: any;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Post('register-company')
  async registerCompany(
    @Body() dto: CreateCompanyDto,
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user?.role !== 'admin') {
      throw new BadRequestException('Access Denied');
    }
    return this.authService.registerCompany(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('register')
  async register(@Body() dto: CreateUserDto, @Req() req: AuthenticatedRequest) {
    if (!req?.user || req.user.role !== 'admin') {
      throw new BadRequestException('Access Denied');
    }
    return this.authService.registerUser(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/register')
  async registerAdmin(
    @Body() dto: CreateAdminDto,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!req?.user || req.user.role !== 'admin') {
      throw new BadRequestException('Access Denied');
    }
    return this.authService.registerAdmin(dto);
  }

  @Post('login')
  async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, user } = await this.authService.loginUser(dto);

    if (!access_token) {
      throw new BadRequestException('Failed to issue token');
    }

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.IS_PRODUCTION === 'true',
      sameSite: process.env.IS_PRODUCTION === 'true' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return { user };
  }

  @Post('admin/login')
  async adminLogin(
    @Body() dto: LoginAdminDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, user } = await this.authService.loginAdmin(dto);

    if (!access_token) {
      throw new BadRequestException('Failed to issue token');
    }

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.IS_PRODUCTION === 'true',
      sameSite: process.env.IS_PRODUCTION === 'true' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return { user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getMe(@Req() req: AuthenticatedRequest) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { message: 'Logged out successfully' };
  }
}
