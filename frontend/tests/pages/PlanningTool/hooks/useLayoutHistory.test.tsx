import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLayoutHistory } from "../../../../src/pages/PlanningTool/hooks/UseLayoutHistory";

describe("useLayoutHistory", () => {
  it("should initialize with initial state", () => {
    const { result } = renderHook(() => useLayoutHistory<number[]>([1, 2, 3]));
    expect(result.current.state).toEqual([1, 2, 3]);
  });

  it("should save new state and update history", () => {
    const { result } = renderHook(() => useLayoutHistory<number[]>([]));

    act(() => {
      result.current.save([1]);
      result.current.save([1, 2]);
      result.current.save([1, 2, 3]);
    });

    expect(result.current.state).toEqual([1, 2, 3]);
  });

  it("should undo state changes", () => {
    const { result } = renderHook(() => useLayoutHistory<number[]>([]));

    act(() => {
      result.current.save([1]);
      result.current.save([1, 2]);
      result.current.save([1, 2, 3]);
    });

    act(() => {
      result.current.undo();
    });
    expect(result.current.state).toEqual([1, 2]);

    act(() => {
      result.current.undo();
    });
    expect(result.current.state).toEqual([1]);

    act(() => {
      result.current.undo();
    });
    expect(result.current.state).toEqual([]); // fully undone
  });

  it("should redo undone state changes", () => {
    const { result } = renderHook(() => useLayoutHistory<number[]>([]));

    act(() => {
      result.current.save([1]);
      result.current.save([1, 2]);
      result.current.save([1, 2, 3]);
    });

    act(() => {
      result.current.undo();
      result.current.undo();
    });
    expect(result.current.state).toEqual([1]);

    act(() => {
      result.current.redo();
    });
    expect(result.current.state).toEqual([1, 2]);

    act(() => {
      result.current.redo();
    });
    expect(result.current.state).toEqual([1, 2, 3]);
  });

  it("should not crash when undo/redo called on empty stacks", () => {
    const { result } = renderHook(() => useLayoutHistory<number[]>([]));

    act(() => {
      result.current.undo(); // nothing to undo
      result.current.redo(); // nothing to redo
    });

    expect(result.current.state).toEqual([]);
  });

  it("should not save identical states repeatedly", () => {
    const { result } = renderHook(() => useLayoutHistory<number[]>([]));

    act(() => {
      result.current.save([1]);
      result.current.save([1]); // same state, should not duplicate
      result.current.save([1]); // same again
    });

    act(() => {
      result.current.undo(); // should go back to []
    });

    expect(result.current.state).toEqual([]);
  });
});