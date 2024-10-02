import { Joystick } from './joystick';
import { Vector3, Euler, Camera } from 'three';

export class MobileControls {
    private joystick: Joystick | undefined;
    private moveJoystickDirection = new Vector3();
    private rotateJoystickDirection = new Vector3();
    private moveSpeed = 1;
    private rotateSpeedHorizon = 0.6;
    private rotateSpeedVertical = 0.3;

    private cameraEuler = new Euler(0, 0, 0, 'YXZ');
    private moveDirection = new Vector3();
    private preTime = performance.now();
    private _enabled = true;

    constructor(private dom: HTMLElement, private camera: Camera) {
        this.joystick = new Joystick(dom);
        this.listenOperation();
    }

    private listenOperation() {
        if (!this.joystick) {
            return;
        }

        this.joystick.onLeftJoystickMove = (evt, data) => {
            this.moveJoystickDirection.set(data.vector.x, 0, -data.vector.y);
        }
        this.joystick.onLeftJoystickEnd = () => {
            this.moveJoystickDirection.set(0, 0, 0);
        }
        this.joystick.onRightJoystickMove = (evt, data) => {
            this.rotateJoystickDirection.set(data.vector.x, data.vector.y, 0);
        }
        this.joystick.onRightJoystickEnd = () => {
            this.rotateJoystickDirection.set(0, 0, 0);
        }
    }

    update() {
        const now = performance.now();

        if (this._enabled) {
            const delta = (now - this.preTime) / 1000;

            if (this.moveJoystickDirection.x !== 0 || this.moveJoystickDirection.z !== 0) {
                this.moveDirection.copy(this.moveJoystickDirection).applyQuaternion(this.camera.quaternion).setY(0);
                this.camera.position.addScaledVector(this.moveDirection, this.moveSpeed * delta);
            }

            if (this.rotateJoystickDirection.x !== 0 || this.rotateJoystickDirection.y !== 0) {
                this.cameraEuler.setFromQuaternion(this.camera.quaternion);

                this.cameraEuler.y -= this.rotateJoystickDirection.x * this.rotateSpeedHorizon * delta;
                this.cameraEuler.x += this.rotateJoystickDirection.y * this.rotateSpeedVertical * delta;

                // _euler.x = Math.max(_PI_2 - this.maxPolarAngle, Math.min(_PI_2 - this.minPolarAngle, _euler.x));

                this.camera.quaternion.setFromEuler(this.cameraEuler);
            }
        }

        this.preTime = now;
    }

    dispose() {
        this.joystick?.dispose();
        this.joystick = undefined;
    }

    get enabled() {
        return this._enabled;
    }
    set enabled(value) {
        this._enabled = !!value;
    }
}
