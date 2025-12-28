/**
 * Types for the Planning Tool feature
 */

import type { ContainerDTO } from "../../../lib/Container";

export type Room = {
    id? : number;
    propertyId?: number;
    name? : string;
    x: number;
    y: number;
    width: number;
    height: number;
    doors?: Door[];
    containers?: ContainerInRoom[];
    otherObjects?: OtherObjectInRoom[];
};

export type Door = {
    id: number;
    width: number;
    x: number;
    y: number;
    rotation: number;
    wall: "top" | "bottom" | "left" | "right";
    swingDirection: "inward" | "outward";
};

export type ContainerInRoom = {
    id: number;
    container: ContainerDTO;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    lockILock: boolean;
};

export type OtherObjectInRoom = {
    id: number;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
};

export type Zone = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export type LayoutSnapshot = {
  room: Room;
  doors: Door[];
  containers: ContainerInRoom[];
  otherObjects: OtherObjectInRoom[];
};