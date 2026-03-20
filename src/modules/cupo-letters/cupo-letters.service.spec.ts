import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CupoLettersService } from './cupo-letters.service.js';
import { CupoLettersRepository } from './cupo-letters.repository.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';

const mockRepository = {
  findByOrganization: jest.fn(),
  search: jest.fn(),
  findByIdAndOrg: jest.fn(),
  insertCupoLetter: jest.fn(),
  updateCupoLetter: jest.fn(),
  deleteCupoLetter: jest.fn(),
  findUsagesByCupoLetter: jest.fn(),
  findUsageById: jest.fn(),
  insertUsage: jest.fn(),
  deleteUsage: jest.fn(),
};

const mockAuditLogsService = {
  log: jest.fn().mockResolvedValue(undefined),
};

const ORG_ID = 'org-1';
const ACTOR_ID = 'user-1';

function makeLetter(overrides: Record<string, unknown> = {}) {
  return {
    id: 'letter-1',
    organizationId: ORG_ID,
    type: 'TARIFF_RATE_QUOTA',
    letterNumber: 'CL-001',
    status: 'DRAFT',
    authorizedQuantity: '1000.0000',
    usedQuantity: '0.0000',
    remainingQuantity: '1000.0000',
    unitOfMeasure: 'KG',
    productDescription: 'Steel rods',
    createdById: ACTOR_ID,
    createdAt: new Date(),
    ...overrides,
  };
}

function makeUsage(overrides: Record<string, unknown> = {}) {
  return {
    id: 'usage-1',
    cupoLetterId: 'letter-1',
    quantityUsed: '200.0000',
    unitOfMeasure: 'KG',
    usageDate: new Date(),
    createdById: ACTOR_ID,
    ...overrides,
  };
}

describe('CupoLettersService', () => {
  let service: CupoLettersService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        CupoLettersService,
        { provide: CupoLettersRepository, useValue: mockRepository },
        { provide: AuditLogsService, useValue: mockAuditLogsService },
      ],
    }).compile();

    service = module.get(CupoLettersService);
  });

  // --- createCupoLetter ---

  describe('createCupoLetter', () => {
    it('should create a CUPO letter with remaining = authorized', async () => {
      const created = makeLetter();
      mockRepository.insertCupoLetter.mockResolvedValue(created);

      const dto = {
        type: 'TARIFF_RATE_QUOTA',
        letterNumber: 'CL-001',
        authorizedQuantity: '1000.0000',
        unitOfMeasure: 'KG',
        productDescription: 'Steel rods',
      };

      const result = await service.createCupoLetter(
        dto as any,
        ACTOR_ID,
        ORG_ID,
      );

      expect(result).toEqual(created);
      expect(mockRepository.insertCupoLetter).toHaveBeenCalledWith(
        expect.objectContaining({
          authorizedQuantity: '1000.0000',
          remainingQuantity: '1000.0000',
        }),
      );
      expect(mockAuditLogsService.log).toHaveBeenCalled();
    });
  });

  // --- Status Transitions ---

  describe('changeCupoLetterStatus', () => {
    const validTransitions: [string, string][] = [
      ['DRAFT', 'SUBMITTED'],
      ['DRAFT', 'CANCELLED'],
      ['SUBMITTED', 'APPROVED'],
      ['SUBMITTED', 'REJECTED'],
      ['APPROVED', 'PARTIALLY_USED'],
      ['APPROVED', 'FULLY_USED'],
      ['APPROVED', 'EXPIRED'],
      ['APPROVED', 'CANCELLED'],
      ['PARTIALLY_USED', 'FULLY_USED'],
      ['PARTIALLY_USED', 'EXPIRED'],
      ['PARTIALLY_USED', 'CANCELLED'],
      ['REJECTED', 'DRAFT'],
    ];

    it.each(validTransitions)(
      'should allow transition from %s to %s',
      async (from, to) => {
        const letter = makeLetter({ status: from });
        const updated = makeLetter({ status: to });

        mockRepository.findByIdAndOrg.mockResolvedValue(letter);
        mockRepository.updateCupoLetter.mockResolvedValue(updated);

        const result = await service.changeCupoLetterStatus(
          'letter-1',
          { status: to } as any,
          ACTOR_ID,
          ORG_ID,
        );
        expect(result.status).toBe(to);
      },
    );

    const invalidTransitions: [string, string][] = [
      ['DRAFT', 'APPROVED'],
      ['DRAFT', 'FULLY_USED'],
      ['SUBMITTED', 'DRAFT'],
      ['SUBMITTED', 'CANCELLED'],
      ['APPROVED', 'DRAFT'],
      ['APPROVED', 'SUBMITTED'],
      ['REJECTED', 'APPROVED'],
      ['REJECTED', 'SUBMITTED'],
    ];

    it.each(invalidTransitions)(
      'should reject transition from %s to %s',
      async (from, to) => {
        mockRepository.findByIdAndOrg.mockResolvedValue(
          makeLetter({ status: from }),
        );

        await expect(
          service.changeCupoLetterStatus(
            'letter-1',
            { status: to } as any,
            ACTOR_ID,
            ORG_ID,
          ),
        ).rejects.toThrow(BadRequestException);
      },
    );
  });

  // --- updateCupoLetter (editable check) ---

  describe('updateCupoLetter', () => {
    it('should update a DRAFT letter', async () => {
      const letter = makeLetter({ status: 'DRAFT' });
      const updated = makeLetter({ status: 'DRAFT', letterNumber: 'CL-002' });

      mockRepository.findByIdAndOrg.mockResolvedValue(letter);
      mockRepository.updateCupoLetter.mockResolvedValue(updated);

      const result = await service.updateCupoLetter(
        'letter-1',
        { letterNumber: 'CL-002' } as any,
        ACTOR_ID,
        ORG_ID,
      );
      expect(result).toEqual(updated);
    });

    it('should update a REJECTED letter', async () => {
      const letter = makeLetter({ status: 'REJECTED' });
      mockRepository.findByIdAndOrg.mockResolvedValue(letter);
      mockRepository.updateCupoLetter.mockResolvedValue(letter);

      await expect(
        service.updateCupoLetter('letter-1', {} as any, ACTOR_ID, ORG_ID),
      ).resolves.toBeDefined();
    });

    it.each([
      'SUBMITTED',
      'APPROVED',
      'PARTIALLY_USED',
      'FULLY_USED',
      'EXPIRED',
      'CANCELLED',
    ])('should reject update for letter in %s status', async (status) => {
      mockRepository.findByIdAndOrg.mockResolvedValue(makeLetter({ status }));

      await expect(
        service.updateCupoLetter('letter-1', {} as any, ACTOR_ID, ORG_ID),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // --- Usage ---

  describe('registerUsage', () => {
    it('should register usage on an APPROVED letter', async () => {
      const letter = makeLetter({
        status: 'APPROVED',
        remainingQuantity: '1000.0000',
      });
      const usage = makeUsage({ quantityUsed: '200.0000' });

      mockRepository.findByIdAndOrg.mockResolvedValue(letter);
      mockRepository.insertUsage.mockResolvedValue(usage);
      // recalculateUsage calls
      mockRepository.findUsagesByCupoLetter.mockResolvedValue([usage]);
      mockRepository.updateCupoLetter.mockResolvedValue(
        makeLetter({
          status: 'PARTIALLY_USED',
          usedQuantity: '200.0000',
          remainingQuantity: '800.0000',
        }),
      );

      const dto = { quantityUsed: '200.0000', unitOfMeasure: 'KG' };
      const result = await service.registerUsage(
        'letter-1',
        dto as any,
        ACTOR_ID,
        ORG_ID,
      );

      expect(result).toEqual(usage);
      expect(mockAuditLogsService.log).toHaveBeenCalled();
    });

    it('should register usage on a PARTIALLY_USED letter', async () => {
      const letter = makeLetter({
        status: 'PARTIALLY_USED',
        remainingQuantity: '800.0000',
      });
      const usage = makeUsage({ quantityUsed: '100.0000' });

      mockRepository.findByIdAndOrg.mockResolvedValue(letter);
      mockRepository.insertUsage.mockResolvedValue(usage);
      mockRepository.findUsagesByCupoLetter.mockResolvedValue([
        makeUsage({ quantityUsed: '200.0000' }),
        usage,
      ]);
      mockRepository.updateCupoLetter.mockResolvedValue({});

      const dto = { quantityUsed: '100.0000', unitOfMeasure: 'KG' };

      await expect(
        service.registerUsage('letter-1', dto as any, ACTOR_ID, ORG_ID),
      ).resolves.toBeDefined();
    });

    it('should throw when quantity exceeds remaining', async () => {
      const letter = makeLetter({
        status: 'APPROVED',
        remainingQuantity: '100.0000',
      });
      mockRepository.findByIdAndOrg.mockResolvedValue(letter);

      const dto = { quantityUsed: '200.0000', unitOfMeasure: 'KG' };

      await expect(
        service.registerUsage('letter-1', dto as any, ACTOR_ID, ORG_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when letter is in non-active status', async () => {
      const letter = makeLetter({ status: 'DRAFT' });
      mockRepository.findByIdAndOrg.mockResolvedValue(letter);

      await expect(
        service.registerUsage(
          'letter-1',
          { quantityUsed: '10' } as any,
          ACTOR_ID,
          ORG_ID,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when letter is FULLY_USED', async () => {
      const letter = makeLetter({
        status: 'FULLY_USED',
        remainingQuantity: '0.0000',
      });
      mockRepository.findByIdAndOrg.mockResolvedValue(letter);

      await expect(
        service.registerUsage(
          'letter-1',
          { quantityUsed: '10' } as any,
          ACTOR_ID,
          ORG_ID,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('recalculateUsage (via registerUsage)', () => {
    it('should set status to FULLY_USED when all quantity consumed', async () => {
      const letter = makeLetter({
        status: 'APPROVED',
        remainingQuantity: '100.0000',
        authorizedQuantity: '100.0000',
      });
      const usage = makeUsage({ quantityUsed: '100.0000' });

      mockRepository.findByIdAndOrg.mockResolvedValue(letter);
      mockRepository.insertUsage.mockResolvedValue(usage);
      mockRepository.findUsagesByCupoLetter.mockResolvedValue([usage]);
      mockRepository.updateCupoLetter.mockResolvedValue({});

      await service.registerUsage(
        'letter-1',
        { quantityUsed: '100.0000' } as any,
        ACTOR_ID,
        ORG_ID,
      );

      expect(mockRepository.updateCupoLetter).toHaveBeenCalledWith(
        'letter-1',
        expect.objectContaining({
          usedQuantity: '100.0000',
          remainingQuantity: '0.0000',
          status: 'FULLY_USED',
        }),
      );
    });

    it('should set status to PARTIALLY_USED when some quantity consumed', async () => {
      const letter = makeLetter({
        status: 'APPROVED',
        remainingQuantity: '1000.0000',
        authorizedQuantity: '1000.0000',
      });
      const usage = makeUsage({ quantityUsed: '300.0000' });

      mockRepository.findByIdAndOrg.mockResolvedValue(letter);
      mockRepository.insertUsage.mockResolvedValue(usage);
      mockRepository.findUsagesByCupoLetter.mockResolvedValue([usage]);
      mockRepository.updateCupoLetter.mockResolvedValue({});

      await service.registerUsage(
        'letter-1',
        { quantityUsed: '300.0000' } as any,
        ACTOR_ID,
        ORG_ID,
      );

      expect(mockRepository.updateCupoLetter).toHaveBeenCalledWith(
        'letter-1',
        expect.objectContaining({
          usedQuantity: '300.0000',
          remainingQuantity: '700.0000',
          status: 'PARTIALLY_USED',
        }),
      );
    });
  });

  describe('deleteUsage', () => {
    it('should delete a usage and recalculate', async () => {
      const letter = makeLetter({ status: 'PARTIALLY_USED' });
      const usage = makeUsage({ cupoLetterId: 'letter-1' });

      mockRepository.findByIdAndOrg.mockResolvedValue(letter);
      mockRepository.findUsageById.mockResolvedValue(usage);
      mockRepository.deleteUsage.mockResolvedValue(undefined);
      mockRepository.findUsagesByCupoLetter.mockResolvedValue([]);
      mockRepository.updateCupoLetter.mockResolvedValue({});

      await service.deleteUsage('letter-1', 'usage-1', ACTOR_ID, ORG_ID);

      expect(mockRepository.deleteUsage).toHaveBeenCalledWith('usage-1');
      // After deleting all usages, should revert to APPROVED
      expect(mockRepository.updateCupoLetter).toHaveBeenCalledWith(
        'letter-1',
        expect.objectContaining({
          usedQuantity: '0.0000',
          remainingQuantity: '1000.0000',
          status: 'APPROVED',
        }),
      );
    });

    it('should throw NotFoundException if usage not found', async () => {
      mockRepository.findByIdAndOrg.mockResolvedValue(makeLetter());
      mockRepository.findUsageById.mockResolvedValue(undefined);

      await expect(
        service.deleteUsage('letter-1', 'bad-id', ACTOR_ID, ORG_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if usage belongs to different letter', async () => {
      mockRepository.findByIdAndOrg.mockResolvedValue(makeLetter());
      mockRepository.findUsageById.mockResolvedValue(
        makeUsage({ cupoLetterId: 'other-letter' }),
      );

      await expect(
        service.deleteUsage('letter-1', 'usage-1', ACTOR_ID, ORG_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
