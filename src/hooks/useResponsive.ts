import { useWindowDimensions } from 'react-native';

// Shortest side in dp. 600 is the long-standing Android "large screen"
// breakpoint and lands just above every phone in portrait, including the
// biggest foldables when unfolded is what you want to catch.
const TABLET_SHORT_SIDE = 600;

export type Responsive = {
  width: number;
  height: number;
  isTablet: boolean;
  /** Multiplier for type and spacing. */
  scale: number;
  /** Columns for the category grid. */
  columns: number;
  /** Caps line length so text doesn't stretch the full width of a tablet. */
  maxWidth: number;
};

export function useResponsive(): Responsive {
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= TABLET_SHORT_SIDE;

  return {
    width,
    height,
    isTablet,
    scale: isTablet ? 1.35 : 1,
    columns: isTablet ? 3 : 2,
    maxWidth: isTablet ? 760 : width,
  };
}
