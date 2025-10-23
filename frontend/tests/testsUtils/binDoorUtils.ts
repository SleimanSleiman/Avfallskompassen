export type Room = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Door = {
  id: number;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  rotation: number;
};

export type Bin = {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Adds a new door centered along the bottom edge of the room.
 */
export function addDoor(
  doorType: { id: number; name: string; width: number; height: number },
  room: Room,
  doors: Door[]
): Door[] {
  const newDoor: Door = {
    id: Date.now(),
    name: doorType.name,
    width: doorType.width,
    height: doorType.height,
    x: room.x + room.width / 2 - doorType.width / 2,
    y: room.y + room.height,
    rotation: 0,
  };
  return [...doors, newDoor];
}

/**
 * Adds a bin roughly in the center of the room.
 */
export function addBin(binName: string, room: Room, bins: Bin[]): Bin[] {
  const newBin: Bin = {
    id: Date.now(),
    name: binName,
    x: room.x + room.width / 2 - 15,
    y: room.y + room.height / 2 - 15,
    width: 30,
    height: 30,
  };
  return [...bins, newBin];
}

/**
 * Removes a bin by its ID.
 */
export function removeBin(id: number, bins: Bin[]): Bin[] {
  return bins.filter((b) => b.id !== id);
}