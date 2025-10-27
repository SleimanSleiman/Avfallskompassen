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

    lengthInput = screen.getByPlaceholderText("Längd");
    widthInput = screen.getByPlaceholderText("Bredd");
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
    fireEvent.change(lengthInput, { target: { value: "32" } });
    fireEvent.change(widthInput, { target: { value: "27" } });
    fireEvent.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledWith(32, 27);
  });

  it("Shows alert for length more than 32", () => {
    window.alert = vi.fn();

    fireEvent.change(lengthInput, { target: { value: "33" } });
    fireEvent.change(widthInput, { target: { value: "6" } });
    fireEvent.click(confirmButton);

    expect(window.alert).toHaveBeenCalledWith('Runnets längd får inte överstiga 32 meter.');
    expect(onConfirm).not.toHaveBeenCalled();
  });

   it("Shows alert for beadth more than 28", () => {
    window.alert = vi.fn();

    fireEvent.change(lengthInput, { target: { value: "6" } });
    fireEvent.change(widthInput, { target: { value: "28" } });
    fireEvent.click(confirmButton);

    expect(window.alert).toHaveBeenCalledWith('Rummets bredd får inte överstiga 27 meter.');
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("Shows alert for invalid input", () => {
    window.alert = vi.fn();

    fireEvent.change(lengthInput, { target: { value: "hej" } });
    fireEvent.change(widthInput, { target: { value: "halloj" } });
    fireEvent.click(confirmButton);

    expect(window.alert).toHaveBeenCalledWith('Rummets längd och bredd måste vara större än 2.5 meter.');
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("Shows alert for length and width less than 2.5", () => {
    window.alert = vi.fn();

    fireEvent.change(lengthInput, { target: { value: "2.4" } });
    fireEvent.change(widthInput, { target: { value: "2.4" } });
    fireEvent.click(confirmButton);

    expect(window.alert).toHaveBeenCalledWith('Rummets längd och bredd måste vara större än 2.5 meter.');
    expect(onConfirm).not.toHaveBeenCalled();
  });

});