import { Group, Vector3, WebGLRenderer, Euler, Matrix4, Quaternion } from 'three';
import { DTRenderer } from '../../dt-renderer';

export class VRControls {
    private inVr = false;
    private leftGamePad: Gamepad | undefined;
    private rightGamePad: Gamepad | undefined;
    private cameraWrapper = new Group(); // will be set as this.renderer.cameraWrapper in constructor

    private moveJoystickDirection = new Vector3();
    private rotateJoystickDirection = new Vector3();
    private moveSpeed = 1;
    private rotateSpeedHorizon = 1;
    private cameraEuler = new Euler(0, 0, 0, 'YXZ');
    private moveDirection = new Vector3();

    private now = performance.now();
    private _enabled = true;

    private initialY = 0;
    private vrPosInited = false;

    constructor(private renderer: DTRenderer, private initialWorldTransform?: Matrix4) {
        const xr = this.renderer.renderer?.xr;
        if (!xr) {
            return;
        }

        this.cameraWrapper = this.renderer.cameraWrapper;

        const controller0 = xr.getController(0);
        controller0.addEventListener('connected', this.onGamepadConnection);
        const controller1 = xr.getController(1);
        controller1.addEventListener('connected', this.onGamepadConnection);
        xr.addEventListener('sessionstart', this.enterVR);
        xr.addEventListener('sessionend', this.exitVR);
    }

    enterVR = () => {
        this.inVr = true;
        this.initialY = this.renderer.camera?.position.y || 0;
        this.now = performance.now();
    }

    exitVR = () => {
        this.inVr = false;
    }

    private initPos() {
        if (this.initialWorldTransform && this.renderer.camera) {
            // 抵销XR camera的pos
            const xrCamLocalTransform = this.renderer.camera.matrix.clone();
            const transOper = this.initialWorldTransform.clone().multiply(xrCamLocalTransform.invert());
            this.cameraWrapper.position.setFromMatrixPosition(transOper);
            this.cameraWrapper.quaternion.setFromRotationMatrix(transOper);
        }
    }

    update() {
        if (!this.inVr || !this.enabled) {
            return;
        }

        if (!this.vrPosInited) {
            if (this.initialY !== this.renderer.camera?.position.y) {
                this.vrPosInited = true;
                this.initPos();
            }
        }

        const delta = (performance.now() - this.now) / 1000;
        this.now = performance.now();

        // Movement with left controller
        if (this.leftGamePad) {
            let thumbstickX = this.leftGamePad.axes[2];
            let thumbstickY = this.leftGamePad.axes[3];
            this.moveJoystickDirection.set(thumbstickX, 0, thumbstickY);
            if (this.moveJoystickDirection.x !== 0 || this.moveJoystickDirection.z !== 0) {
                this.moveDirection.copy(this.moveJoystickDirection).applyQuaternion(this.cameraWrapper.quaternion).setY(0);
                this.cameraWrapper.position.addScaledVector(this.moveDirection, this.moveSpeed * delta);
            }
        }

        // Rotation with right controller
        if (this.rightGamePad) {
            let thumbstickX = this.rightGamePad.axes[2];
            let thumbstickY = this.rightGamePad.axes[3];
            this.rotateJoystickDirection.set(thumbstickX, -thumbstickY, 0);
            if (this.rotateJoystickDirection.x !== 0) {
                this.cameraEuler.setFromQuaternion(this.cameraWrapper.quaternion);
                this.cameraEuler.y -= this.rotateJoystickDirection.x * this.rotateSpeedHorizon * delta;
                this.cameraWrapper.quaternion.setFromEuler(this.cameraEuler);
            }
        }
    }

    onGamepadConnection = (e: { data: XRInputSource }) => {
        if (e.data.handedness === 'right') {
            this.rightGamePad = e.data.gamepad;
        } else if (e.data.handedness === 'left') {
            this.leftGamePad = e.data.gamepad;
        } else {
            console.error('Error assigning controller to right or left hand');
        }
    }

    dispose() {
        const xr = this.renderer.renderer?.xr;
        if (!xr) {
            return;
        }

        xr.removeEventListener('sessionstart', this.enterVR);
        xr.removeEventListener('sessionend', this.exitVR);
        const controller0 = xr.getController(0);
        controller0?.removeEventListener('connected', this.onGamepadConnection);
        const controller1 = xr.getController(1);
        controller1?.removeEventListener('connected', this.onGamepadConnection);

        this.leftGamePad = undefined;
        this.rightGamePad = undefined;
    }

    set enabled(value) {
        this._enabled = !!value;
        if (this.enabled) {
            this.now = performance.now();
        }
    }
    get enabled() {
        return this._enabled;
    }
}
