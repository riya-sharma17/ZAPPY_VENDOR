import {
    Injectable,
    BadRequestException,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schema';
import { Otp, OtpDocument } from './schemas/otp.schema';
import { EventStatus } from './enums/event-status.enum';
import { OTP_EXPIRY_MINUTES } from './constants/otp.constants';

@Injectable()
export class EventsService {
    constructor(
        @InjectModel(Event.name) private eventModel: Model<EventDocument>,
        @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    ) { }

    private verifyVendor(event: EventDocument, vendorId: string) {
        if (event.vendorId.toString() !== vendorId) {
            throw new ForbiddenException('Unauthorized vendor');
        }
    }

    async checkIn(data: any, file: Express.Multer.File) {
        return this.eventModel.create({
            vendorId: data.vendorId,
            location: { lat: data.latitude, lng: data.longitude },
            checkInPhoto: file?.originalname,
            checkedInAt: new Date(),
            status: EventStatus.CHECKED_IN,
        });
    }

    async sendOtp(eventId: string) {
        if (!Types.ObjectId.isValid(eventId)) {
            throw new BadRequestException('Invalid eventId');
        }

        await this.otpModel.deleteMany({ eventId });

        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        await this.otpModel.create({
            eventId,
            code: otp,
            expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000),
        });

        return { message: 'OTP sent (mock)', otp };
    }

    async verifyOtp(eventId: string, otp: string) {
        const record = await this.otpModel.findOne({
            eventId,
            code: otp,
            isVerified: false,
            expiresAt: { $gt: new Date() },
        });

        if (!record) {
            throw new BadRequestException('Invalid or expired OTP');
        }

        record.isVerified = true;
        await record.save();
        await this.otpModel.deleteMany({ eventId });

        await this.eventModel.findByIdAndUpdate(eventId, {
            status: EventStatus.STARTED,
            startedAt: new Date(),
        });

        return { message: 'Event started' };
    }

    async preSetup(
        eventId: string,
        file: Express.Multer.File,
        notes: string,
        vendorId: string,
    ) {
        const event = await this.eventModel.findById(eventId);
        if (!event) throw new NotFoundException();

        this.verifyVendor(event, vendorId);

        if (event.status !== EventStatus.STARTED) {
            throw new BadRequestException('OTP not verified');
        }

        event.preSetupPhoto = file?.originalname;
        event.preSetupNotes = notes;
        await event.save();

        return { message: 'Pre-setup saved' };
    }

    async postSetup(
        eventId: string,
        file: Express.Multer.File,
        notes: string,
        vendorId: string,
    ) {
        const event = await this.eventModel.findById(eventId);
        if (!event) throw new NotFoundException();

        this.verifyVendor(event, vendorId);

        if (event.status !== EventStatus.STARTED) {
            throw new BadRequestException('Invalid event state');
        }

        event.postSetupPhoto = file?.originalname;
        event.postSetupNotes = notes;
        event.status = EventStatus.COMPLETED;
        event.completedAt = new Date();

        await event.save();

        return { message: 'Event completed successfully' };
    }
}
