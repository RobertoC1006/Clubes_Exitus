import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'una_clave_secreta_muy_larga_y_segura_123!',
    });
  }

  async validate(payload: any) {
    // Lo que retornemos aquí se inyectará en request.user
    return { 
      userId: payload.sub, 
      dni: payload.dni, 
      rol: payload.rol,
      nombre: payload.nombre,
      apellido: payload.apellido
    };
  }
}
