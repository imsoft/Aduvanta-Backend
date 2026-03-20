import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { WarehouseService } from './warehouse.service.js';
import { WarehouseRepository } from './warehouse.repository.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';

const mockRepository = {
  findWarehousesByOrganization: jest.fn(),
  findWarehouseByIdAndOrg: jest.fn(),
  insertWarehouse: jest.fn(),
  updateWarehouse: jest.fn(),
  deleteWarehouse: jest.fn(),
  findZonesByWarehouse: jest.fn(),
  findZoneById: jest.fn(),
  insertZone: jest.fn(),
  updateZone: jest.fn(),
  deleteZone: jest.fn(),
  findInventoryByOrganization: jest.fn(),
  searchInventory: jest.fn(),
  findInventoryByIdAndOrg: jest.fn(),
  findInventoryByWarehouse: jest.fn(),
  insertInventoryItem: jest.fn(),
  updateInventoryItem: jest.fn(),
  deleteInventoryItem: jest.fn(),
  findMovementsByOrganization: jest.fn(),
  findMovementByIdAndOrg: jest.fn(),
  insertMovement: jest.fn(),
  updateMovement: jest.fn(),
};

const mockAuditLogsService = {
  log: jest.fn().mockResolvedValue(undefined),
};

const ORG_ID = 'org-1';
const ACTOR_ID = 'user-1';

function makeWarehouse(overrides: Record<string, unknown> = {}) {
  return {
    id: 'wh-1',
    organizationId: ORG_ID,
    type: 'BONDED',
    name: 'Warehouse A',
    code: 'WH-A',
    createdById: ACTOR_ID,
    createdAt: new Date(),
    ...overrides,
  };
}

function makeMovement(overrides: Record<string, unknown> = {}) {
  return {
    id: 'mov-1',
    organizationId: ORG_ID,
    warehouseId: 'wh-1',
    direction: 'INBOUND',
    status: 'PENDING',
    productDescription: 'Test goods',
    quantity: '100',
    createdById: ACTOR_ID,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('WarehouseService', () => {
  let service: WarehouseService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        WarehouseService,
        { provide: WarehouseRepository, useValue: mockRepository },
        { provide: AuditLogsService, useValue: mockAuditLogsService },
      ],
    }).compile();

    service = module.get(WarehouseService);
  });

  // --- Warehouses ---

  describe('createWarehouse', () => {
    it('should create a warehouse and log audit', async () => {
      const created = makeWarehouse();
      mockRepository.insertWarehouse.mockResolvedValue(created);

      const dto = { type: 'BONDED', name: 'Warehouse A', code: 'WH-A' };
      const result = await service.createWarehouse(
        dto as any,
        ACTOR_ID,
        ORG_ID,
      );

      expect(result).toEqual(created);
      expect(mockRepository.insertWarehouse).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: ORG_ID,
          name: 'Warehouse A',
        }),
      );
      expect(mockAuditLogsService.log).toHaveBeenCalled();
    });
  });

  describe('getWarehouseById', () => {
    it('should throw NotFoundException if warehouse not found', async () => {
      mockRepository.findWarehouseByIdAndOrg.mockResolvedValue(undefined);

      await expect(service.getWarehouseById('bad-id', ORG_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return warehouse if found', async () => {
      const warehouse = makeWarehouse();
      mockRepository.findWarehouseByIdAndOrg.mockResolvedValue(warehouse);

      const result = await service.getWarehouseById('wh-1', ORG_ID);
      expect(result).toEqual(warehouse);
    });
  });

  // --- Zones ---

  describe('createZone', () => {
    it('should create a zone for an existing warehouse', async () => {
      const warehouse = makeWarehouse();
      const zone = {
        id: 'zone-1',
        warehouseId: 'wh-1',
        type: 'STORAGE',
        name: 'Zone A',
        code: 'Z-A',
      };

      mockRepository.findWarehouseByIdAndOrg.mockResolvedValue(warehouse);
      mockRepository.insertZone.mockResolvedValue(zone);

      const dto = { type: 'STORAGE', name: 'Zone A', code: 'Z-A' };
      const result = await service.createZone(
        'wh-1',
        dto as any,
        ACTOR_ID,
        ORG_ID,
      );

      expect(result).toEqual(zone);
    });

    it('should throw NotFoundException if warehouse does not exist', async () => {
      mockRepository.findWarehouseByIdAndOrg.mockResolvedValue(undefined);

      await expect(
        service.createZone('bad-wh', {} as any, ACTOR_ID, ORG_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getZoneById', () => {
    it('should throw NotFoundException if zone not in warehouse', async () => {
      mockRepository.findWarehouseByIdAndOrg.mockResolvedValue(makeWarehouse());
      mockRepository.findZoneById.mockResolvedValue({
        id: 'zone-1',
        warehouseId: 'other-wh',
      });

      await expect(
        service.getZoneById('wh-1', 'zone-1', ORG_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // --- Inventory ---

  describe('createInventoryItem', () => {
    it('should create an inventory item for an existing warehouse', async () => {
      const warehouse = makeWarehouse();
      const item = {
        id: 'inv-item-1',
        organizationId: ORG_ID,
        warehouseId: 'wh-1',
        productDescription: 'Product X',
        quantity: '50',
      };

      mockRepository.findWarehouseByIdAndOrg.mockResolvedValue(warehouse);
      mockRepository.insertInventoryItem.mockResolvedValue(item);

      const dto = {
        warehouseId: 'wh-1',
        productDescription: 'Product X',
        quantity: '50',
      };
      const result = await service.createInventoryItem(
        dto as any,
        ACTOR_ID,
        ORG_ID,
      );

      expect(result).toEqual(item);
      expect(mockAuditLogsService.log).toHaveBeenCalled();
    });
  });

  // --- Movement FSM ---

  describe('completeMovement', () => {
    it('should complete an IN_PROCESS movement', async () => {
      const movement = makeMovement({ status: 'IN_PROCESS' });
      const completed = makeMovement({ status: 'COMPLETED' });

      mockRepository.findMovementByIdAndOrg.mockResolvedValue(movement);
      mockRepository.updateMovement.mockResolvedValue(completed);

      const result = await service.completeMovement('mov-1', ACTOR_ID, ORG_ID);
      expect(result.status).toBe('COMPLETED');
    });

    it('should reject completing a PENDING movement (not directly completable)', async () => {
      // PENDING -> [IN_PROCESS, CANCELLED], COMPLETED is not in PENDING's allowed list
      const movement = makeMovement({ status: 'PENDING' });
      mockRepository.findMovementByIdAndOrg.mockResolvedValue(movement);

      await expect(
        service.completeMovement('mov-1', ACTOR_ID, ORG_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject completing a COMPLETED movement', async () => {
      const movement = makeMovement({ status: 'COMPLETED' });
      mockRepository.findMovementByIdAndOrg.mockResolvedValue(movement);

      await expect(
        service.completeMovement('mov-1', ACTOR_ID, ORG_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject completing a CANCELLED movement', async () => {
      const movement = makeMovement({ status: 'CANCELLED' });
      mockRepository.findMovementByIdAndOrg.mockResolvedValue(movement);

      await expect(
        service.completeMovement('mov-1', ACTOR_ID, ORG_ID),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelMovement', () => {
    it('should cancel a PENDING movement', async () => {
      const movement = makeMovement({ status: 'PENDING' });
      const cancelled = makeMovement({ status: 'CANCELLED' });

      mockRepository.findMovementByIdAndOrg.mockResolvedValue(movement);
      mockRepository.updateMovement.mockResolvedValue(cancelled);

      const result = await service.cancelMovement('mov-1', ACTOR_ID, ORG_ID);
      expect(result.status).toBe('CANCELLED');
    });

    it('should cancel an IN_PROCESS movement', async () => {
      const movement = makeMovement({ status: 'IN_PROCESS' });
      const cancelled = makeMovement({ status: 'CANCELLED' });

      mockRepository.findMovementByIdAndOrg.mockResolvedValue(movement);
      mockRepository.updateMovement.mockResolvedValue(cancelled);

      const result = await service.cancelMovement('mov-1', ACTOR_ID, ORG_ID);
      expect(result.status).toBe('CANCELLED');
    });

    it('should reject cancelling a COMPLETED movement', async () => {
      const movement = makeMovement({ status: 'COMPLETED' });
      mockRepository.findMovementByIdAndOrg.mockResolvedValue(movement);

      await expect(
        service.cancelMovement('mov-1', ACTOR_ID, ORG_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject cancelling an already CANCELLED movement', async () => {
      const movement = makeMovement({ status: 'CANCELLED' });
      mockRepository.findMovementByIdAndOrg.mockResolvedValue(movement);

      await expect(
        service.cancelMovement('mov-1', ACTOR_ID, ORG_ID),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createMovement', () => {
    it('should create a movement for a valid warehouse', async () => {
      const warehouse = makeWarehouse();
      const movement = makeMovement();

      mockRepository.findWarehouseByIdAndOrg.mockResolvedValue(warehouse);
      mockRepository.insertMovement.mockResolvedValue(movement);

      const dto = {
        warehouseId: 'wh-1',
        direction: 'INBOUND',
        productDescription: 'Test goods',
        quantity: '100',
      };

      const result = await service.createMovement(dto as any, ACTOR_ID, ORG_ID);
      expect(result).toEqual(movement);
      expect(mockAuditLogsService.log).toHaveBeenCalled();
    });
  });

  describe('getMovementById', () => {
    it('should throw NotFoundException if movement not found', async () => {
      mockRepository.findMovementByIdAndOrg.mockResolvedValue(undefined);

      await expect(service.getMovementById('bad-id', ORG_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
