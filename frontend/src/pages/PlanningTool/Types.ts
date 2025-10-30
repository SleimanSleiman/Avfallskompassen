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
    container: ContainerDTO;
    rotation: number;

};
