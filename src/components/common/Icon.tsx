/**
 * Vector icons rebuilt from the design's inline SVGs (react-native-svg).
 * Same 24×24 viewBox and paths as Phone.dc.html so the app matches pixel-for-pixel.
 */
import Svg, { Circle, Line, Path, Polygon, Rect } from 'react-native-svg';

export type IconName =
  | 'search'
  | 'mic'
  | 'locate'
  | 'layers'
  | 'compass'
  | 'maneuver'
  | 'alert'
  | 'arrow-right'
  | 'phone'
  | 'bookmark'
  | 'route';

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 20, color = '#000', strokeWidth = 2 }: Props) {
  const common = { width: size, height: size, viewBox: '0 0 24 24' };
  const stroke = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };

  switch (name) {
    case 'search':
      return (
        <Svg {...common}>
          <Circle cx={11} cy={11} r={7} {...stroke} />
          <Line x1={16.5} y1={16.5} x2={21} y2={21} {...stroke} />
        </Svg>
      );
    case 'mic':
      return (
        <Svg {...common}>
          <Rect x={9} y={3} width={6} height={11} rx={3} fill={color} />
          <Path d="M6 11 a6 6 0 0 0 12 0" {...stroke} />
          <Line x1={12} y1={17} x2={12} y2={21} {...stroke} />
        </Svg>
      );
    case 'locate':
      return (
        <Svg {...common}>
          <Circle cx={12} cy={12} r={4} {...stroke} />
          <Line x1={12} y1={2} x2={12} y2={6} {...stroke} />
          <Line x1={12} y1={18} x2={12} y2={22} {...stroke} />
          <Line x1={2} y1={12} x2={6} y2={12} {...stroke} />
          <Line x1={18} y1={12} x2={22} y2={12} {...stroke} />
        </Svg>
      );
    case 'layers':
      return (
        <Svg {...common}>
          <Path d="M12 3 L21 8 L12 13 L3 8 Z" {...stroke} />
          <Path d="M4 12 L12 16.5 L20 12" {...stroke} />
        </Svg>
      );
    case 'compass':
      return (
        <Svg {...common}>
          <Circle cx={12} cy={12} r={9} {...stroke} strokeWidth={1.6} />
          <Polygon points="12,6 14.5,12 12,18 9.5,12" fill={color} />
        </Svg>
      );
    case 'maneuver':
      return (
        <Svg {...common}>
          <Path d="M8 20 L8 12 Q8 8 12 8 L16 8" {...stroke} strokeWidth={3} />
          <Path d="M14 4 L20 8 L14 12 Z" fill={color} />
        </Svg>
      );
    case 'alert':
      return (
        <Svg {...common}>
          <Path d="M12 3 L22 20 L2 20 Z" {...stroke} strokeWidth={2.2} />
          <Line x1={12} y1={9} x2={12} y2={14} {...stroke} strokeWidth={2.2} />
          <Circle cx={12} cy={17} r={1.2} fill={color} />
        </Svg>
      );
    case 'arrow-right':
      return (
        <Svg {...common}>
          <Line x1={4} y1={12} x2={20} y2={12} {...stroke} />
          <Path d="M14 6 L20 12 L14 18" {...stroke} />
        </Svg>
      );
    case 'phone':
      return (
        <Svg {...common}>
          <Path
            d="M6 3 h3 l1.5 4 -2 1.5 a11 11 0 0 0 5 5 l1.5 -2 4 1.5 v3 a2 2 0 0 1 -2 2 A16 16 0 0 1 4 5 a2 2 0 0 1 2 -2 Z"
            {...stroke}
          />
        </Svg>
      );
    case 'bookmark':
      return (
        <Svg {...common}>
          <Path d="M6 3 h12 v18 l-6 -4 -6 4 Z" {...stroke} />
        </Svg>
      );
    case 'route':
      return (
        <Svg {...common}>
          <Circle cx={6} cy={19} r={2.4} {...stroke} />
          <Circle cx={18} cy={5} r={2.4} {...stroke} />
          <Path d="M6 16.5 V11 a4 4 0 0 1 4 -4 h4 a4 4 0 0 0 4 -4" {...stroke} />
        </Svg>
      );
    default:
      return null;
  }
}
