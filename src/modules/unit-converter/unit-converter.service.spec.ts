import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UnitConverterService } from './unit-converter.service.js';

describe('UnitConverterService', () => {
  let service: UnitConverterService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UnitConverterService],
    }).compile();

    service = module.get(UnitConverterService);
  });

  // --- listCategories ---

  describe('listCategories', () => {
    it('should return all categories including TEMPERATURE', () => {
      const categories = service.listCategories();

      const names = categories.map((c) => c.category);
      expect(names).toContain('LENGTH');
      expect(names).toContain('WEIGHT');
      expect(names).toContain('VOLUME');
      expect(names).toContain('AREA');
      expect(names).toContain('SPEED');
      expect(names).toContain('PRESSURE');
      expect(names).toContain('ENERGY');
      expect(names).toContain('POWER');
      expect(names).toContain('DATA');
      expect(names).toContain('TIME');
      expect(names).toContain('FUEL_ECONOMY');
      expect(names).toContain('ANGLE');
      expect(names).toContain('TEMPERATURE');
    });

    it('should return categories sorted alphabetically', () => {
      const categories = service.listCategories();
      const names = categories.map((c) => c.category);
      const sorted = [...names].sort();
      expect(names).toEqual(sorted);
    });

    it('should include units for each category', () => {
      const categories = service.listCategories();
      for (const cat of categories) {
        expect(cat.units.length).toBeGreaterThan(0);
      }
    });
  });

  // --- getUnitsForCategory ---

  describe('getUnitsForCategory', () => {
    it('should return units for LENGTH', () => {
      const units = service.getUnitsForCategory('LENGTH');
      expect(units).toContain('KILOMETER');
      expect(units).toContain('METER');
      expect(units).toContain('MILE');
      expect(units).toContain('FOOT');
      expect(units).toContain('INCH');
    });

    it('should return temperature units for TEMPERATURE', () => {
      const units = service.getUnitsForCategory('TEMPERATURE');
      expect(units).toContain('CELSIUS');
      expect(units).toContain('FAHRENHEIT');
      expect(units).toContain('KELVIN');
      expect(units).toContain('RANKINE');
    });

    it('should be case insensitive', () => {
      const units = service.getUnitsForCategory('weight');
      expect(units).toContain('KILOGRAM');
      expect(units).toContain('POUND');
    });

    it('should throw BadRequestException for unknown category', () => {
      expect(() => service.getUnitsForCategory('INVALID')).toThrow(
        BadRequestException,
      );
    });
  });

  // --- convert: same unit ---

  describe('convert same unit', () => {
    it('should return same value when converting to same unit', () => {
      const result = service.convert('LENGTH', 'METER', 'METER', 42);
      expect(result.toValue).toBe(42);
    });

    it('should return same value for weight same unit', () => {
      const result = service.convert('WEIGHT', 'KILOGRAM', 'KILOGRAM', 100);
      expect(result.toValue).toBe(100);
    });
  });

  // --- convert: LENGTH ---

  describe('convert LENGTH', () => {
    it('should convert 1 km to 1000 m', () => {
      const result = service.convert('LENGTH', 'KILOMETER', 'METER', 1);
      expect(result.toValue).toBe(1000);
    });

    it('should convert 1 mile to approximately 1609.344 m', () => {
      const result = service.convert('LENGTH', 'MILE', 'METER', 1);
      expect(result.toValue).toBeCloseTo(1609.344, 3);
    });

    it('should convert 1 foot to 12 inches', () => {
      const result = service.convert('LENGTH', 'FOOT', 'INCH', 1);
      expect(result.toValue).toBeCloseTo(12, 5);
    });

    it('should convert 1 yard to 3 feet', () => {
      const result = service.convert('LENGTH', 'YARD', 'FOOT', 1);
      expect(result.toValue).toBeCloseTo(3, 5);
    });

    it('should convert 1 nautical mile to 1852 m', () => {
      const result = service.convert('LENGTH', 'NAUTICAL_MILE', 'METER', 1);
      expect(result.toValue).toBe(1852);
    });
  });

  // --- convert: WEIGHT ---

  describe('convert WEIGHT', () => {
    it('should convert 1 lb to approximately 0.453592 kg', () => {
      const result = service.convert('WEIGHT', 'POUND', 'KILOGRAM', 1);
      expect(result.toValue).toBeCloseTo(0.453592, 4);
    });

    it('should convert 1 kg to approximately 2.20462 lb', () => {
      const result = service.convert('WEIGHT', 'KILOGRAM', 'POUND', 1);
      expect(result.toValue).toBeCloseTo(2.20462, 3);
    });

    it('should convert 1 metric ton to 1000 kg', () => {
      const result = service.convert('WEIGHT', 'METRIC_TON', 'KILOGRAM', 1);
      expect(result.toValue).toBe(1000);
    });

    it('should convert 16 ounces to approximately 1 pound', () => {
      const result = service.convert('WEIGHT', 'OUNCE', 'POUND', 16);
      expect(result.toValue).toBeCloseTo(1, 3);
    });
  });

  // --- convert: VOLUME ---

  describe('convert VOLUME', () => {
    it('should convert 1 cubic meter to 1000 liters', () => {
      const result = service.convert('VOLUME', 'CUBIC_METER', 'LITER', 1);
      expect(result.toValue).toBe(1000);
    });

    it('should convert 1 US gallon to approximately 3.78541 liters', () => {
      const result = service.convert('VOLUME', 'US_GALLON', 'LITER', 1);
      expect(result.toValue).toBeCloseTo(3.78541, 4);
    });
  });

  // --- convert: TEMPERATURE ---

  describe('convert TEMPERATURE', () => {
    it('should convert 0 C to 32 F', () => {
      const result = service.convert('TEMPERATURE', 'CELSIUS', 'FAHRENHEIT', 0);
      expect(result.toValue).toBe(32);
    });

    it('should convert 0 C to 273.15 K', () => {
      const result = service.convert('TEMPERATURE', 'CELSIUS', 'KELVIN', 0);
      expect(result.toValue).toBe(273.15);
    });

    it('should convert 100 C to 212 F', () => {
      const result = service.convert(
        'TEMPERATURE',
        'CELSIUS',
        'FAHRENHEIT',
        100,
      );
      expect(result.toValue).toBe(212);
    });

    it('should convert 32 F to 0 C', () => {
      const result = service.convert(
        'TEMPERATURE',
        'FAHRENHEIT',
        'CELSIUS',
        32,
      );
      expect(result.toValue).toBeCloseTo(0, 10);
    });

    it('should convert 273.15 K to 0 C', () => {
      const result = service.convert(
        'TEMPERATURE',
        'KELVIN',
        'CELSIUS',
        273.15,
      );
      expect(result.toValue).toBeCloseTo(0, 10);
    });

    it('should convert 0 K to -273.15 C', () => {
      const result = service.convert('TEMPERATURE', 'KELVIN', 'CELSIUS', 0);
      expect(result.toValue).toBe(-273.15);
    });

    it('should convert 0 C to 491.67 R', () => {
      const result = service.convert('TEMPERATURE', 'CELSIUS', 'RANKINE', 0);
      expect(result.toValue).toBeCloseTo(491.67, 2);
    });

    it('should throw for unknown temperature unit (from)', () => {
      expect(() =>
        service.convert('TEMPERATURE', 'INVALID', 'CELSIUS', 0),
      ).toThrow(BadRequestException);
    });

    it('should throw for unknown temperature unit (to)', () => {
      expect(() =>
        service.convert('TEMPERATURE', 'CELSIUS', 'INVALID', 0),
      ).toThrow(BadRequestException);
    });
  });

  // --- convert: invalid inputs ---

  describe('convert invalid inputs', () => {
    it('should throw BadRequestException for unknown category', () => {
      expect(() => service.convert('UNKNOWN', 'METER', 'FOOT', 1)).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for unknown fromUnit', () => {
      expect(() => service.convert('LENGTH', 'PARSEC', 'METER', 1)).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for unknown toUnit', () => {
      expect(() => service.convert('LENGTH', 'METER', 'PARSEC', 1)).toThrow(
        BadRequestException,
      );
    });
  });

  // --- convert: AREA ---

  describe('convert AREA', () => {
    it('should convert 1 hectare to 10000 square meters', () => {
      const result = service.convert('AREA', 'HECTARE', 'SQUARE_METER', 1);
      expect(result.toValue).toBe(10000);
    });
  });

  // --- convert: TIME ---

  describe('convert TIME', () => {
    it('should convert 1 hour to 3600 seconds', () => {
      const result = service.convert('TIME', 'HOUR', 'SECOND', 1);
      expect(result.toValue).toBe(3600);
    });

    it('should convert 1 day to 24 hours', () => {
      const result = service.convert('TIME', 'DAY', 'HOUR', 1);
      expect(result.toValue).toBe(24);
    });
  });

  // --- convert: DATA ---

  describe('convert DATA', () => {
    it('should convert 1 GB to 1024 MB', () => {
      const result = service.convert('DATA', 'GIGABYTE', 'MEGABYTE', 1);
      expect(result.toValue).toBe(1024);
    });

    it('should convert 1 MB to 1048576 bytes', () => {
      const result = service.convert('DATA', 'MEGABYTE', 'BYTE', 1);
      expect(result.toValue).toBe(1048576);
    });
  });

  // --- convertAll ---

  describe('convertAll', () => {
    it('should return conversions for all units in category', () => {
      const result = service.convertAll('LENGTH', 'METER', 1);

      expect(result.category).toBe('LENGTH');
      expect(result.fromUnit).toBe('METER');
      expect(result.fromValue).toBe(1);
      expect(result.conversions.METER).toBe(1);
      expect(result.conversions.KILOMETER).toBeCloseTo(0.001, 5);
      expect(result.conversions.CENTIMETER).toBeCloseTo(100, 5);
    });

    it('should convert all temperature units', () => {
      const result = service.convertAll('TEMPERATURE', 'CELSIUS', 100);

      expect(result.conversions.CELSIUS).toBe(100);
      expect(result.conversions.FAHRENHEIT).toBe(212);
      expect(result.conversions.KELVIN).toBeCloseTo(373.15, 2);
    });
  });

  // --- Result shape ---

  describe('result shape', () => {
    it('should include category, fromUnit, toUnit, fromValue, toValue', () => {
      const result = service.convert('WEIGHT', 'KILOGRAM', 'GRAM', 1);

      expect(result).toEqual({
        category: 'WEIGHT',
        fromUnit: 'KILOGRAM',
        toUnit: 'GRAM',
        fromValue: 1,
        toValue: 1000,
      });
    });
  });

  // --- Case insensitivity ---

  describe('case insensitivity', () => {
    it('should handle lowercase category', () => {
      const result = service.convert('length', 'METER', 'KILOMETER', 1000);
      expect(result.toValue).toBe(1);
    });

    it('should handle lowercase units', () => {
      const result = service.convert('LENGTH', 'meter', 'kilometer', 1000);
      expect(result.toValue).toBe(1);
    });
  });
});
