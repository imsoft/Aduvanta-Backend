import { Injectable, BadRequestException } from '@nestjs/common';

type ConversionTable = Record<string, number>;

// All conversion factors are relative to a base unit per category.
// To convert A → B: value * (baseFactorA / baseFactorB)

// ========== Length (base: meters) ==========
const LENGTH: ConversionTable = {
  // Metric
  KILOMETER: 1000,
  METER: 1,
  CENTIMETER: 0.01,
  MILLIMETER: 0.001,
  MICROMETER: 0.000001,
  NANOMETER: 0.000000001,
  // Imperial / US
  MILE: 1609.344,
  YARD: 0.9144,
  FOOT: 0.3048,
  INCH: 0.0254,
  // Maritime / Aviation
  NAUTICAL_MILE: 1852,
  // Astronomical
  LIGHT_YEAR: 9.461e15,
};

// ========== Weight / Mass (base: kilograms) ==========
const WEIGHT: ConversionTable = {
  // Metric
  METRIC_TON: 1000,
  KILOGRAM: 1,
  GRAM: 0.001,
  MILLIGRAM: 0.000001,
  MICROGRAM: 0.000000001,
  // Imperial / US
  LONG_TON: 1016.047,
  SHORT_TON: 907.1847,
  POUND: 0.453592,
  OUNCE: 0.0283495,
  // Precious metals
  TROY_OUNCE: 0.0311035,
  // Customs common
  QUINTAL: 100,
};

// ========== Volume (base: liters) ==========
const VOLUME: ConversionTable = {
  // Metric
  CUBIC_METER: 1000,
  LITER: 1,
  MILLILITER: 0.001,
  CUBIC_CENTIMETER: 0.001,
  // Imperial / US
  US_GALLON: 3.78541,
  UK_GALLON: 4.54609,
  US_QUART: 0.946353,
  US_PINT: 0.473176,
  US_CUP: 0.236588,
  US_FLUID_OUNCE: 0.0295735,
  US_TABLESPOON: 0.0147868,
  US_TEASPOON: 0.00492892,
  // Oil / Industrial
  BARREL_OIL: 158.987,
  BARREL_US: 119.24,
};

// ========== Area (base: square meters) ==========
const AREA: ConversionTable = {
  SQUARE_KILOMETER: 1e6,
  SQUARE_METER: 1,
  SQUARE_CENTIMETER: 0.0001,
  SQUARE_MILLIMETER: 0.000001,
  HECTARE: 10000,
  ACRE: 4046.8564224,
  SQUARE_MILE: 2.59e6,
  SQUARE_YARD: 0.836127,
  SQUARE_FOOT: 0.092903,
  SQUARE_INCH: 0.00064516,
};

// ========== Speed (base: meters per second) ==========
const SPEED: ConversionTable = {
  METER_PER_SECOND: 1,
  KILOMETER_PER_HOUR: 0.277778,
  MILE_PER_HOUR: 0.44704,
  KNOT: 0.514444,
  FOOT_PER_SECOND: 0.3048,
};

// ========== Pressure (base: pascals) ==========
const PRESSURE: ConversionTable = {
  PASCAL: 1,
  KILOPASCAL: 1000,
  MEGAPASCAL: 1e6,
  BAR: 100000,
  MILLIBAR: 100,
  ATMOSPHERE: 101325,
  PSI: 6894.76,
  MMHG: 133.322,
  TORR: 133.322,
};

// ========== Energy (base: joules) ==========
const ENERGY: ConversionTable = {
  JOULE: 1,
  KILOJOULE: 1000,
  MEGAJOULE: 1e6,
  CALORIE: 4.184,
  KILOCALORIE: 4184,
  WATT_HOUR: 3600,
  KILOWATT_HOUR: 3.6e6,
  BTU: 1055.06,
  ELECTRONVOLT: 1.602e-19,
};

// ========== Power (base: watts) ==========
const POWER: ConversionTable = {
  WATT: 1,
  KILOWATT: 1000,
  MEGAWATT: 1e6,
  HORSEPOWER: 745.7,
  BTU_PER_HOUR: 0.293071,
};

// ========== Data storage (base: bytes) ==========
const DATA: ConversionTable = {
  BIT: 0.125,
  BYTE: 1,
  KILOBYTE: 1024,
  MEGABYTE: 1048576,
  GIGABYTE: 1073741824,
  TERABYTE: 1099511627776,
  PETABYTE: 1125899906842624,
};

// ========== Time (base: seconds) ==========
const TIME: ConversionTable = {
  NANOSECOND: 1e-9,
  MICROSECOND: 1e-6,
  MILLISECOND: 0.001,
  SECOND: 1,
  MINUTE: 60,
  HOUR: 3600,
  DAY: 86400,
  WEEK: 604800,
  MONTH: 2629746,
  YEAR: 31556952,
};

// ========== Fuel economy (base: km/L) ==========
const FUEL_ECONOMY: ConversionTable = {
  KM_PER_LITER: 1,
  MILES_PER_GALLON_US: 0.425144,
  MILES_PER_GALLON_UK: 0.354006,
  LITERS_PER_100KM: -1, // Special: inverse relationship
};

// ========== Angle (base: degrees) ==========
const ANGLE: ConversionTable = {
  DEGREE: 1,
  RADIAN: 57.2958,
  GRADIAN: 0.9,
  MINUTE_OF_ARC: 1 / 60,
  SECOND_OF_ARC: 1 / 3600,
  REVOLUTION: 360,
};

const CATEGORY_TABLES: Record<string, ConversionTable> = {
  LENGTH,
  WEIGHT,
  VOLUME,
  AREA,
  SPEED,
  PRESSURE,
  ENERGY,
  POWER,
  DATA,
  TIME,
  FUEL_ECONOMY,
  ANGLE,
};

// Temperature is special — not a simple ratio conversion
function convertTemperature(value: number, from: string, to: string): number {
  let celsius: number;

  switch (from) {
    case 'CELSIUS':
      celsius = value;
      break;
    case 'FAHRENHEIT':
      celsius = (value - 32) * (5 / 9);
      break;
    case 'KELVIN':
      celsius = value - 273.15;
      break;
    case 'RANKINE':
      celsius = (value - 491.67) * (5 / 9);
      break;
    default:
      throw new BadRequestException(`Unknown temperature unit: ${from}`);
  }

  switch (to) {
    case 'CELSIUS':
      return celsius;
    case 'FAHRENHEIT':
      return celsius * (9 / 5) + 32;
    case 'KELVIN':
      return celsius + 273.15;
    case 'RANKINE':
      return (celsius + 273.15) * (9 / 5);
    default:
      throw new BadRequestException(`Unknown temperature unit: ${to}`);
  }
}

const TEMPERATURE_UNITS = ['CELSIUS', 'FAHRENHEIT', 'KELVIN', 'RANKINE'];

export interface ConversionResult {
  category: string;
  fromUnit: string;
  toUnit: string;
  fromValue: number;
  toValue: number;
}

export interface ConvertAllResult {
  category: string;
  fromUnit: string;
  fromValue: number;
  conversions: Record<string, number>;
}

export interface CategoryInfo {
  category: string;
  units: string[];
}

@Injectable()
export class UnitConverterService {
  listCategories(): CategoryInfo[] {
    const categories: CategoryInfo[] = Object.entries(CATEGORY_TABLES).map(
      ([category, table]) => ({
        category,
        units: Object.keys(table),
      }),
    );

    categories.push({
      category: 'TEMPERATURE',
      units: TEMPERATURE_UNITS,
    });

    return categories.sort((a, b) => a.category.localeCompare(b.category));
  }

  getUnitsForCategory(category: string): string[] {
    const upper = category.toUpperCase();

    if (upper === 'TEMPERATURE') {
      return TEMPERATURE_UNITS;
    }

    const table = CATEGORY_TABLES[upper];
    if (!table) {
      throw new BadRequestException(`Unknown category: ${category}`);
    }

    return Object.keys(table);
  }

  convert(
    category: string,
    fromUnit: string,
    toUnit: string,
    value: number,
  ): ConversionResult {
    const upper = category.toUpperCase();
    const from = fromUnit.toUpperCase();
    const to = toUnit.toUpperCase();

    if (upper === 'TEMPERATURE') {
      const result = convertTemperature(value, from, to);
      return {
        category: upper,
        fromUnit: from,
        toUnit: to,
        fromValue: value,
        toValue: parseFloat(result.toPrecision(12)),
      };
    }

    // Special case: fuel economy with L/100km (inverse)
    if (upper === 'FUEL_ECONOMY') {
      const result = this.convertFuelEconomy(value, from, to);
      return {
        category: upper,
        fromUnit: from,
        toUnit: to,
        fromValue: value,
        toValue: parseFloat(result.toPrecision(12)),
      };
    }

    const table = CATEGORY_TABLES[upper];
    if (!table) {
      throw new BadRequestException(`Unknown category: ${category}`);
    }

    const fromFactor = table[from];
    const toFactor = table[to];

    if (fromFactor === undefined) {
      throw new BadRequestException(
        `Unknown unit "${fromUnit}" in category "${category}"`,
      );
    }
    if (toFactor === undefined) {
      throw new BadRequestException(
        `Unknown unit "${toUnit}" in category "${category}"`,
      );
    }

    const baseValue = value * fromFactor;
    const result = baseValue / toFactor;

    return {
      category: upper,
      fromUnit: from,
      toUnit: to,
      fromValue: value,
      toValue: parseFloat(result.toPrecision(12)),
    };
  }

  convertAll(
    category: string,
    fromUnit: string,
    value: number,
  ): ConvertAllResult {
    const upper = category.toUpperCase();
    const from = fromUnit.toUpperCase();

    const units = this.getUnitsForCategory(upper);
    const conversions: Record<string, number> = {};

    for (const unit of units) {
      if (unit === from) {
        conversions[unit] = value;
        continue;
      }
      const result = this.convert(upper, from, unit, value);
      conversions[unit] = result.toValue;
    }

    return {
      category: upper,
      fromUnit: from,
      fromValue: value,
      conversions,
    };
  }

  private convertFuelEconomy(value: number, from: string, to: string): number {
    const table = CATEGORY_TABLES['FUEL_ECONOMY'];

    // Convert to km/L first
    let kmPerLiter: number;
    if (from === 'LITERS_PER_100KM') {
      kmPerLiter = value === 0 ? 0 : 100 / value;
    } else {
      const factor = table[from];
      if (factor === undefined) {
        throw new BadRequestException(`Unknown fuel economy unit: ${from}`);
      }
      kmPerLiter = value * factor;
    }

    // Convert from km/L to target
    if (to === 'LITERS_PER_100KM') {
      return kmPerLiter === 0 ? 0 : 100 / kmPerLiter;
    }

    const toFactor = table[to];
    if (toFactor === undefined) {
      throw new BadRequestException(`Unknown fuel economy unit: ${to}`);
    }
    return kmPerLiter / toFactor;
  }
}
