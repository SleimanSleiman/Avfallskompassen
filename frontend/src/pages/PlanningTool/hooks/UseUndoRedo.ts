import { useRef, useState } from "react";

/**Originator — the object whose state we want to save and restore */
class Originator<T> {
  private state: T;

  constructor(initialState: T) {
    // Create a deep copy of the initial state to avoid reference issues
    this.state = structuredClone(initialState);
  }

  /** Set the current state (creates a deep copy) */
  setState(state: T) {
    this.state = structuredClone(state);
  }

  /** Get a deep-cloned version of the current state */
  getState(): T {
    return structuredClone(this.state);
  }

  /** Create a memento (snapshot) representing the current state */
  saveToMemento(): Memento<T> {
    return new Memento(this.getState());
  }

  /** Restore this originator's state from a given memento */
  restoreFromMemento(memento: Memento<T>) {
    this.state = memento.getState();
  }
}

/**Memento — represents a snapshot of a specific state */
class Memento<T> {
  private readonly state: T;

  constructor(state: T) {
    // Store a deep copy of the state to ensure immutability
    this.state = structuredClone(state);
  }

  /** Return a deep copy of the stored state */
  getState(): T {
    return structuredClone(this.state);
  }
}

/**Caretaker — manages Undo/Redo stacks (history management) */
class Caretaker<T> {
  private undoStack: Memento<T>[] = [];
  private redoStack: Memento<T>[] = [];

  /** Save a new state to the undo stack and clear the redo stack */
  saveState(originator: Originator<T>) {
    this.undoStack.push(originator.saveToMemento());
    this.redoStack = []; // Clear redo history when a new action occurs
  }

  /** Undo the most recent action */
  undo(originator: Originator<T>): boolean {
    if (this.undoStack.length === 0) return false;
    const memento = this.undoStack.pop()!;
    this.redoStack.push(originator.saveToMemento()); // Save current before undo
    originator.restoreFromMemento(memento);
    return true;
  }

  /** Redo the most recently undone action */
  redo(originator: Originator<T>): boolean {
    if (this.redoStack.length === 0) return false;
    const memento = this.redoStack.pop()!;
    this.undoStack.push(originator.saveToMemento()); // Save current before redo
    originator.restoreFromMemento(memento);
    return true;
  }
}

export function useUndoRedo<T>(initialState: T) {

  const originatorRef = useRef(new Originator(initialState));
  const caretakerRef = useRef(new Caretaker<T>());
  const [state, setState] = useState<T>(initialState);

  /** Update the state and save it into Undo history */
  const save = (newState: T) => {
    originatorRef.current.setState(newState);
    caretakerRef.current.saveState(originatorRef.current);
    setState(structuredClone(newState)); // Trigger React re-render
  };

  /** Undo the latest action */
  const undo = () => {
    const changed = caretakerRef.current.undo(originatorRef.current);
    if (changed) setState(originatorRef.current.getState());
  };

  /** Redo the last undone action */
  const redo = () => {
    const changed = caretakerRef.current.redo(originatorRef.current);
    if (changed) setState(originatorRef.current.getState());
  };

  // Expose the current state and control functions
  return { state, save, undo, redo, setState };
}