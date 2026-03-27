import { useEffect, useRef, useState } from 'react';
import { TrajectoryPoint, LOCATION_SENSITIVITY } from '@/lib/trajectoryUtils';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Layers, Flame } from 'lucide-react';

interface MapViewProps {
  originalData: TrajectoryPoint[];
  anonymizedData: TrajectoryPoint[];
}

export default function MapView({ originalData, anonymizedData }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [showOriginal, setShowOriginal] = useState(true);
  const [showAnonymized, setShowAnonymized] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const heatLayersRef = useRef<any[]>([]);

  useEffect(() => {
    import('leaflet').then((L) => {
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

  // Draw heatmap using canvas overlay
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current) return;

    // Remove old heat layers
    heatLayersRef.current.forEach(l => {
      try { mapInstanceRef.current.removeLayer(l); } catch {}
    });
    heatLayersRef.current = [];

    if (!showHeatmap) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;

      const createHeatCanvas = (points: TrajectoryPoint[], color: string, label: string) => {
        const HeatOverlay = L.Layer.extend({
          onAdd(map: any) {
            this._map = map;
            this._canvas = L.DomUtil.create('canvas', 'leaflet-heatmap-canvas');
            this._canvas.style.position = 'absolute';
            this._canvas.style.pointerEvents = 'none';
            const pane = map.getPane('overlayPane');
            pane.appendChild(this._canvas);
            map.on('moveend zoomend resize', this._draw, this);
            this._draw();
          },
          onRemove(map: any) {
            map.off('moveend zoomend resize', this._draw, this);
            if (this._canvas && this._canvas.parentNode) {
              this._canvas.parentNode.removeChild(this._canvas);
            }
          },
          _draw() {
            const map = this._map;
            const size = map.getSize();
            const canvas = this._canvas;
            canvas.width = size.x;
            canvas.height = size.y;
            const topLeft = map.containerPointToLayerPoint([0, 0]);
            L.DomUtil.setPosition(canvas, topLeft);

            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.clearRect(0, 0, size.x, size.y);

            const radius = 20;
            points.forEach(p => {
              const pt = map.latLngToContainerPoint([p.lat, p.lng]);
              const sensitivity = p.locationType ? LOCATION_SENSITIVITY[p.locationType] / 100 : 0.3;
              const intensity = 0.15 + sensitivity * 0.5;

              const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, radius);
              grad.addColorStop(0, color.replace(')', `, ${intensity})`).replace('rgb', 'rgba'));
              grad.addColorStop(1, color.replace(')', ', 0)').replace('rgb', 'rgba'));
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
              ctx.fillStyle = grad;
              ctx.fill();
            });
          },
        });
        return new HeatOverlay();
      };

      if (showOriginal && originalData.length > 0) {
        const layer = createHeatCanvas(originalData, 'rgb(34, 184, 207)', 'Original');
        layer.addTo(map);
        heatLayersRef.current.push(layer);
      }
      if (showAnonymized && anonymizedData.length > 0) {
        const layer = createHeatCanvas(anonymizedData, 'rgb(56, 217, 169)', 'Anonymized');
        layer.addTo(map);
        heatLayersRef.current.push(layer);
      }
    });
  }, [originalData, anonymizedData, showOriginal, showAnonymized, showHeatmap, leafletLoaded]);

  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      map.eachLayer((layer: any) => {
        if (!(layer instanceof L.TileLayer) && !heatLayersRef.current.includes(layer)) {
          map.removeLayer(layer);
        }
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
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all border ${
              showHeatmap ? 'bg-warning/20 text-warning border-warning/30' : 'bg-secondary text-muted-foreground border-border'
            }`}
          >
            <Flame className="w-3 h-3" />
            Heatmap
          </button>
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
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card rounded-lg p-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Original: {originalData.length} points</span>
          </div>
          <div className="glass-card rounded-lg p-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-xs text-muted-foreground">Anonymized: {anonymizedData.length} points</span>
          </div>
          <div className="glass-card rounded-lg p-3 flex items-center gap-2">
            <Flame className="w-3 h-3 text-warning" />
            <span className="text-xs text-muted-foreground">Heatmap: Density + Sensitivity</span>
          </div>
        </div>
      )}

      {hasData && showHeatmap && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-lg p-4">
          <h3 className="text-xs font-semibold mb-2 flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 text-warning" />
            Heatmap Legend — Sensitivity Zones
          </h3>
          <p className="text-[10px] text-muted-foreground mb-3">
            Brighter areas indicate higher location sensitivity (hospitals, homes). The heatmap intensity is weighted by the privacy risk of each location type.
          </p>
          <div className="flex gap-2 flex-wrap">
            {(['hospital', 'home', 'government', 'bank', 'office', 'park'] as const).map(type => (
              <div key={type} className="flex items-center gap-1.5 bg-muted/30 rounded px-2 py-1">
                <div className={`w-2 h-2 rounded-full ${
                  LOCATION_SENSITIVITY[type] >= 70 ? 'bg-destructive' :
                  LOCATION_SENSITIVITY[type] >= 40 ? 'bg-warning' : 'bg-accent'
                }`} />
                <span className="text-[10px] capitalize">{type}</span>
                <span className="text-[10px] text-muted-foreground font-mono">{LOCATION_SENSITIVITY[type]}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
