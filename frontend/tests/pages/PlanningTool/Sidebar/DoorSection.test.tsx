import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import DoorSection from "../../../../src/pages/PlanningTool/Sidebar/DoorSection";

describe("DoorSection", () => {
    //Test that the main button renders
    it("renders the add door button", () => {
        render(<DoorSection handleAddDoor={() => {}} />);

        //Check if the button text exists in the DOM
        expect(screen.getByText("Lägg till ny dörr")).not.toBeNull();
    });

    //Test opening the door width prompt
    it("opens the DoorWidthPrompt when button is clicked", () => {
        render(<DoorSection handleAddDoor={() => {}} />);

        //Click the "Add door" button
        fireEvent.click(screen.getByText("Lägg till ny dörr"));

        //Expect the prompt to appear (check heading and input)
        expect(screen.getByText(/Ange dörrens bredd/i)).not.toBeNull();
        expect(screen.getByRole("spinbutton")).not.toBeNull();
    });

    //Test confirming a width
    it("calls handleAddDoor and closes prompt on confirm", () => {
        const handleAddDoor = vi.fn(() => true);
        render(<DoorSection handleAddDoor={handleAddDoor} />);

        //Open the prompt
        fireEvent.click(screen.getByText("Lägg till ny dörr"));

        //Find the input and change the value
        const input = screen.getByRole("spinbutton");
        fireEvent.change(input, { target: { value: "1.2" } });

        //Click the confirm button
        fireEvent.click(screen.getByText("Bekräfta"));

        //handleAddDoor should be called with the correct width
        expect(handleAddDoor).toHaveBeenCalledWith({ width: 1.2 });

        //Prompt should be removed from the DOM
        expect(screen.queryByText(/Ange dörrens bredd/i)).toBeNull();
    });

    //Test cancelling the prompt
    it("closes prompt when cancel is clicked", () => {
        render(<DoorSection handleAddDoor={() => {}} />);

        //Open the prompt
        fireEvent.click(screen.getByText("Lägg till ny dörr"));

        //Click the cancel button
        fireEvent.click(screen.getByText("Avbryt"));

        //Prompt should be removed from the DOM
        expect(screen.queryByText(/Ange dörrens bredd/i)).toBeNull();
    });

    //Test handling invalid width (too small)
    it("keeps prompt open if width is too small", () => {
        const handleAddDoor = vi.fn(() => false);
        render(<DoorSection handleAddDoor={handleAddDoor} />);

        fireEvent.click(screen.getByText("Lägg till ny dörr"));
        const input = screen.getByRole("spinbutton");
        fireEvent.change(input, { target: { value: 1 } });

        fireEvent.click(screen.getByText("Bekräfta"));

        expect(handleAddDoor).toHaveBeenCalledWith({ width: 1 });

        expect(screen.getByText(/Ange dörrens bredd/i)).toBeInTheDocument();
    });

});
