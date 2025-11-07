import { useRef, useState } from "react";

/** LayoutState — represents the current layout (the object we track and restore) */
class LayoutState<T> {
  private state: T;

  constructor(initialState: T) {
    // Deep clone to prevent mutation side-effects
    this.state = structuredClone(initialState);
  }

  /** Set the current layout state */
  setState(state: T) {
    this.state = structuredClone(state);
  }

  /** Get a deep copy of the current layout state */
  getState(): T {
    return structuredClone(this.state);
  }

  /** Create a snapshot (memento) of the current layout */
  saveToSnapshot(): LayoutSnapshot<T> {
    return new LayoutSnapshot(this.getState());
  }

  /** Restore this layout from a given snapshot */
  restoreFromSnapshot(snapshot: LayoutSnapshot<T>) {
    this.state = snapshot.getState();
  }
}

/** LayoutSnapshot — immutable snapshot of a layout at a specific point in time */
class LayoutSnapshot<T> {
  private readonly state: T;

  constructor(state: T) {
    this.state = structuredClone(state);
  }

  /** Return a deep copy of the stored layout state */
  getState(): T {
    return structuredClone(this.state);
  }
}

/** LayoutHistory — manages Undo/Redo stacks for layout changes */
class LayoutHistory<T> {
  private undoStack: LayoutSnapshot<T>[] = [];
  private redoStack: LayoutSnapshot<T>[] = [];
  private readonly MAX_HISTORY = 20; // optional limit

  /** Save the current layout before applying a new change */
  saveState(layout: LayoutState<T>) {
    this.undoStack.push(layout.saveToSnapshot());
    if (this.undoStack.length > this.MAX_HISTORY) {
      this.undoStack.shift();
    }
    this.redoStack = []; // Clear redo when a new action happens
  }

  /** Undo the latest change */
  undo(layout: LayoutState<T>): boolean {
    if (this.undoStack.length === 0) return false;
    const snapshot = this.undoStack.pop()!;
    this.redoStack.push(layout.saveToSnapshot()); // Save current for redo
    layout.restoreFromSnapshot(snapshot);
    return true;
  }

  /** Redo the most recently undone change */
  redo(layout: LayoutState<T>): boolean {
    if (this.redoStack.length === 0) return false;
    const snapshot = this.redoStack.pop()!;
    this.undoStack.push(layout.saveToSnapshot()); // Save current for undo
    layout.restoreFromSnapshot(snapshot);
    return true;
  }

  /** Optional helpers — for disabling undo/redo buttons */
  canUndo() {
    return this.undoStack.length > 0;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }
}

/** 🪄 useLayoutHistory — React hook for managing Undo/Redo in the layout */
export function useLayoutHistory<T>(initialState: T) {
  const layoutRef = useRef(new LayoutState(initialState));
  const historyRef = useRef(new LayoutHistory<T>());
  const [state, setState] = useState<T>(initialState);

  /** Save a new layout change (and push old one to history) */
  const save = (newState: T) => {
    const current = layoutRef.current.getState();

    // Avoid saving identical states
    if (JSON.stringify(current) === JSON.stringify(newState)) return;

    historyRef.current.saveState(layoutRef.current);
    layoutRef.current.setState(newState);
    setState(structuredClone(newState));
  };

  /** Undo the last layout change */
  const undo = () => {
    const changed = historyRef.current.undo(layoutRef.current);
      console.log("Undo called — changed:", changed);

    if (changed) {
      setState(layoutRef.current.getState());
    }
  };

  /** Redo the last undone layout change */
  const redo = () => {
    const changed = historyRef.current.redo(layoutRef.current);
      console.log("Redo called — changed:", changed);
    if (changed) {
      setState(layoutRef.current.getState());
    }
  };

  

  return {
    state,
    save,
    undo,
    redo,
    setState,
  };
}
