import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtUserGuard } from '../auth/guards/jwt-user.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto';

@Controller('users')
@UseGuards(JwtUserGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  me(@CurrentUser() u: { id: string }) {
    return this.users.getMe(u.id);
  }

  @Patch('me')
  updateMe(@CurrentUser() u: { id: string }, @Body() dto: UpdateProfileDto) {
    return this.users.updateMe(u.id, dto);
  }
}
