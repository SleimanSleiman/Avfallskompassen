import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import Toolbar from "../../../../../../src/pages/PlanningTool/RoomCanvas/components/Toolbar/Toolbar";

// Mocks for prompt components
vi.mock("../../../../../../src/components/prompts/RoomSizePrompt", () => ({
    default: () => <div data-testid="room-size-prompt" />,
}));

vi.mock("../../../../../../src/components/prompts/DoorWidthPrompt", () => ({
    default: () => <div data-testid="door-width-prompt" />,
}));

vi.mock("../../../../../../src/components/prompts/OtherObjectSizePrompt", () => ({
    default: () => <div data-testid="other-object-size-prompt" />,
}));


vi.mock("./ContainerInfo", () => ({
    default: ({ onClose }: any) => (
        <div data-testid="container-info">
            <button data-testid="close" onClick={onClose} />
        </div>
    ),
}));


describe("Toolbar component", () => {
    const toggleContainerPanel = vi.fn();
    const handleAddDoor = vi.fn().mockReturnValue(true);
    const handleSelectContainer = vi.fn();
    const handleSelectDoor = vi.fn();
    const setRoom = vi.fn();
    const saveRoom = vi.fn();
    const setMsg = vi.fn();
    const setError = vi.fn();
    const undo = vi.fn();
    const redo = vi.fn();
    const setSelectedContainerInfo = vi.fn();
    const generateThumbnail = vi.fn().mockReturnValue("thumbdata");
    const handleAddOtherObject = vi.fn().mockReturnValue(true);


    const room = { id: 1, x: 0, y: 0, width: 100, height: 100 };

    it("renders main toolbar buttons", () => {
        const { getByText } = render(
            <Toolbar
                roomName="Room A"
                isContainerPanelOpen={false}
                toggleContainerPanel={toggleContainerPanel}
                handleAddDoor={handleAddDoor}
                handleSelectContainer={handleSelectContainer}
                handleSelectDoor={handleSelectDoor}
                room={room}
                setRoom={setRoom}
                saveRoom={saveRoom}
                doorsLength={1}
                setMsg={setMsg}
                setError={setError}
                undo={undo}
                redo={redo}
                selectedContainerInfo={null}
                setSelectedContainerInfo={setSelectedContainerInfo}
                generateThumbnail={generateThumbnail}
                handleAddOtherObject={handleAddOtherObject}
            />
        );

        expect(getByText("Ändra rumsdimensioner")).toBeTruthy();
        expect(getByText("Lägg till dörr")).toBeTruthy();
        expect(getByText("Lägg till sopkärl")).toBeTruthy();
        expect(getByText("Spara design")).toBeTruthy();
        expect(getByText("Ångra")).toBeTruthy();
        expect(getByText("Gör om")).toBeTruthy();
        expect(getByText("Lägg till övrigt föremål")).toBeTruthy();
    });

    it("calls handlers when buttons are clicked", async () => {
        const { getByText, getByRole, findByTestId } = render(
            <Toolbar
                roomName="Room A"
                isContainerPanelOpen={false}
                toggleContainerPanel={toggleContainerPanel}
                handleAddDoor={handleAddDoor}
                handleSelectContainer={handleSelectContainer}
                handleSelectDoor={handleSelectDoor}
                room={room}
                setRoom={setRoom}
                saveRoom={saveRoom}
                doorsLength={1}
                setMsg={setMsg}
                setError={setError}
                undo={undo}
                redo={redo}
                selectedContainerInfo={null}
                setSelectedContainerInfo={setSelectedContainerInfo}
                generateThumbnail={generateThumbnail}
                handleAddOtherObject={handleAddOtherObject}
            />
        );

        fireEvent.click(getByText("Lägg till dörr"));
        expect(handleAddDoor).not.toHaveBeenCalled();

        fireEvent.click(getByText("Lägg till sopkärl"));
        expect(toggleContainerPanel).toHaveBeenCalled();

        fireEvent.click(getByText("Ångra"));
        expect(undo).toHaveBeenCalled();

        fireEvent.click(getByText("Gör om"));
        expect(redo).toHaveBeenCalled();

        fireEvent.click(getByRole("button", { name: "Lägg till övrigt föremål" }));
        const prompt = await findByTestId("other-object-size-prompt");
        expect(prompt).toBeTruthy();
    });

    it("renders selected container info and can close it", () => {
        const { getByLabelText } = render(
            <Toolbar
                roomName="Room A"
                isContainerPanelOpen={false}
                toggleContainerPanel={toggleContainerPanel}
                handleAddDoor={handleAddDoor}
                handleSelectContainer={handleSelectContainer}
                handleSelectDoor={handleSelectDoor}
                room={room}
                setRoom={setRoom}
                saveRoom={saveRoom}
                doorsLength={1}
                setMsg={setMsg}
                setError={setError}
                undo={undo}
                redo={redo}
                selectedContainerInfo={{ id: 1 }}
                setSelectedContainerInfo={setSelectedContainerInfo}
                generateThumbnail={generateThumbnail}
                handleAddOtherObject={handleAddOtherObject}
            />
        );

        const closeBtn = getByLabelText("Stäng information");
        fireEvent.click(closeBtn);
        expect(setSelectedContainerInfo).toHaveBeenCalledWith(null);
    });
});
