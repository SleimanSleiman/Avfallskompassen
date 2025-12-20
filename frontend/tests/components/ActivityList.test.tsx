import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ActivityItem from "../../src/components/ActivityList";
import { ActivityList } from "../../src/components/ActivityList";

/* ──────────────── Test ActivityList ──────────────── */
vi.mock("./LoadingBar", () => ({
  default: ({ message }) => <div data-testid="loading-bar">{message}</div>,
}));

describe("ActivityList", () => {
  const mockActivities = [
    { details: "Activity 1", timeStamp: "2025-01-15T10:00:00Z" },
    { details: "Activity 2", timeStamp: "2025-01-15T11:00:00Z" },
  ];

  it("shows a loading bar when loading", () => {
    render(<ActivityList activities={[]} loading={true} />);

    expect(screen.getByText("Laddar aktiviteter…")).toBeInTheDocument();
  });

  it("renders activity items when not loading", () => {
    render(
      <ActivityList
        activities={mockActivities}
        loading={false}
      />
    );

    expect(screen.queryByTestId("loading-bar")).not.toBeInTheDocument();

    expect(screen.getByText("Activity 1")).toBeInTheDocument();
    expect(screen.getByText("Activity 2")).toBeInTheDocument();
  });

  it("assigns alternating colors", () => {
    const { container } = render(
      <ActivityList
        activities={mockActivities}
        loading={false}
      />
    );

    const dots = container.querySelectorAll("div.w-2.h-2");

    expect(dots[0].className).toContain("bg-nsr-accent");
    expect(dots[1].className).toContain("bg-nsr-teal");
  });
});

/* ──────────────── Test ActivityItem ──────────────── */
describe("ActivityItem", () => {
  it("renders the message", () => {
    render(
      <ActivityItem
        message="Test message"
        timestamp="2025-01-15T10:00:00Z"
        color="bg-red-500"
      />
    );

    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("renders a formatted timestamp", () => {
    render(
      <ActivityItem
        message="Hej"
        timestamp="2025-01-15T10:00:00Z"
        color="bg-blue-500"
      />
    );

    expect(screen.getByText(/15/i)).toBeInTheDocument();
  });

  it("applies the correct color class", () => {
    const { container } = render(
      <ActivityItem
        message="Hej"
        timestamp="2025-01-15T10:00:00Z"
        color="bg-green-500"
      />
    );

    const dot = container.querySelector("div.w-2.h-2");
    expect(dot.className).toContain("bg-green-500");
  });
});
