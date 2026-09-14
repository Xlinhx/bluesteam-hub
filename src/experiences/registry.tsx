import React from 'react';
import { Experience } from '../domain/experience/types';
import { WaterColumnSimulation } from './simulations/water-column/WaterColumnSimulation';
import { SedimentTerracesSimulation } from './simulations/sediment-terraces/SedimentTerracesSimulation';
import { VideoExperiencePlayer } from './video/VideoExperiencePlayer';
import { CreatureDepthChallenge } from './challenge/CreatureDepthChallenge';

export interface ExperienceRendererProps {
  experience: Experience;
  isTeacher?: boolean;
  isPresentation?: boolean;
  sessionId?: string;
  onComplete?: () => void;
  onPresentationRequest?: () => void;
}

export function renderExperience({
  experience,
  isTeacher = false,
  isPresentation = false,
  sessionId,
  onComplete,
  onPresentationRequest,
}: ExperienceRendererProps): React.ReactElement {
  // Dispatch based on experience.type and experience.slug
  if (experience.type === 'simulation') {
    if (experience.slug === 'water-column' || experience.id === 'exp-sim-water-column') {
      return (
        <WaterColumnSimulation
          initialDepth={(experience.runtimeConfig?.initialDepthMeters as number) || 150}
          isTeacher={isTeacher}
          isPresentation={isPresentation}
          sessionId={sessionId}
          onPresentationRequest={onPresentationRequest}
        />
      );
    }
    if (experience.slug === 'sediment-terraces' || experience.id === 'exp-sim-sediment-terraces') {
      return (
        <SedimentTerracesSimulation
          isTeacher={isTeacher}
          isPresentation={isPresentation}
          sessionId={sessionId}
          onPresentationRequest={onPresentationRequest}
        />
      );
    }
  }

  if (experience.type === 'video') {
    return (
      <VideoExperiencePlayer
        experience={experience}
        isPresentation={isPresentation}
        onComplete={onComplete}
        onPresentationRequest={onPresentationRequest}
      />
    );
  }

  if (experience.type === 'challenge') {
    return (
      <CreatureDepthChallenge
        isPresentation={isPresentation}
        onComplete={onComplete}
      />
    );
  }

  // Fallback explicit placeholder when experience renderer is not mapped
  return (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-[#12384B] text-[#F6F3EB] rounded-3xl text-center space-y-4 border border-white/10">
      <div className="w-16 h-16 rounded-full bg-[#17657A] flex items-center justify-center text-[#2EE6CA]">
        <span className="text-2xl font-bold">🌊</span>
      </div>
      <h3 className="text-xl font-bold">{experience.title}</h3>
      <p className="text-sm text-gray-300 max-w-md">{experience.summary}</p>
      <div className="px-4 py-2 rounded-full bg-white/10 text-xs text-[#2EE6CA] font-mono">
        Học liệu khoa học đang đồng bộ dữ liệu tương tác
      </div>
    </div>
  );
}
