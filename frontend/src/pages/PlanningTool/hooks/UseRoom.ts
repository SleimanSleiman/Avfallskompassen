
import { useState } from "react";
import { SCALE, STAGE_WIDTH, STAGE_HEIGHT, MIN_WIDTH, MIN_HEIGHT, MARGIN, clamp, mmToPixels, ROOM_VERTICAL_OFFSET, ROOM_HORIZONTAL_OFFSET } from "../Constants";
import type { Room, ContainerInRoom, Door } from "../Types";
import type { ContainerDTO } from "../../../lib/Container";

export function useRoom() {
  const initialRoom = (() => {
    const saved = typeof window !== "undefined"
      ? (localStorage.getItem("enviormentRoomData") ?? localStorage.getItem("trashRoomData"))
      : null;

    const defaultWidthMeters = 5;
    const defaultHeightMeters = 5;

    const defaultX = (STAGE_WIDTH - defaultWidthMeters / SCALE) / 2 + ROOM_HORIZONTAL_OFFSET;
    const defaultY = (STAGE_HEIGHT - defaultHeightMeters / SCALE) / 2 + ROOM_VERTICAL_OFFSET;

    if (!saved) {
      return {
        id: undefined,
        x: defaultX,
        y: defaultY,
        width: defaultWidthMeters / SCALE,
        height: defaultHeightMeters / SCALE,
        doors: [] as Door[],
        containers: [] as ContainerInRoom[],
        propertyId: undefined,
        name: "",
      } as Room;
    }

    try {
      const parsed = JSON.parse(saved);

      const toMeters = (v?: number) => {
        if (typeof v !== "number" || !Number.isFinite(v) || v <= 0) return undefined;
        if (v > 100) return v / 1000;
        return v;
      };

      const parsedWidth = toMeters(parsed?.width) ?? toMeters(parsed?.length);
      const parsedHeight = toMeters(parsed?.height) ?? toMeters(parsed?.length) ?? parsedWidth;

      const widthMeters = parsedWidth ?? defaultWidthMeters;
      const heightMeters = parsedHeight ?? defaultHeightMeters;

      const maxWidthMeters = (STAGE_WIDTH - 2 * MARGIN) * SCALE;
      const maxHeightMeters = (STAGE_HEIGHT - 2 * MARGIN) * SCALE;

    
      if (widthMeters >= maxWidthMeters || heightMeters >= maxHeightMeters) {
        return {
          id: undefined,
          x: defaultX,
          y: defaultY,
          width: defaultWidthMeters / SCALE,
          height: defaultHeightMeters / SCALE,
          doors: [] as Door[],
          containers: [] as ContainerInRoom[],
          propertyId: undefined,
          name: "",
        } as Room;
      }

      const x = parsed?.x ?? defaultX;
      const y = parsed?.y ?? defaultY;

      const containers: ContainerInRoom[] = Array.isArray(parsed?.containers)
        ? parsed.containers.map((c: any, i: number) => {
            const dto = (c?.containerDTO ?? {}) as Partial<ContainerDTO>;
            const fallbackId = dto.id ?? c?.id ?? (Date.now() + i);

            const normalized: ContainerDTO = {
              id: fallbackId,
              name: dto.name ?? "Unknown",
              size: dto.size ?? 0,
              width: dto.width ?? 1000,
              depth: dto.depth ?? 1000,
              height: dto.height ?? 1000,
              imageFrontViewUrl: dto.imageFrontViewUrl ?? dto.imageTopViewUrl ?? "",
              imageTopViewUrl: dto.imageTopViewUrl ?? dto.imageFrontViewUrl ?? "",
              emptyingFrequencyPerYear: dto.emptyingFrequencyPerYear ?? 0,
              cost: dto.cost ?? 0,
              serviceTypeId: dto.serviceTypeId,
              serviceTypeName: dto.serviceTypeName,
            };

            return {
              id: fallbackId,
              x: (c?.x ?? 0),
              y: (c?.y ?? 0),
              width: mmToPixels(normalized.width),
              height: mmToPixels(normalized.depth),
              container: normalized,
              rotation: c?.angle ?? c?.rotation ?? 0,
            } as ContainerInRoom;
          })
        : [];

      const doors: Door[] = Array.isArray(parsed?.doors)
        ? parsed.doors.map((d: any, i: number) => ({
            id: d?.id ?? Date.now() + i,
            x: d?.x ?? 0,
            y: d?.y ?? 0,
            width: d?.width ?? 1.2,
            wall: (d?.wall as Door['wall']) ?? 'bottom',
            rotation: d?.rotation ?? d?.angle ?? 0,
            swingDirection: (d?.swingDirection as Door['swingDirection']) ?? 'inward',
          }))
        : [];

      return {
        id: parsed?.id ?? parsed?.wasteRoomId ?? undefined,
        x,
        y,
        width: widthMeters / SCALE,
        height: heightMeters / SCALE,
        doors,
        containers,
        propertyId: parsed?.property?.id ?? undefined,
        name: parsed?.name ?? "",
      } as Room;
    } catch (err) {
      console.warn("Failed to parse stored room data", err);
      return {
        id: undefined,
        x: defaultX,
        y: defaultY,
        width: defaultWidthMeters / SCALE,
        height: defaultHeightMeters / SCALE,
        doors: [] as Door[],
        containers: [] as ContainerInRoom[],
        propertyId: undefined,
        name: "",
      } as Room;
    }
  })();

  const [room, setRoom] = useState<Room>(initialRoom);

  const handleDragCorner = (index: number, pos: { x: number; y: number }) => {
    let { x, y, width, height } = room;

    switch (index) {
      case 0: {
        const newX = clamp(pos.x, MARGIN, x + width - MIN_WIDTH);
        const newY = clamp(pos.y, MARGIN, y + height - MIN_HEIGHT);
        width = x + width - newX;
        height = y + height - newY;
        x = newX;
        y = newY;
        break;
      }
      case 1: {
        const newTRX = clamp(pos.x, x + MIN_WIDTH, STAGE_WIDTH - MARGIN);
        const newTRY = clamp(pos.y, MARGIN, y + height - MIN_HEIGHT);
        width = newTRX - x;
        height = y + height - newTRY;
        y = newTRY;
        break;
      }
      case 2: {
        const newBRX = clamp(pos.x, x + MIN_WIDTH, STAGE_WIDTH - MARGIN);
        const newBRY = clamp(pos.y, y + MIN_HEIGHT, STAGE_HEIGHT - MARGIN);
        width = newBRX - x;
        height = newBRY - y;
        break;
      }
      case 3: {
        const newBLX = clamp(pos.x, MARGIN, x + width - MIN_WIDTH);
        const newBLY = clamp(pos.y, y + MIN_HEIGHT, STAGE_HEIGHT - MARGIN);
        width = x + width - newBLX;
        height = newBLY - y;
        x = newBLX;
        break;
      }
    }

    setRoom(prev => ({ ...prev, x, y, width, height }));
  };

  const corners = [
    { x: room.x, y: room.y },
    { x: room.x + room.width, y: room.y },
    { x: room.x + room.width, y: room.y + room.height },
    { x: room.x, y: room.y + room.height },
  ];

  return { room, setRoom, corners, handleDragCorner };
}
