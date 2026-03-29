import { PartialType } from '@nestjs/mapped-types';
import { CreateAdminAuthDto } from './create-admin-auth.dto';

export class UpdateAdminAuthDto extends PartialType(CreateAdminAuthDto) {}
