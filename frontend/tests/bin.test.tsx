import { describe, it, expect } from 'vitest';
import { addBin, removeBin, Room, Bin } from './testsUtils/binDoorUtils';

describe('Bin utilities', () => {
  const room: Room = { x: 0, y: 0, width: 100, height: 80 };

  it('add a new bin', () => {
    const bins: Bin[] = [];
    const result = addBin('Restavfall', room, bins);
    const newBin = result[0];

    expect(result.length).toBe(1);
    expect(newBin.name).toBe('Restavfall');
    expect(newBin.x).toBe(35); // 100/2 - 15
    expect(newBin.y).toBe(25); // 80/2 - 15
    expect(newBin.width).toBe(30);
    expect(newBin.height).toBe(30);
  });

  it('remove a bin by ID', () => {
    const bins: Bin[] = [
      { id: 1, name: 'Plast', x: 10, y: 10, width: 30, height: 30 },
      { id: 2, name: 'Papper', x: 20, y: 20, width: 30, height: 30 },
    ];

    const result = removeBin(1, bins);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(2);
    expect(result[0].name).toBe('Papper');
  });

  it('removing non-existing bin does not change the array', () => {
    const bins: Bin[] = [
      { id: 1, name: 'Plast', x: 10, y: 10, width: 30, height: 30 },
    ];

    const result = removeBin(99, bins);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(1);
  });
});