import { Module } from '@nestjs/common';
import { PadreController } from './padre.controller';
import { PadreService } from './padre.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PadreController],
  providers: [PadreService],
})
export class PadreModule {}
