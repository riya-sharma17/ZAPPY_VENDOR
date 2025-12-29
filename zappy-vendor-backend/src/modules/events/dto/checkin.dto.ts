import { IsNumber, IsString } from 'class-validator';

export class CheckInDto {
  @IsString()
  vendorId: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}
