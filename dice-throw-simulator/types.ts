export interface DieProps {
  position: [number, number, number];
  isShaking: boolean;
  throwTrigger: number; // Increment to trigger a throw
  onRollComplete: (value: number) => void;
}

export interface TrayProps {
  width?: number;
  depth?: number;
  height?: number;
}