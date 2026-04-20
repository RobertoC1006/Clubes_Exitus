import { Module } from '@nestjs/common';
import { SesionesController } from './sesiones.controller';
import { SesionesService } from './sesiones.service';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, NotificacionesModule],
  controllers: [SesionesController],
  providers: [SesionesService]
})
export class SesionesModule {}
