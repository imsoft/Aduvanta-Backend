import { Injectable, NotFoundException } from '@nestjs/common';
import { SaaiErrorsRepository } from './saai-errors.repository.js';

@Injectable()
export class SaaiErrorsService {
  constructor(private readonly repository: SaaiErrorsRepository) {}

  async findAll() {
    return this.repository.findAll();
  }

  async findByRegistro(registro: number) {
    return this.repository.findByRegistro(registro);
  }

  async findByKey(
    registro: number,
    campo: number,
    tipo: number,
    numero: number,
  ) {
    const record = await this.repository.findByKey(
      registro,
      campo,
      tipo,
      numero,
    );
    if (!record) {
      throw new NotFoundException(
        `SAAI error not found: registro=${registro}, campo=${campo}, tipo=${tipo}, numero=${numero}`,
      );
    }
    return record;
  }

  async findAllRegistroTypes() {
    return this.repository.findAllRegistroTypes();
  }

  async search(query: string) {
    return this.repository.search(query);
  }

  async count() {
    return this.repository.count();
  }
}
