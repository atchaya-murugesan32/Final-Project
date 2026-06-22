import type { ComponentType } from 'react';

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type CafeMapProps = {
  cafes: any[];
  region: Region;
  permissionDenied?: boolean;
  onSelectCafe: (id: string) => void;
};

declare const CafeMap: ComponentType<CafeMapProps>;
export default CafeMap;
