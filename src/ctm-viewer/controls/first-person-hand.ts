import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { Group } from 'three';

export function loadFirstPersonHand(): Promise<THREE.Group> {
    const loader = new OBJLoader();
    const materialsLoader = new MTLLoader();

    return new Promise((resolve, reject) => {
        materialsLoader.load('assets/hand_r/material.lib', (materials) => {
            loader.setMaterials(materials);
            loader.load('assets/hand_r/hand_r.obj', (object) => {
                object.scale.set(0.002, 0.002, 0.002);
                object.rotation.set(0, Math.PI, Math.PI / 2);
                object.position.set(0.06, 0, 0);

                const newObject = object.clone();
                newObject.scale.set(-0.002, 0.002, 0.002);
                newObject.rotation.set(0, -Math.PI, -Math.PI / 2);
                newObject.position.set(-0.06, 0, 0);

                const group = new Group();
                group.add(object, newObject);
                group.rotation.set(Math.PI / 6, 0, 0);
                group.position.set(0, -0.08, -0.3);
                resolve(group);
            });
        });
    });
}
