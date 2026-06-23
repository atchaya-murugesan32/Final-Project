import { ComponentType } from 'react';

type DetailMapProps = {
  latitude?: number | null;
  longitude?: number | null;
  name: string;
  address?: string;
  mapsUri?: string;
};

declare const DetailMap: ComponentType<DetailMapProps>;
export default DetailMap;
