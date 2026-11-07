"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";

export default function STLViewer({ src, title }: { src: string; title: string }) {
  const mount = useRef<HTMLDivElement>(null);
  const actions = useRef<{ reset: () => void; zoom: (factor: number) => void; rotate: () => void; wire: () => void } | null>(null);
  const [status, setStatus] = useState("Loading model…");
  const [ready, setReady] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    setReady(false); setWireframe(false); setStatus("Loading model…");
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
    catch { setStatus("3D preview is unavailable in this browser. You can download the STL below."); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-label", `Interactive 3D model: ${title}`);
    renderer.domElement.tabIndex = 0;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.01, 100);
    camera.position.set(3, 2, 3);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 0.4; controls.maxDistance = 15;
    controls.listenToKeyEvents(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x605346, 3));
    const light = new THREE.DirectionalLight(0xffffff, 4); light.position.set(4, 6, 3); scene.add(light);
    const material = new THREE.MeshStandardMaterial({ color: 0xe78d62, metalness: 0.25, roughness: 0.45, side: THREE.DoubleSide });
    let geometry: THREE.BufferGeometry | undefined;
    const render = () => renderer.render(scene, camera);
    controls.addEventListener("change", render);
    const resize = () => {
      const width = host.clientWidth; const height = host.clientHeight;
      renderer.setSize(width, height); camera.aspect = width / Math.max(height, 1); camera.updateProjectionMatrix(); render();
    };
    const observer = new ResizeObserver(resize); observer.observe(host); resize();
    const controller = new AbortController();
    let disposed = false;
    void fetch(src, { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error("Model unavailable");
      const bytes = await response.arrayBuffer();
      if (disposed) return;
      geometry = new STLLoader().parse(bytes);
      const positions = geometry.getAttribute("position");
      if (!positions || positions.count < 3) throw new Error("Empty model");
      geometry.center(); geometry.computeBoundingSphere();
      const radius = geometry.boundingSphere?.radius;
      if (!radius || !Number.isFinite(radius)) throw new Error("Invalid model");
      geometry.scale(1 / radius, 1 / radius, 1 / radius);
      geometry.computeVertexNormals();
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;
      scene.add(mesh); controls.update(); controls.saveState(); render();
      actions.current = {
        reset: () => { controls.reset(); render(); },
        zoom: factor => { const delta = camera.position.clone().sub(controls.target); delta.setLength(THREE.MathUtils.clamp(delta.length() * factor, controls.minDistance, controls.maxDistance)); camera.position.copy(controls.target).add(delta); controls.update(); render(); },
        rotate: () => { const offset = camera.position.clone().sub(controls.target).applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 8); camera.position.copy(controls.target).add(offset); controls.update(); render(); },
        wire: () => { material.wireframe = !material.wireframe; setWireframe(material.wireframe); render(); },
      };
      setReady(true); setStatus("");
    }).catch(() => { if (!disposed) setStatus("Could not load this model. Try downloading the STL below."); });
    return () => {
      disposed = true; controller.abort(); observer.disconnect(); controls.dispose(); geometry?.dispose(); material.dispose(); renderer.dispose(); renderer.domElement.remove(); actions.current = null;
    };
  }, [src, title]);
  const button = "rounded border border-coal-line px-3 py-2 text-xs hover:bg-coal-2 disabled:opacity-40";
  return <figure className="overflow-hidden rounded border border-coal-line bg-coal text-bone">
    <div className="relative"><div ref={mount} className="h-[360px] w-full sm:h-[480px]" />{status && <p role="status" className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm">{status}</p>}</div>
    <figcaption className="border-t border-coal-line p-5"><h3 className="serif text-2xl">{title}</h3><p className="mt-2 text-xs text-bone/60">Drag to rotate · Scroll or pinch to zoom · Right-drag or two fingers to pan</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={!ready} className={button} onClick={() => actions.current?.rotate()}>Rotate</button><button type="button" disabled={!ready} className={button} onClick={() => actions.current?.zoom(0.8)}>Zoom in</button><button type="button" disabled={!ready} className={button} onClick={() => actions.current?.zoom(1.25)}>Zoom out</button><button type="button" disabled={!ready} className={button} onClick={() => actions.current?.reset()}>Reset view</button><button type="button" disabled={!ready} aria-pressed={wireframe} className={button} onClick={() => actions.current?.wire()}>Wireframe</button><a href={src} download className={`${button} ml-auto`}>Download STL ↓</a></div></figcaption>
  </figure>;
}
