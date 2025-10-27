import { describe, expect, it } from 'vitest';
import { renderDeviceBlazon, type Device } from '../device';
import type { Field } from '../field';

// Mocks
const mockField: Field = {
  name: 'plain',
  blazon: 'field blazon',
  variationCount: 1,
  pattern: '',
  commonality: 1,
  variations: [],
};
const mockChargeGroup = {
  charge: {
    name: 'lion',
    pluralName: 'lions',
    chargeType: 'regular',
    tincture: { name: 'or', hexColor: '#fff', pattern: '', type: 'metal' as const, category: 'light' as const, commonality: 1 },
    SVG: '<svg></svg>',
    tags: [] as string[],
  },
  numberOfCharges: 1,
  arrangement: {
    name: 'default',
    numberOfCharges: 1,
    blazonPattern: '{article} {name}',
    renderSVG: (svg: string, w: number, h: number) => svg
  }
};

describe('Device', () => {
  it('should render blazon with no charge groups', () => {
    const device: Device = {
      field: mockField,
      chargeGroups: [],
    };
    expect(renderDeviceBlazon(device)).toBe('field blazon');
  });

  it('should render blazon with one charge group', () => {
    const device: Device = {
      field: mockField,
      chargeGroups: [mockChargeGroup],
    };
    expect(renderDeviceBlazon(device)).toBe('field blazon, a lion or');
  });

  it('should render blazon with multiple charge groups', () => {
    const device: Device = {
      field: mockField,
      chargeGroups: [mockChargeGroup, mockChargeGroup],
    };
    expect(renderDeviceBlazon(device)).toBe('field blazon, a lion or and a lion or');
  });
});
