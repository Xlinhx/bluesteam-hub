import { useState, useEffect } from 'react';
import { useRouter } from '../../../app/router';
import { ConceptId } from './ConceptTypes';
import { ConceptAPage } from './ConceptAPage';
import { ConceptBPage } from './ConceptBPage';
import { ConceptCPage } from './ConceptCPage';
import { LivingOceanLandingPage } from '../landing/LivingOceanLandingPage';

export function LandingPage() {
  const { currentPath, query } = useRouter();

  // Explicit concept override only when explicitly requested via path or query
  const getExplicitConcept = (): ConceptId | null => {
    if (currentPath === '/concept-b' || query.concept === 'b' || query.concept === 'concept-b') {
      return 'concept-b';
    }
    if (currentPath === '/concept-c' || query.concept === 'c' || query.concept === 'concept-c') {
      return 'concept-c';
    }
    if (currentPath === '/concept-a' || query.concept === 'a' || query.concept === 'concept-a') {
      return 'concept-a';
    }
    return null;
  };

  const [activeConcept, setActiveConcept] = useState<ConceptId | null>(getExplicitConcept);

  useEffect(() => {
    setActiveConcept(getExplicitConcept());
  }, [currentPath, query.concept]);

  // Default to BlueSTEAM v2 Living Ocean canonical 7-beat landing page
  if (!activeConcept) {
    return <LivingOceanLandingPage />;
  }

  return (
    <div className="relative min-h-screen">
      {/* Legacy Concept Render when explicitly requested */}
      <main className="w-full">
        {activeConcept === 'concept-a' && <ConceptAPage />}
        {activeConcept === 'concept-b' && <ConceptBPage />}
        {activeConcept === 'concept-c' && <ConceptCPage />}
      </main>
    </div>
  );
}
