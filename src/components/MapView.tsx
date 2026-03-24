import { useEffect, useRef, useState } from 'react';
import { TrajectoryPoint } from '@/lib/trajectoryUtils';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Layers } from 'lucide-react';

interface MapViewProps {
  originalData: TrajectoryPoint[];
  anonymizedData: TrajectoryPoint[];
}

export default function MapView({ originalData, anonymizedData }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [showOriginal, setShowOriginal] = useState(true);
  const [showAnonymized, setShowAnonymized] = useState(true);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    // Dynamically import leaflet
    import('leaflet').then((L) => {
      // Fix default icon issue
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (!mapRef.current || mapInstanceRef.current) return;

      const center: [number, number] = originalData.length > 0
        ? [originalData[0].lat, originalData[0].lng]
        : [40.7128, -74.006];

      const map = L.map(mapRef.current).setView(center, 14);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      }).addTo(map);

      setLeafletLoaded(true);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      // Clear existing layers except tile layer
      map.eachLayer((layer: any) => {
        if (!(layer instanceof L.TileLayer)) map.removeLayer(layer);
      });

      if (showOriginal && originalData.length > 0) {
        const coords = originalData.map(p => [p.lat, p.lng] as [number, number]);
        L.polyline(coords, { color: '#22b8cf', weight: 2, opacity: 0.7 }).addTo(map);
        originalData.forEach(p => {
          L.circleMarker([p.lat, p.lng], {
            radius: 2.5,
            color: '#22b8cf',
            fillColor: '#22b8cf',
            fillOpacity: 0.6,
          }).addTo(map);
        });
      }

      if (showAnonymized && anonymizedData.length > 0) {
        const coords = anonymizedData.map(p => [p.lat, p.lng] as [number, number]);
        L.polyline(coords, { color: '#38d9a9', weight: 2, opacity: 0.7 }).addTo(map);
        anonymizedData.forEach(p => {
          L.circleMarker([p.lat, p.lng], {
            radius: 2.5,
            color: '#38d9a9',
            fillColor: '#38d9a9',
            fillOpacity: 0.6,
          }).addTo(map);
        });
      }

      if (originalData.length > 0) {
        const allPoints = [
          ...(showOriginal ? originalData : []),
          ...(showAnonymized ? anonymizedData : []),
        ];
        if (allPoints.length > 0) {
          const bounds = L.latLngBounds(allPoints.map(p => [p.lat, p.lng] as [number, number]));
          map.fitBounds(bounds, { padding: [30, 30] });
        }
      }
    });
  }, [originalData, anonymizedData, showOriginal, showAnonymized, leafletLoaded]);

  const hasData = originalData.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Map Visualization</h1>
          <p className="text-sm text-muted-foreground mt-1">Before & after anonymization comparison</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all border ${
              showOriginal ? 'bg-primary/20 text-primary border-primary/30' : 'bg-secondary text-muted-foreground border-border'
            }`}
          >
            {showOriginal ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            Original
          </button>
          <button
            onClick={() => setShowAnonymized(!showAnonymized)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all border ${
              showAnonymized ? 'bg-accent/20 text-accent border-accent/30' : 'bg-secondary text-muted-foreground border-border'
            }`}
          >
            {showAnonymized ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            Anonymized
          </button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden relative">
        {!hasData && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/80 backdrop-blur-sm">
            <div className="text-center">
              <Layers className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Upload and process data to see trajectories</p>
            </div>
          </div>
        )}
        <div ref={mapRef} className="w-full h-[500px]" />
      </motion.div>

      {hasData && (
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-lg p-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Original: {originalData.length} points</span>
          </div>
          <div className="glass-card rounded-lg p-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-xs text-muted-foreground">Anonymized: {anonymizedData.length} points</span>
          </div>
        </div>
      )}
    </div>
  );
}
