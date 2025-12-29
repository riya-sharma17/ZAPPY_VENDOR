import { Injectable } from '@nestjs/common';

@Injectable()
export class VendorsService {
  login(data: { name: string }) {
    return {
      vendorId: 'vendor_123',
      token: 'mock-jwt-token',
      name: data.name,
    };
  }
}
