import { Body, Controller, Get, Post, UploadedFiles, UseInterceptors, HttpException, HttpStatus} from '@nestjs/common';
import { EventFormService } from './event.service';
import { CreateEventFormDto } from './create-event.dto';
import { FileFieldsInterceptor,AnyFilesInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

@Controller('event')
export class EventFormController {
  constructor(private readonly eventFormService: EventFormService) {}

  @Post()
  async submitForm(@Body() formDto: CreateEventFormDto) {
    try {
      return this.eventFormService.createOrUpdateEvent(formDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message || 'An error occurred while processing your request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async getAllForms() {
    return this.eventFormService.findAll();
  }

  // New endpoint to upload and update documents for the event
  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'idProof', maxCount: 1 },
      { name: 'orgRequestLetter', maxCount: 1 },
    ]),
  )
  async uploadDocuments(
    @UploadedFiles()
    files: {
      idProof?: Express.Multer.File[];
      orgRequestLetter?: Express.Multer.File[];
    },
    @Body()
    body: {
      userEmail: string;
      eventId: number;
      userType: string;
    },
  ) {
    return this.eventFormService.uploadDocuments(
      body.userEmail,
      body.eventId,
      body.userType,
      files.idProof?.[0]?.buffer || undefined,
      files.orgRequestLetter?.[0]?.buffer || undefined,
    );
    
  }
  //Final And Submit
  @Post('finalSubmit')
  @UseInterceptors(AnyFilesInterceptor()) // required to handle FormData
  async finalSubmit(@Body() body: { userEmail: string; eventId: string; qrCode: string, userType:string }) {
    const { userEmail, eventId, qrCode, userType } = body;
    return this.eventFormService.saveQrCodeData(userEmail, Number(eventId), qrCode, userType);
  }

  // Get Ticket
  @Post('getTicket')
  async getEventDataByEmail(@Body() body: { userEmail: string }) {
    const { userEmail } = body;
    if (!userEmail) {
      throw new Error("Email is required to fetch event data.");
    }
    
    // Call the service method to retrieve event data by email
    return this.eventFormService.findAllSubmittedOrApprovedEventsByEmail(userEmail);
  }

  
}
