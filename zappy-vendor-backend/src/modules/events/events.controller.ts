import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    Param,
    Body,
    Headers,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
    constructor(private readonly service: EventsService) { }

    @Post('check-in')
    @UseInterceptors(FileInterceptor('photo'))
    checkIn(@UploadedFile() file, @Body() body) {
        return this.service.checkIn(body, file);
    }

    @Post(':eventId/send-otp')
    sendOtp(@Param('eventId') eventId: string) {
        return this.service.sendOtp(eventId);
    }

    @Post(':eventId/verify-otp')
    verifyOtp(@Param('eventId') eventId: string, @Body('otp') otp: string) {
        return this.service.verifyOtp(eventId, otp);
    }

    @Post(':eventId/pre-setup')
    @UseInterceptors(FileInterceptor('photo', { limits: { fileSize: 5 * 1024 * 1024 } }))
    preSetup(
        @Param('eventId') id: string,
        @UploadedFile() file,
        @Body('notes') notes,
        @Headers('x-vendor-id') vendorId: string,
    ) {
        return this.service.preSetup(id, file, notes, vendorId);
    }

    @Post(':eventId/post-setup')
    @UseInterceptors(FileInterceptor('photo', { limits: { fileSize: 5 * 1024 * 1024 } }))
    postSetup(
        @Param('eventId') id: string,
        @UploadedFile() file,
        @Body('notes') notes,
        @Headers('x-vendor-id') vendorId: string,
    ) {
        return this.service.postSetup(id, file, notes, vendorId);
    }
}
