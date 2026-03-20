import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Anexo22Repository,
  type CatalogName,
  VALID_CATALOGS,
} from './anexo22.repository.js';

@Injectable()
export class Anexo22Service {
  constructor(private readonly repository: Anexo22Repository) {}

  listCatalogs() {
    return VALID_CATALOGS.map((name) => ({
      name,
      label: name.replace(/_/g, ' '),
    }));
  }

  async findAll(catalogName: CatalogName) {
    return this.repository.findAll(catalogName);
  }

  async findByCode(catalogName: CatalogName, code: string) {
    const record = await this.repository.findByCode(catalogName, code);
    if (!record) {
      throw new NotFoundException(
        `Code "${code}" not found in catalog "${catalogName}"`,
      );
    }
    return record;
  }

  async search(catalogName: CatalogName, query: string) {
    return this.repository.search(catalogName, query);
  }

  async count(catalogName: CatalogName) {
    return this.repository.count(catalogName);
  }
}
