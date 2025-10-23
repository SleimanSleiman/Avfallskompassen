import { describe, it, expect } from 'vitest';
import { addDoor, Room, Door } from './testsUtils/binDoorUtils';

describe('Door utilities', () => {
  const room: Room = { x: 0, y: 0, width: 100, height: 80 };

  it('add a new door', () => {
    const doors: Door[] = [];
    const doorType = { id: 1, name: 'Standarddörr', width: 20, height: 10 };

    const result = addDoor(doorType, room, doors);
    const newDoor = result[0];

    expect(result.length).toBe(1);
    expect(newDoor.name).toBe('Standarddörr');
    expect(newDoor.x).toBe(40); // 100/2 - 20/2
    expect(newDoor.y).toBe(80); // room bottom
    expect(newDoor.rotation).toBe(0);
  });

  it('add multiple doors', () => {
    const doors: Door[] = [];
    const doorType1 = { id: 1, name: 'Standarddörr', width: 20, height: 10 };
    const doorType2 = { id: 2, name: 'Dubbel dörr', width: 48, height: 10 };

    const result1 = addDoor(doorType1, room, doors);
    const result2 = addDoor(doorType2, room, result1);

    expect(result2.length).toBe(2);
    expect(result2[0].name).toBe('Standarddörr');
    expect(result2[1].name).toBe('Dubbel dörr');
  });
});