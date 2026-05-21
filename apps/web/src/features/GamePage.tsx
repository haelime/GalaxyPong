import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as THREE from "three";
import type { GameState } from "@galaxy-pong/shared";
import { Panel } from "../components/Panel";
import { getSocket } from "../lib/realtime";

export function GamePage() {
  const { matchId = "local" } = useParams();
  const navigate = useNavigate();
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<GameState | null>(null);
  const sequence = useRef(0);
  const [state, setState] = useState<GameState | null>(null);

  useEffect(() => {
    const socket = getSocket();
    socket.on("game:state", (payload) => {
      if (payload.matchId === matchId) {
        stateRef.current = payload;
        setState(payload);
      }
    });
    socket.on("game:ended", () => navigate("/records"));

    function keydown(event: KeyboardEvent) {
      if (event.key === "a" || event.key === "ArrowLeft") {
        socket.emit("game:input", { matchId, direction: "left", sequence: sequence.current++ });
      }
      if (event.key === "d" || event.key === "ArrowRight") {
        socket.emit("game:input", { matchId, direction: "right", sequence: sequence.current++ });
      }
    }

    function keyup() {
      socket.emit("game:input", { matchId, direction: "idle", sequence: sequence.current++ });
    }

    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    return () => {
      socket.off("game:state");
      socket.off("game:ended");
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
    };
  }, [matchId, navigate]);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, mount.clientWidth / mount.clientHeight, 0.1, 2000);
    camera.position.set(0, -430, 360);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const board = new THREE.Mesh(
      new THREE.BoxGeometry(320, 430, 16),
      new THREE.MeshStandardMaterial({ color: 0x161a2a, metalness: 0.7, roughness: 0.25 })
    );
    scene.add(board);

    const ball = new THREE.Mesh(new THREE.SphereGeometry(10), new THREE.MeshStandardMaterial({ color: 0x55f7ff, emissive: 0x114044 }));
    scene.add(ball);

    const paddleGeometry = new THREE.BoxGeometry(54, 12, 16);
    const p1 = new THREE.Mesh(paddleGeometry, new THREE.MeshStandardMaterial({ color: 0x55f7ff, emissive: 0x0a3033 }));
    const p2 = new THREE.Mesh(paddleGeometry, new THREE.MeshStandardMaterial({ color: 0xff3d81, emissive: 0x330817 }));
    p1.position.y = -190;
    p2.position.y = 190;
    scene.add(p1, p2);

    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const light = new THREE.PointLight(0xffffff, 1200);
    light.position.set(0, -140, 260);
    scene.add(light);

    function resize() {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    }

    function animate() {
      const game = stateRef.current;
      if (game) {
        ball.position.set(game.ball.x, game.ball.y, 22);
        p1.position.x = game.players[0]?.paddleX ?? 0;
        p2.position.x = game.players[1]?.paddleX ?? 0;
      }
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    }

    let frame = requestAnimationFrame(animate);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      scene.traverse((object: THREE.Object3D) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) object.material.forEach((material: THREE.Material) => material.dispose());
          else object.material.dispose();
        }
      });
    };
  }, []);

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
      <div className="h-[calc(100vh-4rem)] min-h-[520px] overflow-hidden rounded-md border border-white/10 bg-black/35 shadow-2xl" ref={mountRef} />
      <Panel>
        <h1 className="text-2xl font-black">Match</h1>
        <div className="mt-5 space-y-3">
          {(state?.players ?? []).map((player) => (
            <div key={player.username} className="flex items-center justify-between rounded-md bg-white/5 px-3 py-3">
              <span className="font-bold">{player.username}</span>
              <span className="font-mono text-2xl text-amber">{player.score}</span>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-white/55">A/D 또는 방향키로 패들을 조작합니다.</p>
      </Panel>
    </div>
  );
}
