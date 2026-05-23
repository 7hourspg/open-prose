import { useEffect, useReducer } from "react";

export type Step = "welcome" | "template" | "basics" | "creating";

export type Draft = {
  template: string;
  name: string;
  author: string;
  url: string;
};

type State = { step: Step; draft: Draft };

type Action =
  | { type: "go"; step: Step }
  | { type: "patch"; draft: Partial<Draft> }
  | { type: "reset" };

const STORAGE_KEY = "openprose.welcome";

const initialState: State = {
  step: "welcome",
  draft: {
    template: "minimal",
    name: "",
    author: "",
    url: "",
  },
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "go":
      return { ...state, step: action.step };
    case "patch":
      return { ...state, draft: { ...state.draft, ...action.draft } };
    case "reset":
      return initialState;
  }
}

function readStored(): State | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<State>;
    if (!parsed.step || !parsed.draft) return null;
    return {
      step: parsed.step,
      draft: { ...initialState.draft, ...parsed.draft },
    };
  } catch {
    return null;
  }
}

export function useOnboarding() {
  const [state, dispatch] = useReducer(
    reducer,
    initialState,
    (init) => readStored() ?? init
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (state.step === "welcome" && state.draft.name === "" && state.draft.url === "" && state.draft.author === "") {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return {
    step: state.step,
    draft: state.draft,
    goTo: (step: Step) => dispatch({ type: "go", step }),
    patch: (draft: Partial<Draft>) => dispatch({ type: "patch", draft }),
    reset: () => {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(STORAGE_KEY);
      }
      dispatch({ type: "reset" });
    },
  };
}
