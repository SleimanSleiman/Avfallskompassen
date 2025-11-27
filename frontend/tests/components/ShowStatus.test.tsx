import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Message from "../../src/components/ShowStatus";

describe("Message component", () => {
    it("renders a success message by default", () => {
    render(<Message message="Success!" />);
    const msg = screen.getByText("Success!");
    expect(msg).toBeInTheDocument();
    expect(msg).toHaveClass("rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 mb-4");
  });

  it("renders an error message when type is 'error'", () => {
    render(<Message message="Error!" type="error" />);
    const msg = screen.getByText("Error!");
    expect(msg).toBeInTheDocument();
    expect(msg).toHaveClass("rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 mb-4");
  });

  it("does not render when message is empty", () => {
  render(<Message message="" />);

  expect(document.querySelector(".rounded-lg.border-green-200")).not.toBeInTheDocument();
  expect(document.querySelector(".rounded-lg.border-red-200")).not.toBeInTheDocument();
});

  it("automatically hides the message after duration", async () => {
    vi.useFakeTimers();
    render(<Message message="Auto-hide" duration={1000} />);

    expect(screen.getByText("Auto-hide")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByText("Auto-hide")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("resets the timer when message changes", async () => {
    vi.useFakeTimers();
    const { rerender } = render(<Message message="First" duration={1000} />);
    
    expect(screen.getByText("First")).toBeInTheDocument();

    rerender(<Message message="Second" duration={1000} />);

    expect(screen.queryByText("First")).not.toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByText("Second")).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});