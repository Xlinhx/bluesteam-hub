export interface DiscoveredSpecimen {
  id: string;
  name: string;
  category: 'sunlit' | 'twilight' | 'midnight' | 'abyssal' | 'geological';
  depthMeters?: number;
  iconKey: string;
  silhouetteSvg?: string;
  discoveredAt: number;
}

export interface UnitProgress {
  unitId: string;
  completedExperienceIds: string[];
  maxDepthReachedMeters: number;
  unlockedSpecimenIds: string[];
  lastExploredAt: number;
}

export interface StudentProgress {
  studentId: string;
  studentName: string;
  avatarIconKey: string;
  units: Record<string, UnitProgress>;
  discoveries: DiscoveredSpecimen[];
  totalSimulationsRun: number;
  totalObservationsMade: number;
}
