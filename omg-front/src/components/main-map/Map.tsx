import { useEffect, useRef } from 'react';

import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { AnimationMixer } from 'three';

export default function Map() {
  const { scene, animations } = useGLTF('/models/map/scene.gltf');
  const mixer = useRef(null);

  useEffect(() => {
    if (animations && animations.length > 0) {
      mixer.current = new AnimationMixer(scene);
      const action = mixer.current.clipAction(animations[0]);
      action.play();

      const animate = () => {
        mixer.current?.update(0.01);
        requestAnimationFrame(animate);
      };

      animate();
    }

    return () => {
      if (mixer.current) {
        mixer.current.stopAllAction();
      }
    };
  }, [animations, scene]);

  return (
    <RigidBody type='fixed' colliders='hull' restitution={0}>
      <primitive
        object={scene}
        scale={[0.05, 0.05, 0.05]}
        position={[0, -8, 0]}
        castShadow
        receiveShadow
      />
    </RigidBody>
  );
}

// 성능 최적화를 위해 미리 불러오기
useGLTF.preload('/models/map/scene.gltf');
