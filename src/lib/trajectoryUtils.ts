// Types
export type LocationType = 'office' | 'hospital' | 'home' | 'school' | 'shopping' | 'restaurant' | 'gym' | 'park' | 'bank' | 'government';

export const LOCATION_SENSITIVITY: Record<LocationType, number> = {
  hospital: 95,
  home: 90,
  government: 80,
  bank: 75,
  school: 65,
  gym: 50,
  restaurant: 40,
  shopping: 35,
  park: 25,
  office: 20,
};

export interface TrajectoryPoint {
  lat: number;
  lng: number;
  timestamp: number;
  userId: string;
  speed?: number;
  heading?: number;
  locationType?: LocationType;
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
  gridResolution: number;
  temporalRounding: number;
}

export interface PrivacyMetrics {
  privacyLevel: number;
  dataUtility: number;
  processingTime: number;
  pointsOriginal: number;
  pointsAnonymized: number;
  averageDisplacement: number;
  suppressionRate: number;
  informationLoss: number;
  reidentificationRisk: number;
  spatialDistortion: number;
  temporalConsistency: number;
  locationTypeDistribution: Record<LocationType, { original: number; anonymized: number; sensitivityScore: number }>;
  privacyRiskByType: { type: LocationType; risk: number; count: number }[];
  epsilonUsed: number;
  lValueUsed: number;
  noiseTypeUsed: 'laplace' | 'gaussian';
  kAnonymityEstimate: number;
  entropyLoss: number;
  clusterPreservation: number;
}

const LOCATION_TYPES: LocationType[] = ['office', 'hospital', 'home', 'school', 'shopping', 'restaurant', 'gym', 'park', 'bank', 'government'];

// Generate sample trajectory data
export function generateSampleTrajectory(numPoints: number = 750): TrajectoryPoint[] {
  const baseLat = 40.7128;
  const baseLng = -74.006;
  const points: TrajectoryPoint[] = [];
  const users = Array.from({ length: 8 }, (_, i) => `user_${i + 1}`);
  
  let lat = baseLat;
  let lng = baseLng;
  
  for (let i = 0; i < numPoints; i++) {
    lat += (Math.random() - 0.5) * 0.002;
    lng += (Math.random() - 0.5) * 0.002;
    
    const typeWeights: [LocationType, number][] = [
      ['office', 20], ['home', 18], ['shopping', 12], ['restaurant', 12],
      ['park', 10], ['hospital', 8], ['school', 7], ['gym', 5], ['bank', 4], ['government', 4],
    ];
    const totalWeight = typeWeights.reduce((s, [, w]) => s + w, 0);
    let r = Math.random() * totalWeight;
    let locationType: LocationType = 'office';
    for (const [type, weight] of typeWeights) {
      r -= weight;
      if (r <= 0) { locationType = type; break; }
    }

    points.push({
      lat,
      lng,
      timestamp: Date.now() - (numPoints - i) * 60000,
      userId: users[Math.floor(Math.random() * users.length)],
      speed: Math.random() * 60 + 5,
      heading: Math.random() * 360,
      locationType,
    });
  }
  
  return points;
}

function laplace(scale: number): number {
  const u = Math.random() - 0.5;
  return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
}

function gaussian(sigma: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return sigma * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export function applyDifferentialPrivacy(
  points: TrajectoryPoint[],
  epsilon: number,
  sensitivity: number,
  noiseType: 'laplace' | 'gaussian'
): TrajectoryPoint[] {
  const scale = sensitivity / epsilon;
  
  return points.map(p => {
    const noiseFn = noiseType === 'laplace' ? laplace : gaussian;
    const sensitivityMultiplier = p.locationType ? (LOCATION_SENSITIVITY[p.locationType] / 100) * 1.5 + 0.5 : 1;
    return {
      ...p,
      lat: p.lat + noiseFn(scale) * 0.0001 * sensitivityMultiplier,
      lng: p.lng + noiseFn(scale) * 0.0001 * sensitivityMultiplier,
      speed: p.speed ? Math.max(0, p.speed + noiseFn(scale) * 2) : undefined,
    };
  });
}

export function applyLDiversity(
  points: TrajectoryPoint[],
  lValue: number,
  gridSize: number = 0.005
): TrajectoryPoint[] {
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
      const avgLat = cellPoints.reduce((s, p) => s + p.lat, 0) / cellPoints.length;
      const avgLng = cellPoints.reduce((s, p) => s + p.lng, 0) / cellPoints.length;
      
      result.push(...cellPoints.map(p => ({
        ...p,
        lat: avgLat + (Math.random() - 0.5) * gridSize * 0.3,
        lng: avgLng + (Math.random() - 0.5) * gridSize * 0.3,
        userId: `anon_${Math.floor(Math.random() * 1000)}`,
      })));
    }
  }
  
  return result;
}

// Temporal rounding
export function applyTemporalRounding(points: TrajectoryPoint[], roundMinutes: number): TrajectoryPoint[] {
  const ms = roundMinutes * 60 * 1000;
  return points.map(p => ({
    ...p,
    timestamp: Math.round(p.timestamp / ms) * ms,
  }));
}

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

export function computeExtendedMetrics(
  original: TrajectoryPoint[],
  anonymized: TrajectoryPoint[],
  config: PrivacyConfig,
  processingTime: number,
): PrivacyMetrics {
  const displacement = calculateDisplacement(original, anonymized);
  const suppressionRate = Math.round((1 - anonymized.length / original.length) * 100);
  
  const privacyLevel = Math.min(100, Math.round(
    (1 / config.epsilonValue) * 30 + config.lDiversityValue * 12 + suppressionRate * 0.2
  ));
  const dataUtility = Math.max(0, Math.round(
    100 - displacement * 2 - (1 - anonymized.length / original.length) * 40
  ));

  const locationTypeDistribution = {} as PrivacyMetrics['locationTypeDistribution'];
  for (const type of LOCATION_TYPES) {
    const origCount = original.filter(p => p.locationType === type).length;
    const anonCount = anonymized.filter(p => p.locationType === type).length;
    locationTypeDistribution[type] = {
      original: origCount,
      anonymized: anonCount,
      sensitivityScore: LOCATION_SENSITIVITY[type],
    };
  }

  const privacyRiskByType = LOCATION_TYPES
    .map(type => {
      const origCount = original.filter(p => p.locationType === type).length;
      if (origCount === 0) return null;
      const anonCount = anonymized.filter(p => p.locationType === type).length;
      const retentionRate = anonCount / origCount;
      const risk = Math.round(LOCATION_SENSITIVITY[type] * retentionRate);
      return { type, risk, count: origCount };
    })
    .filter(Boolean) as PrivacyMetrics['privacyRiskByType'];

  const informationLoss = Math.round((1 - dataUtility / 100) * 100);
  const reidentificationRisk = Math.max(0, Math.min(100, Math.round(100 - privacyLevel * 0.9 - suppressionRate * 0.1)));
  const spatialDistortion = Math.round(displacement * 100) / 100;
  const temporalConsistency = Math.round(Math.max(0, 100 - displacement * 5));

  // New metrics
  const uniqueAnonUsers = new Set(anonymized.map(p => p.userId)).size;
  const kAnonymityEstimate = uniqueAnonUsers > 0 ? Math.round(anonymized.length / uniqueAnonUsers) : 0;
  const entropyLoss = Math.round(Math.max(0, Math.min(100, suppressionRate * 0.6 + displacement * 3)));
  const clusterPreservation = Math.round(Math.max(0, 100 - suppressionRate * 0.5 - displacement * 2));

  return {
    privacyLevel,
    dataUtility,
    processingTime,
    pointsOriginal: original.length,
    pointsAnonymized: anonymized.length,
    averageDisplacement: Math.round(displacement * 100) / 100,
    suppressionRate,
    informationLoss,
    reidentificationRisk,
    spatialDistortion,
    temporalConsistency,
    locationTypeDistribution,
    privacyRiskByType,
    epsilonUsed: config.epsilonValue,
    lValueUsed: config.lDiversityValue,
    noiseTypeUsed: config.noiseType,
    kAnonymityEstimate,
    entropyLoss,
    clusterPreservation,
  };
}

export function parseCSV(text: string): TrajectoryPoint[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  
  const header = lines[0].toLowerCase().split(',').map(h => h.trim());
  const latIdx = header.findIndex(h => h.includes('lat'));
  const lngIdx = header.findIndex(h => h.includes('lng') || h.includes('lon'));
  const timeIdx = header.findIndex(h => h.includes('time') || h.includes('date'));
  const userIdx = header.findIndex(h => h.includes('user') || h.includes('id'));
  const locIdx = header.findIndex(h => h.includes('location_type') || h.includes('loc_type') || h.includes('place'));
  
  if (latIdx === -1 || lngIdx === -1) return [];
  
  return lines.slice(1).map((line, i) => {
    const cols = line.split(',').map(c => c.trim());
    const rawLocType = locIdx !== -1 ? cols[locIdx]?.toLowerCase() : undefined;
    const locationType = rawLocType && LOCATION_TYPES.includes(rawLocType as LocationType)
      ? (rawLocType as LocationType)
      : undefined;

    return {
      lat: parseFloat(cols[latIdx]),
      lng: parseFloat(cols[lngIdx]),
      timestamp: timeIdx !== -1 ? new Date(cols[timeIdx]).getTime() : Date.now() - i * 60000,
      userId: userIdx !== -1 ? cols[userIdx] : `user_${Math.floor(Math.random() * 5) + 1}`,
      locationType,
    };
  }).filter(p => !isNaN(p.lat) && !isNaN(p.lng));
}
