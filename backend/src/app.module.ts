import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ClubesModule } from './clubes/clubes.module';
import { SesionesModule } from './sesiones/sesiones.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { PagosModule } from './pagos/pagos.module';
import { PadreModule } from './padre/padre.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';

@Module({
  imports: [PrismaModule, ClubesModule, SesionesModule, AdminModule, AuthModule, PagosModule, PadreModule, NotificacionesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

