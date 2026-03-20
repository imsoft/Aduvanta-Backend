import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CustomsEntriesService } from './customs-entries.service.js';
import { CustomsEntriesRepository } from './customs-entries.repository.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';

const mockRepository = {
  findAllOffices: jest.fn(),
  findOfficeById: jest.fn(),
  insertOffice: jest.fn(),
  findPatentsByOrganization: jest.fn(),
  findPatentById: jest.fn(),
  insertPatent: jest.fn(),
  findEntriesByOrganization: jest.fn(),
  searchEntries: jest.fn(),
  findEntryByIdAndOrg: jest.fn(),
  insertEntry: jest.fn(),
  updateEntry: jest.fn(),
  deleteEntry: jest.fn(),
  findItemsByEntry: jest.fn(),
  findItemById: jest.fn(),
  insertItem: jest.fn(),
  deleteItem: jest.fn(),
  findPartiesByEntry: jest.fn(),
  insertParty: jest.fn(),
  deleteParty: jest.fn(),
  findDocumentsByEntry: jest.fn(),
  insertDocument: jest.fn(),
  deleteDocument: jest.fn(),
  findStatusHistory: jest.fn(),
  insertStatusHistory: jest.fn(),
};

const mockAuditLogsService = {
  log: jest.fn().mockResolvedValue(undefined),
};

const ORG_ID = 'org-1';
const ACTOR_ID = 'user-1';

function makeEntry(overrides: Record<string, unknown> = {}) {
  return {
    id: 'entry-1',
    organizationId: ORG_ID,
    customsOfficeId: 'office-1',
    patentId: 'patent-1',
    entryKey: 'KEY-001',
    entryNumber: 'NUM-001',
    regime: 'IMPORT',
    operationType: 'A1',
    status: 'DRAFT',
    createdById: ACTOR_ID,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('CustomsEntriesService', () => {
  let service: CustomsEntriesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        CustomsEntriesService,
        { provide: CustomsEntriesRepository, useValue: mockRepository },
        { provide: AuditLogsService, useValue: mockAuditLogsService },
      ],
    }).compile();

    service = module.get(CustomsEntriesService);
  });

  // --- createEntry ---

  describe('createEntry', () => {
    it('should create a draft entry and log audit', async () => {
      const office = { id: 'office-1', code: '470', name: 'Manzanillo' };
      const patent = {
        id: 'patent-1',
        organizationId: ORG_ID,
        patentNumber: '1234',
        brokerName: 'Broker',
      };
      const created = makeEntry();

      mockRepository.findOfficeById.mockResolvedValue(office);
      mockRepository.findPatentById.mockResolvedValue(patent);
      mockRepository.insertEntry.mockResolvedValue(created);
      mockRepository.insertStatusHistory.mockResolvedValue({});

      const dto = {
        customsOfficeId: 'office-1',
        patentId: 'patent-1',
        entryKey: 'KEY-001',
        regime: 'IMPORT',
        operationType: 'A1',
      };

      const result = await service.createEntry(dto as any, ACTOR_ID, ORG_ID);

      expect(result).toEqual(created);
      expect(mockRepository.insertEntry).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'DRAFT', organizationId: ORG_ID }),
      );
      expect(mockRepository.insertStatusHistory).toHaveBeenCalledWith(
        expect.objectContaining({ newStatus: 'DRAFT' }),
      );
      expect(mockAuditLogsService.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException if office does not exist', async () => {
      mockRepository.findOfficeById.mockResolvedValue(undefined);

      await expect(
        service.createEntry(
          { customsOfficeId: 'bad', patentId: 'p1' } as any,
          ACTOR_ID,
          ORG_ID,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if patent belongs to different org', async () => {
      mockRepository.findOfficeById.mockResolvedValue({ id: 'office-1' });
      mockRepository.findPatentById.mockResolvedValue({
        id: 'patent-1',
        organizationId: 'other-org',
      });

      await expect(
        service.createEntry(
          { customsOfficeId: 'office-1', patentId: 'patent-1' } as any,
          ACTOR_ID,
          ORG_ID,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // --- changeStatus (FSM transitions) ---

  describe('changeStatus', () => {
    const validTransitions: [string, string][] = [
      ['DRAFT', 'PREVALIDATED'],
      ['DRAFT', 'CANCELLED'],
      ['PREVALIDATED', 'VALIDATED'],
      ['PREVALIDATED', 'DRAFT'],
      ['PREVALIDATED', 'CANCELLED'],
      ['VALIDATED', 'PAID'],
      ['VALIDATED', 'CANCELLED'],
      ['PAID', 'DISPATCHED'],
      ['PAID', 'CANCELLED'],
      ['DISPATCHED', 'RELEASED'],
      ['DISPATCHED', 'CANCELLED'],
      ['RELEASED', 'RECTIFIED'],
    ];

    it.each(validTransitions)(
      'should allow transition from %s to %s',
      async (from, to) => {
        const entry = makeEntry({ status: from });
        const updated = makeEntry({ status: to });

        mockRepository.findEntryByIdAndOrg.mockResolvedValue(entry);
        mockRepository.updateEntry.mockResolvedValue(updated);
        mockRepository.insertStatusHistory.mockResolvedValue({});

        const result = await service.changeStatus(
          'entry-1',
          { status: to } as any,
          ACTOR_ID,
          ORG_ID,
        );

        expect(result.status).toBe(to);
        expect(mockRepository.updateEntry).toHaveBeenCalledWith(
          'entry-1',
          expect.objectContaining({ status: to }),
        );
      },
    );

    const invalidTransitions: [string, string][] = [
      ['DRAFT', 'VALIDATED'],
      ['DRAFT', 'PAID'],
      ['DRAFT', 'RELEASED'],
      ['PREVALIDATED', 'PAID'],
      ['PREVALIDATED', 'RELEASED'],
      ['VALIDATED', 'DRAFT'],
      ['VALIDATED', 'RELEASED'],
      ['PAID', 'DRAFT'],
      ['DISPATCHED', 'DRAFT'],
      ['RELEASED', 'DRAFT'],
      ['RELEASED', 'CANCELLED'],
      ['CANCELLED', 'DRAFT'],
      ['CANCELLED', 'PREVALIDATED'],
      ['RECTIFIED', 'DRAFT'],
    ];

    it.each(invalidTransitions)(
      'should reject transition from %s to %s',
      async (from, to) => {
        const entry = makeEntry({ status: from });
        mockRepository.findEntryByIdAndOrg.mockResolvedValue(entry);

        await expect(
          service.changeStatus(
            'entry-1',
            { status: to } as any,
            ACTOR_ID,
            ORG_ID,
          ),
        ).rejects.toThrow(BadRequestException);
      },
    );
  });

  // --- updateEntry (editable check) ---

  describe('updateEntry', () => {
    it('should update a DRAFT entry', async () => {
      const entry = makeEntry({ status: 'DRAFT' });
      const updated = makeEntry({ status: 'DRAFT', observations: 'updated' });

      mockRepository.findEntryByIdAndOrg.mockResolvedValue(entry);
      mockRepository.updateEntry.mockResolvedValue(updated);

      const result = await service.updateEntry(
        'entry-1',
        { observations: 'updated' } as any,
        ACTOR_ID,
        ORG_ID,
      );
      expect(result).toEqual(updated);
    });

    it('should update a PREVALIDATED entry', async () => {
      const entry = makeEntry({ status: 'PREVALIDATED' });
      mockRepository.findEntryByIdAndOrg.mockResolvedValue(entry);
      mockRepository.updateEntry.mockResolvedValue(entry);

      await expect(
        service.updateEntry('entry-1', {} as any, ACTOR_ID, ORG_ID),
      ).resolves.toBeDefined();
    });

    it.each([
      'VALIDATED',
      'PAID',
      'DISPATCHED',
      'RELEASED',
      'CANCELLED',
      'RECTIFIED',
    ])('should reject update for entry in %s status', async (status) => {
      const entry = makeEntry({ status });
      mockRepository.findEntryByIdAndOrg.mockResolvedValue(entry);

      await expect(
        service.updateEntry('entry-1', {} as any, ACTOR_ID, ORG_ID),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // --- deleteEntry ---

  describe('deleteEntry', () => {
    it('should delete a DRAFT entry', async () => {
      const entry = makeEntry({ status: 'DRAFT' });
      mockRepository.findEntryByIdAndOrg.mockResolvedValue(entry);
      mockRepository.deleteEntry.mockResolvedValue(undefined);

      await expect(
        service.deleteEntry('entry-1', ACTOR_ID, ORG_ID),
      ).resolves.toBeUndefined();
      expect(mockRepository.deleteEntry).toHaveBeenCalledWith('entry-1');
    });

    it('should reject deletion of non-DRAFT entry', async () => {
      const entry = makeEntry({ status: 'VALIDATED' });
      mockRepository.findEntryByIdAndOrg.mockResolvedValue(entry);

      await expect(
        service.deleteEntry('entry-1', ACTOR_ID, ORG_ID),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // --- addItem / removeItem ---

  describe('addItem', () => {
    it('should add an item to a DRAFT entry', async () => {
      const entry = makeEntry({ status: 'DRAFT' });
      const item = {
        id: 'item-1',
        entryId: 'entry-1',
        itemNumber: 1,
        tariffFractionCode: '0101.21.01',
      };

      mockRepository.findEntryByIdAndOrg.mockResolvedValue(entry);
      mockRepository.insertItem.mockResolvedValue(item);

      const result = await service.addItem(
        'entry-1',
        { itemNumber: 1, tariffFractionCode: '0101.21.01' } as any,
        ACTOR_ID,
        ORG_ID,
      );

      expect(result).toEqual(item);
      expect(mockAuditLogsService.log).toHaveBeenCalled();
    });

    it('should reject adding item to non-editable entry', async () => {
      const entry = makeEntry({ status: 'VALIDATED' });
      mockRepository.findEntryByIdAndOrg.mockResolvedValue(entry);

      await expect(
        service.addItem('entry-1', {} as any, ACTOR_ID, ORG_ID),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeItem', () => {
    it('should remove an item from a DRAFT entry', async () => {
      const entry = makeEntry({ status: 'DRAFT' });
      const item = {
        id: 'item-1',
        entryId: 'entry-1',
        itemNumber: 1,
        tariffFractionCode: '0101.21.01',
      };

      mockRepository.findEntryByIdAndOrg.mockResolvedValue(entry);
      mockRepository.findItemById.mockResolvedValue(item);
      mockRepository.deleteItem.mockResolvedValue(undefined);

      await expect(
        service.removeItem('entry-1', 'item-1', ACTOR_ID, ORG_ID),
      ).resolves.toBeUndefined();
    });

    it('should throw NotFoundException if item does not belong to entry', async () => {
      const entry = makeEntry({ status: 'DRAFT' });
      mockRepository.findEntryByIdAndOrg.mockResolvedValue(entry);
      mockRepository.findItemById.mockResolvedValue({
        id: 'item-1',
        entryId: 'other-entry',
      });

      await expect(
        service.removeItem('entry-1', 'item-1', ACTOR_ID, ORG_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if item does not exist', async () => {
      const entry = makeEntry({ status: 'DRAFT' });
      mockRepository.findEntryByIdAndOrg.mockResolvedValue(entry);
      mockRepository.findItemById.mockResolvedValue(undefined);

      await expect(
        service.removeItem('entry-1', 'item-1', ACTOR_ID, ORG_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // --- addParty / removeParty ---

  describe('addParty', () => {
    it('should add a party to a DRAFT entry', async () => {
      const entry = makeEntry({ status: 'DRAFT' });
      const party = {
        id: 'party-1',
        entryId: 'entry-1',
        role: 'IMPORTER',
        taxId: 'RFC123',
      };

      mockRepository.findEntryByIdAndOrg.mockResolvedValue(entry);
      mockRepository.insertParty.mockResolvedValue(party);

      const result = await service.addParty(
        'entry-1',
        { role: 'IMPORTER', taxId: 'RFC123' } as any,
        ACTOR_ID,
        ORG_ID,
      );
      expect(result).toEqual(party);
    });

    it('should reject adding party to non-editable entry', async () => {
      const entry = makeEntry({ status: 'PAID' });
      mockRepository.findEntryByIdAndOrg.mockResolvedValue(entry);

      await expect(
        service.addParty('entry-1', {} as any, ACTOR_ID, ORG_ID),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeParty', () => {
    it('should remove a party from an entry', async () => {
      const entry = makeEntry({ status: 'DRAFT' });
      mockRepository.findEntryByIdAndOrg.mockResolvedValue(entry);
      mockRepository.deleteParty.mockResolvedValue(undefined);

      await expect(
        service.removeParty('entry-1', 'party-1', ACTOR_ID, ORG_ID),
      ).resolves.toBeUndefined();
    });
  });

  // --- addDocument / removeDocument ---

  describe('addDocument', () => {
    it('should add a document to an entry', async () => {
      const entry = makeEntry({ status: 'DRAFT' });
      const doc = {
        id: 'doc-1',
        entryId: 'entry-1',
        documentTypeCode: 'INV',
        documentNumber: 'DOC-001',
      };

      mockRepository.findEntryByIdAndOrg.mockResolvedValue(entry);
      mockRepository.insertDocument.mockResolvedValue(doc);

      const result = await service.addDocument(
        'entry-1',
        { documentTypeCode: 'INV' } as any,
        ACTOR_ID,
        ORG_ID,
      );
      expect(result).toEqual(doc);
    });
  });

  describe('removeDocument', () => {
    it('should remove a document from an entry', async () => {
      const entry = makeEntry({ status: 'DRAFT' });
      mockRepository.findEntryByIdAndOrg.mockResolvedValue(entry);
      mockRepository.deleteDocument.mockResolvedValue(undefined);

      await expect(
        service.removeDocument('entry-1', 'doc-1', ACTOR_ID, ORG_ID),
      ).resolves.toBeUndefined();
    });
  });

  // --- getEntryById ---

  describe('getEntryById', () => {
    it('should throw NotFoundException if entry does not exist', async () => {
      mockRepository.findEntryByIdAndOrg.mockResolvedValue(undefined);

      await expect(service.getEntryById('bad-id', ORG_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return the entry if found', async () => {
      const entry = makeEntry();
      mockRepository.findEntryByIdAndOrg.mockResolvedValue(entry);

      const result = await service.getEntryById('entry-1', ORG_ID);
      expect(result).toEqual(entry);
    });
  });
});
