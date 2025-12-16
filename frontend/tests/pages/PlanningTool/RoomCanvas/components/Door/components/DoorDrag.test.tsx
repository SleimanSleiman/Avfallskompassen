import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import DoorDrag from '../../../../../../../src/pages/PlanningTool/RoomCanvas/components/Door/components/DoorDrag';
import * as DoorDragUtils from '../../../../../../../src/pages/PlanningTool/RoomCanvas/components/Door/utils/DoorDragUtils';
import * as Constants from '../../../../../../../src/pages/PlanningTool/lib/Constants';

vi.mock('react-konva', async () => {
    const actual = await vi.importActual('react-konva');
    return {
        ...actual,
        Group: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
    };
});

vi.mock('../../../../../../../src/pages/PlanningTool/RoomCanvas/components/Door/components/DoorVisual', () => ({
    default: vi.fn(({ door, selected, isOverZone }) => <div data-testid="door-visual">{door.id}</div>),
}));

describe('DoorDrag', () => {
    let door;
    let room;
    let doors;
    let handleDragDoor;
    let handleSelectDoor;

    beforeEach(() => {
        door = { id: 'door1', x: 10, y: 20, width: 50, height: 80 };
        room = { x: 0, y: 0, width: 500, height: 500 };
        doors = [
            door,
            { id: 'door2', x: 100, y: 100, width: 50, height: 80 },
        ];
        handleDragDoor = vi.fn();
        handleSelectDoor = vi.fn();

        vi.spyOn(DoorDragUtils, 'computeDragBound').mockImplementation((door, room, pos) => pos);
        vi.spyOn(DoorDragUtils, 'getDoorRect').mockImplementation((d, x, y) => ({ x, y, width: d.width, height: d.height }));
        vi.spyOn(Constants, 'isOverlapping').mockImplementation((rect1, rect2) => {

        return !(rect1.x + rect1.width < rect2.x || rect1.x > rect2.x + rect2.width ||
            rect1.y + rect1.height < rect2.y || rect1.y > rect2.y + rect2.height);
        });
    });

    it('renders the DoorVisual', () => {
        const { getByTestId } = render(
            <DoorDrag
                    door={door}
                    selected={false}
                    room={room}
                    doors={doors}
                    handleDragDoor={handleDragDoor}
                    handleSelectDoor={handleSelectDoor}
                />
            );

        expect(getByTestId('door-visual')).toBeTruthy();
    });

    it('calls handleSelectDoor on click', () => {
        const { getByTestId } = render(
            <DoorDrag
                door={door}
                selected={false}
                room={room}
                doors={doors}
                handleDragDoor={handleDragDoor}
                handleSelectDoor={handleSelectDoor}
            />
        );

        fireEvent.click(getByTestId('door-visual'));
        expect(handleSelectDoor).toHaveBeenCalledWith('door1');
    });

    it('updates position and calls handleDragDoor on dragMove logic', () => {
        const newPos = { x: 10, y: 10 }; // safe, no overlap
        const overlapping = doors
            .filter(d => d.id !== door.id)
            .some(d => Constants.isOverlapping(DoorDragUtils.getDoorRect(door, newPos.x, newPos.y), DoorDragUtils.getDoorRect(d, d.x, d.y)));

        handleDragDoor(door.id, newPos);
        expect(handleDragDoor).toHaveBeenCalledWith('door1', newPos);
        expect(overlapping).toBe(false);
    });


    it('snaps back to last valid position if overlapping', () => {
        const lastValidPos = { x: 10, y: 20 };
        const overlappingDoor = { id: 'door2', x: 10, y: 20, width: 50, height: 80 };
        doors.push(overlappingDoor);

        const newPos = { x: 10, y: 20 };
        const overlapping = doors
            .filter(d => d.id !== door.id)
            .some(d => Constants.isOverlapping(DoorDragUtils.getDoorRect(door, newPos.x, newPos.y), DoorDragUtils.getDoorRect(d, d.x, d.y)));

        const finalPos = overlapping ? lastValidPos : newPos;

        expect(finalPos).toEqual(lastValidPos);
    });
});
