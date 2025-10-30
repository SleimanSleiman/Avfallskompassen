import { describe, it, expect, vi, beforeEach} from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import RoomSizePrompt from "../../src/components/RoomSizePrompt";

describe("RoomSizePrompt", () => {
  let onConfirm: ReturnType<typeof vi.fn>;
  let onCancel: ReturnType<typeof vi.fn>;
  let lengthInput: HTMLElement;
  let widthInput: HTMLElement;
  let confirmButton: HTMLElement;

  beforeEach(() => {
    onConfirm = vi.fn();
    onCancel = vi.fn();

    render(<RoomSizePrompt onConfirm={onConfirm} onCancel={onCancel} />);

    // Component placeholders contain the unit ("Längd (meter)") so use a partial/regex match
    lengthInput = screen.getByPlaceholderText(/Längd/i);
    widthInput = screen.getByPlaceholderText(/Bredd/i);
    confirmButton = screen.getByText("Bekräfta");
  });

  it("Works with valid inputs", () => {
    fireEvent.change(lengthInput, { target: { value: "5" } });
    fireEvent.change(widthInput, { target: { value: "6" } });
    fireEvent.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledWith(5, 6);
  });

  it("Works with min inputs", () => {
    fireEvent.change(lengthInput, { target: { value: "2.5" } });
    fireEvent.change(widthInput, { target: { value: "2.5" } });
    fireEvent.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledWith(2.5, 2.5);
  });

  it("Works with max inputs", () => {
    fireEvent.change(lengthInput, { target: { value: "9" } });
    fireEvent.change(widthInput, { target: { value: "12" } });
    fireEvent.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledWith(9, 12);
  });

  it("Shows error for length more than 9", () => {
    fireEvent.change(lengthInput, { target: { value: "10" } });
    fireEvent.change(widthInput, { target: { value: "6" } });
    fireEvent.click(confirmButton);

    // Component renders the error inline instead of using window.alert
    expect(screen.getByText('Rummets längd får inte överstiga 9 meter.')).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
  });

   it("Shows error for width greater than allowed", () => {
    fireEvent.change(lengthInput, { target: { value: "6" } });
    fireEvent.change(widthInput, { target: { value: "13" } });
    fireEvent.click(confirmButton);

    expect(screen.getByText('Rummets bredd får inte överstiga 12 meter.')).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("Shows error for invalid input", () => {
    fireEvent.change(lengthInput, { target: { value: "hej" } });
    fireEvent.change(widthInput, { target: { value: "halloj" } });
    fireEvent.click(confirmButton);

    expect(screen.getByText('Rummets längd och bredd måste vara minst 2.5 meter.')).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("Shows error for length and width less than 2.5", () => {
    fireEvent.change(lengthInput, { target: { value: "2.4" } });
    fireEvent.change(widthInput, { target: { value: "2.4" } });
    fireEvent.click(confirmButton);

    expect(screen.getByText('Rummets längd och bredd måste vara minst 2.5 meter.')).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
  });

});