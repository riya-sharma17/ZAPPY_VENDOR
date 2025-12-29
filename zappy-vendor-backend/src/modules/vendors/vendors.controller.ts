import { Controller, Post, Body } from '@nestjs/common';
import { VendorsService } from './vendors.service';

@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post('login')
  login(@Body() body: { name: string }) {
    return this.vendorsService.login(body);
  }
}
