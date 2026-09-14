import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../themes/ThemeProvider';

interface WhaleHeroSceneProps {
  onLoaded?: () => void;
  reducedMotion?: boolean;
}

export function WhaleHeroScene({ onLoaded, reducedMotion = false }: WhaleHeroSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [hasWebGL, setHasWebGL] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
      if (!gl) {
        setHasWebGL(false);
        onLoaded?.();
        return;
      }
    } catch {
      setHasWebGL(false);
      onLoaded?.();
      return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const isEditorial = theme === 'editorial';

    // Deep oceanic pure water gradient background
    const bgBottom = isEditorial ? new THREE.Color('#041624') : new THREE.Color('#020d17');
    scene.background = bgBottom;
    scene.fog = new THREE.FogExp2(bgBottom.getHex(), 0.038);

    // Camera framed so typography has generous negative space on left (x < 0)
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0.2, 1.1, 8.8);
    camera.lookAt(0.2, -0.05, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // ==========================================
    // 1. Natural Ocean Lighting
    // ==========================================
    const ambientLight = new THREE.AmbientLight(
      isEditorial ? 0x1a4663 : 0x0f314c,
      isEditorial ? 2.2 : 1.8
    );
    scene.add(ambientLight);

    // Sunlight glancing down upon dorsal curve
    const sunbeam = new THREE.DirectionalLight(0x93c5fd, 3.4);
    sunbeam.position.set(5, 12, 5);
    scene.add(sunbeam);

    // Deep turquoise scatter bounce
    const deepBounce = new THREE.DirectionalLight(0x0d9488, 1.4);
    deepBounce.position.set(-3, -7, -3);
    scene.add(deepBounce);

    // Sharp rim light catching back ridges and fluke edge
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
    rimLight.position.set(-5, 7, -5);
    scene.add(rimLight);

    // ==========================================
    // 2. Anatomical Blue Whale Model (Positioned at right, tail receding into Z depth)
    // ==========================================
    const whaleGroup = new THREE.Group();
    // Position whale clearly in the right half, angled so tail recedes into background depth
    whaleGroup.position.set(2.8, -0.25, -0.8);
    whaleGroup.rotation.y = -0.3;
    scene.add(whaleGroup);

    // Procedural mottled skin canvas texture
    const skinCanvas = document.createElement('canvas');
    skinCanvas.width = 512;
    skinCanvas.height = 256;
    const sCtx = skinCanvas.getContext('2d');
    if (sCtx) {
      // Natural countershading: Slate indigo dorsal -> pale silvery cream ventral
      const grad = sCtx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, '#152b3c'); // Slate navy dorsal ridge
      grad.addColorStop(0.48, '#24485f'); // Mid flank
      grad.addColorStop(0.72, '#3b6279'); // Ventral border
      grad.addColorStop(1, '#688c9f'); // Paler belly pleats
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 512, 256);

      // Pale natural mottling spots
      sCtx.fillStyle = 'rgba(175, 210, 228, 0.22)';
      for (let i = 0; i < 280; i++) {
        const px = Math.random() * 512;
        const py = Math.random() * 256;
        const rad = 2 + Math.random() * 5;
        sCtx.beginPath();
        sCtx.arc(px, py, rad, 0, Math.PI * 2);
        sCtx.fill();
      }

      // Ventral throat pleat grooves (rorqual grooves)
      sCtx.strokeStyle = 'rgba(14, 30, 42, 0.38)';
      sCtx.lineWidth = 1.4;
      for (let y = 155; y < 248; y += 4) {
        sCtx.beginPath();
        sCtx.moveTo(35, y);
        sCtx.lineTo(360, y);
        sCtx.stroke();
      }
    }

    const skinTexture = new THREE.CanvasTexture(skinCanvas);
    skinTexture.wrapS = THREE.RepeatWrapping;
    skinTexture.wrapT = THREE.ClampToEdgeWrapping;

    const whaleMaterial = new THREE.MeshStandardMaterial({
      map: skinTexture,
      roughness: 0.3,
      metalness: 0.08,
      color: isEditorial ? 0xd6e5ee : 0xbdd4e4,
    });

    // Custom Anatomically Sculpted Torso Geometry with SEAMLESS BLUNT U-DOME ROSTRUM
    const lengthSegments = 40;
    const radialSegments = 24;

    const bodyGeometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= lengthSegments; i++) {
      const u = i / lengthSegments;

      let x = 0;
      let ry = 0;
      let rz = 0;
      let yOffset = 0;

      if (u < 0.22) {
        // Rostrum: Capped at apex (2.5, 0, 0).
        // Using Math.sqrt(t) ensures an infinite initial derivative at t=0,
        // forming a completely closed, blunt hemispherical U-shaped snout with zero open holes or sharp points!
        const t = u / 0.22;
        const profile = Math.sqrt(t); // Blunt dome curvature
        x = 2.5 - t * 1.5;
        rz = profile * 0.94; // Wide broad spatula
        ry = profile * 0.44 * (0.6 + 0.4 * t); // Flattened hydrodynamic jaw
        yOffset = -0.03 * (1 - t);
      } else if (u < 0.65) {
        // Thorax & Abdomen (Deep expandable belly)
        const t = (u - 0.22) / 0.43;
        x = 1.0 - t * 2.8;
        const expand = Math.sin(t * Math.PI);
        rz = 0.94 + expand * 0.16;
        ry = 0.44 + expand * 0.42; // Deep rorqual throat cavity
        yOffset = -expand * 0.12;
      } else {
        // Caudal Peduncle (Tapers and flattens laterally for vertical tail power)
        const t = (u - 0.65) / 0.35;
        x = -1.8 - t * 2.65; // Tapers down to fluke insertion at x = -4.45
        const taper = Math.cos(t * (Math.PI / 2));
        rz = 0.94 * taper * 0.26 + 0.04;
        ry = 0.44 * taper * 0.68 + 0.08; // Taller than wide
        yOffset = t * 0.04;
      }

      for (let j = 0; j <= radialSegments; j++) {
        const v = j / radialSegments;
        const theta = v * Math.PI * 2;

        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        const vx = x;
        const vy = sinT * ry + yOffset;
        const vz = cosT * rz;

        vertices.push(vx, vy, vz);
        uvs.push(u, v);

        const norm = new THREE.Vector3(0, sinT, cosT).normalize();
        normals.push(norm.x, norm.y, norm.z);
      }
    }

    for (let i = 0; i < lengthSegments; i++) {
      for (let j = 0; j < radialSegments; j++) {
        const a = i * (radialSegments + 1) + j;
        const b = (i + 1) * (radialSegments + 1) + j;
        const c = (i + 1) * (radialSegments + 1) + (j + 1);
        const d = i * (radialSegments + 1) + (j + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    bodyGeometry.setIndex(indices);
    bodyGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    bodyGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    bodyGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    bodyGeometry.computeVertexNormals();

    const bodyMesh = new THREE.Mesh(bodyGeometry, whaleMaterial);
    whaleGroup.add(bodyMesh);

    // Long Hydrodynamic Pectoral Flippers
    const flipperShape = new THREE.Shape();
    flipperShape.moveTo(0, 0);
    flipperShape.bezierCurveTo(0.35, 0.12, 1.7, -0.15, 2.2, -0.5);
    flipperShape.bezierCurveTo(1.7, -0.7, 0.55, -0.38, 0, -0.1);
    flipperShape.closePath();

    const flipperGeo = new THREE.ExtrudeGeometry(flipperShape, {
      depth: 0.045,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.015,
      bevelThickness: 0.015,
    });

    const leftFlipper = new THREE.Mesh(flipperGeo, whaleMaterial);
    leftFlipper.position.set(0.55, -0.32, 0.95);
    leftFlipper.rotation.set(0.22, 0.35, -0.65);
    whaleGroup.add(leftFlipper);

    const rightFlipper = new THREE.Mesh(flipperGeo, whaleMaterial);
    rightFlipper.position.set(0.55, -0.32, -0.95);
    rightFlipper.rotation.set(-0.22, -0.35, -0.65);
    rightFlipper.scale.set(1, 1, -1);
    whaleGroup.add(rightFlipper);

    // Wide Fluke (Horizontal tail lobes with median notch)
    const flukeShape = new THREE.Shape();
    flukeShape.moveTo(0, 0);
    flukeShape.bezierCurveTo(0.22, 0.65, 0.55, 1.45, 1.05, 1.75);
    flukeShape.bezierCurveTo(0.95, 1.0, 0.55, 0.25, 0.12, 0.03); // Left lobe trailing edge
    flukeShape.bezierCurveTo(0.55, -0.25, 0.95, -1.0, 1.05, -1.75);
    flukeShape.bezierCurveTo(0.55, -1.45, 0.22, -0.65, 0, 0);
    flukeShape.closePath();

    const flukeGeo = new THREE.ExtrudeGeometry(flukeShape, {
      depth: 0.035,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.015,
      bevelThickness: 0.015,
    });
    const flukeMesh = new THREE.Mesh(flukeGeo, whaleMaterial);
    flukeMesh.position.set(-4.45, 0.04, 0);
    flukeMesh.rotation.set(Math.PI / 2, 0, Math.PI / 2);
    whaleGroup.add(flukeMesh);

    // Small Falcate Dorsal Fin (Positioned far back at 3/4 length)
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.bezierCurveTo(-0.12, 0.12, -0.22, 0.24, -0.32, 0.24);
    finShape.bezierCurveTo(-0.35, 0.12, -0.4, 0.04, -0.5, 0);
    finShape.closePath();
    const finGeo = new THREE.ExtrudeGeometry(finShape, {
      depth: 0.025,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.01,
      bevelThickness: 0.01,
    });
    const finMesh = new THREE.Mesh(finGeo, whaleMaterial);
    finMesh.position.set(-2.4, 0.5, 0);
    whaleGroup.add(finMesh);

    // Natural Suspended Marine Snow Particulates
    const particleCount = 180;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 18;
      particlePositions[i + 1] = (Math.random() - 0.5) * 10;
      particlePositions[i + 2] = (Math.random() - 0.5) * 12;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.04,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    setIsLoaded(true);
    onLoaded?.();

    // ==========================================
    // 3. Animation Loop & Dynamic Perspective
    // ==========================================
    let animationFrameId: number;
    let isVisible = true;
    const clock = new THREE.Clock();

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      if (!reducedMotion) {
        // Natural Blue Whale Swimming cycle
        const swimCycle = elapsed * 0.95;
        const tailWave = Math.sin(swimCycle);
        const pitchUndulation = Math.cos(swimCycle * 0.5) * 0.03;

        // Fluke movement with phase delay
        flukeMesh.rotation.y = tailWave * 0.36;
        flukeMesh.position.y = 0.04 + Math.sin(swimCycle - 1.3) * 0.16;

        // Pectoral flippers stabilization
        leftFlipper.rotation.z = -0.65 + tailWave * 0.05;
        rightFlipper.rotation.z = -0.65 - tailWave * 0.05;

        // Whale group positioned on right; tail recedes into negative Z depth
        whaleGroup.position.x = 2.8;
        whaleGroup.position.y = -0.25 + Math.sin(elapsed * 0.5) * 0.1;
        whaleGroup.position.z = -0.8;

        whaleGroup.rotation.y = -0.3 + Math.sin(elapsed * 0.25) * 0.02;
        whaleGroup.rotation.z = 0.035 + pitchUndulation;
        whaleGroup.rotation.x = Math.sin(elapsed * 0.3) * 0.02;

        // Very subtle camera breathing
        camera.position.x = 0.2 + Math.sin(elapsed * 0.1) * 0.12;
        camera.position.y = 1.1 + Math.cos(elapsed * 0.14) * 0.06;
      } else {
        whaleGroup.position.y = -0.25 + Math.sin(elapsed * 0.2) * 0.02;
      }

      // Marine snow slow drift
      const positions = particleGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] -= delta * 0.1;
        positions[i + 1] -= delta * 0.05;
        if (positions[i] < -9) positions[i] = 9;
        if (positions[i + 1] < -5) positions[i + 1] = 5;
      }
      particleGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);

      bodyGeometry.dispose();
      flipperGeo.dispose();
      flukeGeo.dispose();
      finGeo.dispose();
      particleGeometry.dispose();

      skinTexture.dispose();
      whaleMaterial.dispose();
      particleMaterial.dispose();
      renderer.dispose();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [theme, reducedMotion, onLoaded]);

  return (
    <div className="relative w-full h-full min-h-[480px] md:min-h-[580px] overflow-hidden bg-gradient-to-b from-[#051926] to-[#020b12]">
      <div ref={containerRef} className="absolute inset-0 z-10 w-full h-full" />

      {(!hasWebGL || !isLoaded) && (
        <div className="absolute inset-0 z-0 flex items-center justify-center bg-gradient-to-b from-[#061d2d] to-[#01080e] text-sky-200">
          <div className="text-center p-8 max-w-md">
            <svg
              className="w-36 h-24 mx-auto text-sky-400/40 mb-4"
              viewBox="0 0 120 60"
              fill="currentColor"
            >
              <path d="M10,30 Q30,10 70,18 Q95,24 110,15 Q105,30 95,35 Q70,48 35,40 Q15,36 10,30 Z M95,35 Q105,42 112,50 Q105,44 100,38 Z" />
            </svg>
            <p className="text-xs font-mono text-sky-300/80 uppercase tracking-widest">
              Natural History Plate · Epipelagic Water Column
            </p>
          </div>
        </div>
      )}

      {/* Seamless bottom edge blend into next section */}
      <div className="absolute inset-x-0 bottom-0 h-24 z-20 pointer-events-none bg-gradient-to-t from-surface to-transparent" />
    </div>
  );
}
