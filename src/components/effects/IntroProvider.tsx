import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface IntroValue {
  readonly entered: boolean;
  readonly markEntered: () => void;
}

// Default entered so sections rendered outside the provider still animate in.
const IntroContext = createContext<IntroValue>({
  entered: true,
  markEntered: () => {},
});

export function IntroProvider({
  children,
}: Readonly<{ children: ReactNode }>): React.JSX.Element {
  const [entered, setEntered] = useState(false);
  const markEntered = useCallback(() => setEntered(true), []);
  const value = useMemo(
    () => ({ entered, markEntered }),
    [entered, markEntered],
  );

  return (
    <IntroContext.Provider value={value}>{children}</IntroContext.Provider>
  );
}

export function useHasEntered(): boolean {
  return useContext(IntroContext).entered;
}

export function useMarkEntered(): () => void {
  return useContext(IntroContext).markEntered;
}
