import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { Anexo22Controller } from './anexo22.controller.js';
import { Anexo22Service } from './anexo22.service.js';
import { Anexo22Repository } from './anexo22.repository.js';

@Module({
  imports: [AuthModule],
  controllers: [Anexo22Controller],
  providers: [Anexo22Service, Anexo22Repository],
  exports: [Anexo22Service],
})
export class Anexo22Module {}
