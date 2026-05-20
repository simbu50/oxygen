import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAdminGuard, AdminRoles, AdminRolesGuard } from '../auth/guards/jwt-admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { KycService } from './kyc.service';
import { ApproveKycDto, RejectKycDto } from './dto';

@Controller('admin/kyc')
@UseGuards(JwtAdminGuard, AdminRolesGuard)
@AdminRoles('SUPER_ADMIN', 'KYC_OFFICER')
export class AdminKycController {
  constructor(private readonly kyc: KycService) {}

  @Post(':userId/approve')
  approve(
    @CurrentUser() admin: { id: string },
    @Param('userId') userId: string,
    @Body() dto: ApproveKycDto,
  ) {
    return this.kyc.approve(admin.id, userId, dto.remarks);
  }

  @Post(':userId/reject')
  reject(
    @CurrentUser() admin: { id: string },
    @Param('userId') userId: string,
    @Body() dto: RejectKycDto,
  ) {
    return this.kyc.reject(admin.id, userId, dto.reason, dto.remarks);
  }
}
