import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OtpDocument = Otp & Document;

@Schema({ timestamps: true, versionKey: false })
export class Otp {
    @Prop({ required: true })
    eventId: string;

    @Prop({ required: true })
    code: string;

    @Prop({ default: false })
    isVerified: boolean;

    @Prop({ required: true })
    expiresAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

OtpSchema.index({ eventId: 1 });
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
