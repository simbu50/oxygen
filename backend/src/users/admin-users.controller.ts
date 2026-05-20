import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { JwtAdminGuard } from '../auth/guards/jwt-admin.guard';
import { UsersService } from './users.service';

@Controller('admin/users')
@UseGuards(JwtAdminGuard)
export class AdminUsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list(
    @Query('status') status?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize = 20,
  ) {
    return this.users.listForAdmin({ status, page, pageSize });
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.users.getForAdmin(id);
  }
}
