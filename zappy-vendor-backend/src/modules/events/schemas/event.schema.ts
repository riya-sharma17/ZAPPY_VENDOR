import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EventStatus } from '../enums/event-status.enum';

export type EventDocument = Event & Document;

@Schema({ timestamps: true, versionKey: false })
export class Event {
    @Prop({ required: true })
    vendorId: string;

    @Prop({ enum: EventStatus, default: EventStatus.CHECKED_IN })
    status: EventStatus;

    @Prop()
    startedAt: Date;

    @Prop()
    completedAt: Date;

    @Prop({
        type: { lat: Number, lng: Number },
        required: true,
    })
    location: {
        lat: number;
        lng: number;
    };

    @Prop()
    checkInPhoto: string;

    @Prop()
    checkedInAt: Date;

    @Prop()
    preSetupPhoto: string;

    @Prop()
    preSetupNotes: string;

    @Prop()
    postSetupPhoto: string;

    @Prop()
    postSetupNotes: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);
