/**
 * Turns an OSRM maneuver into a short French instruction. Hand-rolled (rather
 * than pulling osrm-text-instructions into the Metro graph) so the bundle stays
 * clean and the phrasing is fully under our control.
 */
import type { Maneuver } from '@/state/types';

const DIR: Record<string, string> = {
  left: 'à gauche',
  right: 'à droite',
  'slight left': 'légèrement à gauche',
  'slight right': 'légèrement à droite',
  'sharp left': 'complètement à gauche',
  'sharp right': 'complètement à droite',
  straight: 'tout droit',
  uturn: 'demi-tour',
};

export function frenchInstruction(m: Maneuver, street: string): string {
  const on = street ? ` sur ${street}` : '';
  const dir = m.modifier ? DIR[m.modifier] ?? '' : '';

  switch (m.type) {
    case 'depart':
      return street ? `Départ sur ${street}` : 'Départ';
    case 'arrive':
      return 'Vous êtes arrivé à destination';
    case 'roundabout':
    case 'rotary':
      return street ? `Au rond-point, prenez ${street}` : 'Prenez le rond-point';
    case 'roundabout turn':
      return `Au rond-point, tournez ${dir || 'tout droit'}${on}`;
    case 'merge':
      return `Insérez-vous${dir ? ` ${dir}` : ''}${on}`;
    case 'on ramp':
      return `Prenez la bretelle${dir ? ` ${dir}` : ''}${on}`;
    case 'off ramp':
      return `Prenez la sortie${dir ? ` ${dir}` : ''}${on}`;
    case 'fork':
      return `À l'embranchement, tenez ${dir || 'votre voie'}${on}`;
    case 'end of road':
      return `Au bout de la route, tournez ${dir || 'tout droit'}${on}`;
    case 'continue':
      return m.modifier && m.modifier !== 'straight'
        ? `Continuez ${dir}${on}`
        : `Continuez tout droit${on}`;
    case 'new name':
      return `Continuez${on}`;
    case 'turn':
    default:
      if (!m.modifier || m.modifier === 'straight') return `Continuez tout droit${on}`;
      return `Tournez ${dir}${on}`;
  }
}
