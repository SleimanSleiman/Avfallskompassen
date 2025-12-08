import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import OtherObjectSizePrompt from "../../src/components/OtherObjectSizePrompt";

describe("OtherObjectSizePrompt", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders prompt with inputs and buttons", () => {
        render(<OtherObjectSizePrompt onConfirm={onConfirm} onCancel={onCancel} />);

        expect(screen.getByPlaceholderText(/T.ex. skåp, brandsläckare/)).toBeTruthy();
        expect(screen.getByPlaceholderText(/Bredd/)).toBeTruthy();
        expect(screen.getByPlaceholderText(/Djup/)).toBeTruthy();
        expect(screen.getByText("Avbryt")).toBeTruthy();
        expect(screen.getByText("Bekräfta")).toBeTruthy();
    });

    it("calls onCancel when cancel button is clicked", () => {
        render(<OtherObjectSizePrompt onConfirm={onConfirm} onCancel={onCancel} />);
        fireEvent.click(screen.getByText("Avbryt"));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("shows error if name is empty", () => {
        render(<OtherObjectSizePrompt onConfirm={onConfirm} onCancel={onCancel} />);
        fireEvent.change(screen.getByPlaceholderText(/Bredd/), { target: { value: "50" } });
        fireEvent.change(screen.getByPlaceholderText(/Djup/), { target: { value: "50" } });
        fireEvent.click(screen.getByText("Bekräfta"));
        expect(screen.getByText(/Ange ett namn/)).toBeTruthy();
        expect(onConfirm).not.toHaveBeenCalled();
    });

    it("shows error if length or width are below minValue", () => {
        render(<OtherObjectSizePrompt onConfirm={onConfirm} onCancel={onCancel} minValue={30} />);
        fireEvent.change(screen.getByPlaceholderText(/T.ex. skåp/), { target: { value: "Skåp" } });
        fireEvent.change(screen.getByPlaceholderText(/Bredd/), { target: { value: "20" } });
        fireEvent.change(screen.getByPlaceholderText(/Djup/), { target: { value: "25" } });
        fireEvent.click(screen.getByText("Bekräfta"));
        expect(screen.getByText(/måste vara minst 30 cm/)).toBeTruthy();
        expect(onConfirm).not.toHaveBeenCalled();
    });

    it("shows error if length or width exceed maxLength/maxWidth", () => {
        render(
            <OtherObjectSizePrompt onConfirm={onConfirm} onCancel={onCancel} maxLength={100} maxWidth={100} />
        );
        fireEvent.change(screen.getByPlaceholderText(/T.ex. skåp/), { target: { value: "Skåp" } });
        fireEvent.change(screen.getByPlaceholderText(/Bredd/), { target: { value: "120" } });
        fireEvent.change(screen.getByPlaceholderText(/Djup/), { target: { value: "80" } });
        fireEvent.click(screen.getByText("Bekräfta"));
        expect(screen.getByText(/får inte överstiga 100 cm/)).toBeTruthy();
        expect(onConfirm).not.toHaveBeenCalled();
    });

    it("calls onConfirm with correct values if valid inputs", () => {
        render(<OtherObjectSizePrompt onConfirm={onConfirm} onCancel={onCancel} />);
        fireEvent.change(screen.getByPlaceholderText(/T.ex. skåp/), { target: { value: "Skåp" } });
        fireEvent.change(screen.getByPlaceholderText(/Bredd/), { target: { value: "50" } });
        fireEvent.change(screen.getByPlaceholderText(/Djup/), { target: { value: "60" } });
        fireEvent.click(screen.getByText("Bekräfta"));
        expect(onConfirm).toHaveBeenCalledWith("Skåp", 50, 60);
    });
});
