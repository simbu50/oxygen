import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtUserGuard } from '../auth/guards/jwt-user.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { KycService } from './kyc.service';
import { SubmitAadhaarDto, SubmitPanDto } from './dto';

@Controller('kyc')
@UseGuards(JwtUserGuard)
export class KycController {
  constructor(private readonly kyc: KycService) {}

  @Post('pan')
  pan(@CurrentUser() u: { id: string }, @Body() dto: SubmitPanDto) {
    return this.kyc.submitPan(u.id, dto);
  }

  @Post('aadhaar')
  aadhaar(@CurrentUser() u: { id: string }, @Body() dto: SubmitAadhaarDto) {
    return this.kyc.submitAadhaar(u.id, dto);
  }

  @Post('selfie')
  @UseInterceptors(FileInterceptor('selfie', { limits: { fileSize: 2 * 1024 * 1024 } }))
  selfie(
    @CurrentUser() u: { id: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.kyc.submitSelfie(u.id, file);
  }

  @Get('status')
  status(@CurrentUser() u: { id: string }) {
    return this.kyc.getStatus(u.id);
  }
}
