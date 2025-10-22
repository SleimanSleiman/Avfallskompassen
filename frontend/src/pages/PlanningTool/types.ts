/**
 * Types for the Planning Tool feature
 */

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

export type DoorTemplate = {
  id: number;
  name: string;
  width: number;
  height: number;
};

export type ContainerInRoom = {
  id: number;
  container: ContainerDTO;
  x: number;
  y: number;
  width: number;
  height: number;
  container: ContainerDTO;
};
