# Adult aquatic animal avatars

The 20 transparent WebP portraits were generated with built-in imagegen on 2026-11-08. The learner atlas served as the style and species reference. Each portrait was extracted from the generated atlas and centered on a 320 × 320 canvas with room inside a circular frame. The filenames follow the persisted keys in `packages/contracts/src/avatars.ts`.

## Generation prompt

```text
Create one production sprite atlas of twenty DISTINCT adult aquatic animal avatars for the TEACHER role of an ocean education app. The attached student avatar atlas is a reference only for the shared softly lit, smoothly sculpted premium 3D clay character family, color cues, species and ordering. Create fresh art of the same species as mature adult animals. Preserve friendly approachable expressions. Mature anatomy matters: smaller proportional eyes, no blush, natural adult body proportions and markings, more composed expressions and gentle confidence, with polished soft studio lighting. Their poses are three-quarter natural poses, their colors gently saturated, silhouettes distinctive. Think adult characters in the same animated film as the children in the reference. No clothing, human accessories, text, shadows on the floor, platforms, painted circles, scenery, grid lines, or decorative objects.

EXACTLY 4 columns × 5 rows, equal square cells, image portrait 4:5. Exactly one separate animal in each of 20 cells. Center each full animal within its cell. Aim for 74% of its cell's width or height, with true transparent clear gutters separating the silhouettes and no visible pixels crossing cell boundaries. Transparent background, all parts of each animal intact. Clear small-size silhouettes and uniform scale. Read order:
Row 1: green adult sea turtle with olive shell and long flippers; red adult shore crab with two pincers and realistic stalk eyes; adult orange-white clownfish with three clear black-edged white bands; orange adult five-armed sea star with delicate texture and minimal face.
Row 2: blue-gray adult bottlenose dolphin with long rostrum and curved dorsal fin; purple adult octopus with eight curled tentacles; amber adult seahorse with long snout and curled tail; translucent pink lavender adult moon jellyfish with bell and delicate compact tentacles.
Row 3: slate blue adult reef shark with two-tone body, gill slits and pointed dorsal fin; deep blue adult humpback whale with white throat pleats and long pectoral fins; adult silver harbor seal with mottling and whiskers; dark brown adult sea otter with pale muzzle, rounded ears and paws.
Row 4: adult blue-spotted stingray with diamond body and slender tail; adult ochre pufferfish with a round spiny body and fins; coral-pink adult shrimp with curved segmented body, rostrum and neatly curling antennae; adult lavender squid with pointed elongated mantle and distinct short arms.
Row 5: adult mallard duck with green head, yellow bill, white neck ring and brown breast; adult emperor penguin with black back and golden neck markings; adult green frog with broad head, webbed feet and calm eyes; adult olive crocodile with elongated snout, ridged back and tail.
Finish with genuinely transparent surrounding pixels, separated silhouettes, and no lettering.
```
