import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ClubesModule } from './clubes/clubes.module';
import { SesionesModule } from './sesiones/sesiones.module';

@Module({
  imports: [PrismaModule, ClubesModule, SesionesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
