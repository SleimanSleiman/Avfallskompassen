/**
 * DoorDragUtils Module
 * Computes constrained drag bounds for doors inside a room.
 */

import { clamp, SCALE } from "../../../../lib/Constants";

//Compute the nearest allowed position for a door within room bounds
export function computeDragBound(door, room, pos: { x: number; y: number }) {
    //Room edges
    const topY = room.y;
    const bottomY = room.y + room.height;
    const leftX = room.x;
    const rightX = room.x + room.width;

    //Distances to each wall
    const distances = {
        top: Math.abs(pos.y - topY),
        bottom: Math.abs(pos.y - bottomY),
        left: Math.abs(pos.x - leftX),
        right: Math.abs(pos.x - rightX),
    };

    //Walls the door can be attached to based on its current wall
    const allowedWalls = {
        top: ["top", "left", "right"],
        bottom: ["bottom", "left", "right"],
        left: ["left", "top", "bottom"],
        right: ["right", "top", "bottom"],
    }[door.wall];

    //Find closest allowed wall
    let minWall = allowedWalls[0];
    let minDist = distances[minWall];

    for (const w of allowedWalls) {
        if (distances[w] < minDist) {
            minDist = distances[w];
            minWall = w;
        }
    }

    let newX = pos.x;
    let newY = pos.y;

    //Snap position to closest wall and clamp to room edges
    if (minWall === "top") {
        newY = topY;
        newX = clamp(pos.x, leftX, rightX);
    } else if (minWall === "bottom") {
        newY = bottomY;
        newX = clamp(pos.x, leftX, rightX);
    } else if (minWall === "left") {
        newX = leftX;
        newY = clamp(pos.y, topY, bottomY);
    } else if (minWall === "right") {
        newX = rightX;
        newY = clamp(pos.y, topY, bottomY);
    }

    return { x: newX, y: newY };
}

//Get the rectangle representing the door's area to check for collisions
export function getDoorRect (door, x, y) {
   const w = door.wall === "top" || door.wall === "bottom" ? door.width / SCALE : 10;
   const h = door.wall === "left" || door.wall === "right" ? door.width / SCALE : 10;

   return { x, y, width: w, height: h };
}

// Get the rectangle representing the door's "zone" for object collision
export function getDoorZone(door, x, y) {
    const doorSize = door.width / SCALE;

    switch (door.wall) {
        case "top":
            return { x: x - doorSize, y: y, width: doorSize, height: doorSize };
        case "bottom":
            return { x: x, y: y - doorSize, width: doorSize, height: doorSize };
        case "left":
            return { x: x, y: y, width: doorSize, height: doorSize };
        case "right":
            return { x: x - doorSize, y: y - doorSize, width: doorSize, height: doorSize };
    }
}
