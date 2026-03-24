// Types
export interface TrajectoryPoint {
  lat: number;
  lng: number;
  timestamp: number;
  userId: string;
  speed?: number;
  heading?: number;
}

export interface TrajectoryDataset {
  id: string;
  name: string;
  points: TrajectoryPoint[];
  uploadedAt: Date;
  status: 'uploaded' | 'processing' | 'anonymized';
}

export interface PrivacyConfig {
  lDiversityValue: number;
  epsilonValue: number;
  noiseType: 'laplace' | 'gaussian';
  sensitivityValue: number;
}

export interface PrivacyMetrics {
  privacyLevel: number; // 0-100
  dataUtility: number; // 0-100
  processingTime: number; // ms
  pointsOriginal: number;
  pointsAnonymized: number;
  averageDisplacement: number; // meters
}

// Generate sample trajectory data
export function generateSampleTrajectory(numPoints: number = 100): TrajectoryPoint[] {
  const baseLat = 40.7128;
  const baseLng = -74.006;
  const points: TrajectoryPoint[] = [];
  
  let lat = baseLat;
  let lng = baseLng;
  
  for (let i = 0; i < numPoints; i++) {
    lat += (Math.random() - 0.5) * 0.002;
    lng += (Math.random() - 0.5) * 0.002;
    points.push({
      lat,
      lng,
      timestamp: Date.now() - (numPoints - i) * 60000,
      userId: `user_${Math.floor(Math.random() * 5) + 1}`,
      speed: Math.random() * 60 + 5,
      heading: Math.random() * 360,
    });
  }
  
  return points;
}

// Apply Laplace noise for differential privacy
function laplace(scale: number): number {
  const u = Math.random() - 0.5;
  return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
}

// Apply Gaussian noise
function gaussian(sigma: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return sigma * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// Apply differential privacy noise to trajectory
export function applyDifferentialPrivacy(
  points: TrajectoryPoint[],
  epsilon: number,
  sensitivity: number,
  noiseType: 'laplace' | 'gaussian'
): TrajectoryPoint[] {
  const scale = sensitivity / epsilon;
  
  return points.map(p => {
    const noiseFn = noiseType === 'laplace' ? laplace : gaussian;
    return {
      ...p,
      lat: p.lat + noiseFn(scale) * 0.0001,
      lng: p.lng + noiseFn(scale) * 0.0001,
      speed: p.speed ? Math.max(0, p.speed + noiseFn(scale) * 2) : undefined,
    };
  });
}

// Simple l-diversity: ensure each spatial cell has at least l different users
export function applyLDiversity(
  points: TrajectoryPoint[],
  lValue: number,
  gridSize: number = 0.005
): TrajectoryPoint[] {
  // Group points into grid cells
  const cells = new Map<string, TrajectoryPoint[]>();
  
  for (const p of points) {
    const cellKey = `${Math.floor(p.lat / gridSize)}_${Math.floor(p.lng / gridSize)}`;
    if (!cells.has(cellKey)) cells.set(cellKey, []);
    cells.get(cellKey)!.push(p);
  }
  
  const result: TrajectoryPoint[] = [];
  
  for (const [, cellPoints] of cells) {
    const uniqueUsers = new Set(cellPoints.map(p => p.userId));
    
    if (uniqueUsers.size >= lValue) {
      // Cell satisfies l-diversity, generalize to cell center
      const avgLat = cellPoints.reduce((s, p) => s + p.lat, 0) / cellPoints.length;
      const avgLng = cellPoints.reduce((s, p) => s + p.lng, 0) / cellPoints.length;
      
      result.push(...cellPoints.map(p => ({
        ...p,
        lat: avgLat + (Math.random() - 0.5) * gridSize * 0.3,
        lng: avgLng + (Math.random() - 0.5) * gridSize * 0.3,
        userId: `anon_${Math.floor(Math.random() * 1000)}`,
      })));
    }
    // Cells that don't meet l-diversity are suppressed (removed)
  }
  
  return result;
}

// Calculate displacement between original and anonymized points
export function calculateDisplacement(original: TrajectoryPoint[], anonymized: TrajectoryPoint[]): number {
  const count = Math.min(original.length, anonymized.length);
  if (count === 0) return 0;
  
  let totalDist = 0;
  for (let i = 0; i < count; i++) {
    const dlat = (original[i].lat - anonymized[i].lat) * 111320;
    const dlng = (original[i].lng - anonymized[i].lng) * 111320 * Math.cos(original[i].lat * Math.PI / 180);
    totalDist += Math.sqrt(dlat * dlat + dlng * dlng);
  }
  
  return totalDist / count;
}

// Parse CSV trajectory data
export function parseCSV(text: string): TrajectoryPoint[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  
  const header = lines[0].toLowerCase().split(',').map(h => h.trim());
  const latIdx = header.findIndex(h => h.includes('lat'));
  const lngIdx = header.findIndex(h => h.includes('lng') || h.includes('lon'));
  const timeIdx = header.findIndex(h => h.includes('time') || h.includes('date'));
  const userIdx = header.findIndex(h => h.includes('user') || h.includes('id'));
  
  if (latIdx === -1 || lngIdx === -1) return [];
  
  return lines.slice(1).map((line, i) => {
    const cols = line.split(',').map(c => c.trim());
    return {
      lat: parseFloat(cols[latIdx]),
      lng: parseFloat(cols[lngIdx]),
      timestamp: timeIdx !== -1 ? new Date(cols[timeIdx]).getTime() : Date.now() - i * 60000,
      userId: userIdx !== -1 ? cols[userIdx] : `user_${Math.floor(Math.random() * 5) + 1}`,
    };
  }).filter(p => !isNaN(p.lat) && !isNaN(p.lng));
}
