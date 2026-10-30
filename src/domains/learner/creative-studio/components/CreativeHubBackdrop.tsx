import {CreativeWaterlines} from '../../../../shared/ui/visuals/CreativeWaterlines';
const artwork = '/assets/creative/c02-reference';

/** The ocean and craft desk keep their own scale as the content grows. */
export function CreativeHubBackdrop() {
  return <div className="creative-hub-scene" aria-hidden="true"><CreativeWaterlines kind="hub"/>
    <div className="creative-hub-scene__wood" />
    <img className="creative-hub-scene__ocean" src={`${artwork}/ocean-header.webp`} alt="" />
    <img className="creative-hub-scene__edge creative-hub-scene__edge--left" src={`${artwork}/reef-left-edge.webp`} alt="" />
    <img className="creative-hub-scene__edge creative-hub-scene__edge--right" src={`${artwork}/reef-right-edge.webp`} alt="" />
  </div>;
}
