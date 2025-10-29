import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DoorWidthPrompt from "../../src/components/DoorWidthPrompt";

//Tests for DoorWidthPrompt component
describe("DoorWidthPrompt", () => {
    //Test if all elements render correctly
    it("renders input and buttons", () => {
        render(<DoorWidthPrompt onConfirm={() => {}} onCancel={() => {}} />);

        //Check that title, input, and buttons are visible
        expect(screen.getByText(/Ange dörrens bredd/i)).toBeInTheDocument();
        expect(screen.getByRole("spinbutton")).toBeInTheDocument();
        expect(screen.getByText("Avbryt")).toBeInTheDocument();
        expect(screen.getByText("Bekräfta")).toBeInTheDocument();
    });

    //Test if onConfirm ois called with valid width
    it("calls onConfirm with valid width", () => {
        const onConfirm = vi.fn(); //Mock function
        render(<DoorWidthPrompt onConfirm={onConfirm} onCancel={() => {}} />);

        //Change input value and click confirm
        const input = screen.getByRole("spinbutton");
        fireEvent.change(input, { target: { value: "1.2" } });
        fireEvent.click(screen.getByText("Bekräfta"));

        //Check that onConfirm is called with correct number
        expect(onConfirm).toHaveBeenCalledWith(1.2);
    });

    //Test if alert is shown when the width is too small
     it("shows error if width is too small", () => {
        render(<DoorWidthPrompt onConfirm={() => {}} onCancel={() => {}} />);

        //Enter invalid value and click confirm
        const input = screen.getByRole("spinbutton");
        fireEvent.change(input, { target: { value: "0.2" } });
        fireEvent.click(screen.getByText("Bekräfta"));

        // Component now renders error inline instead of using window.alert
        expect(screen.getByText("Dörrens bredd måste vara minst 0.5 meter.")).toBeInTheDocument();
    });
});
