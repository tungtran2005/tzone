export type FinderDropdownKey =
  | 'os'
  | 'chipset'
  | 'cpu'
  | 'gpu'
  | 'memory'
  | 'display_size'
  | 'battery'
  | 'nfc';

// Keep options generic so users can filter by common terms across many devices.
export const finderDropdownOptions: Record<FinderDropdownKey, string[]> = {
  os: ['Android', 'iOS', 'HarmonyOS', 'KaiOS', 'watchOS'],
  chipset: ['Snapdragon', 'Dimensity', 'Exynos', 'Apple', 'Kirin', 'Unisoc'],
  cpu: ['Octa-core', 'Hexa-core', 'Quad-core', 'Dual-core'],
  gpu: ['Adreno', 'Mali', 'Apple GPU', 'PowerVR', 'Immortalis'],
  memory: ['4GB RAM', '6GB RAM', '8GB RAM', '12GB RAM', '16GB RAM'],
  display_size: ['6.1 inches', '6.5 inches', '6.67 inches', '6.7 inches', '6.8 inches', '6.78 inches'],
  battery: ['4000 mAh', '5000 mAh', '6000 mAh', '7000 mAh'],
  nfc: ['Yes', 'No'],
};
