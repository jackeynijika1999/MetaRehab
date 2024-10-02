import { Vector3, Camera } from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { loadFirstPersonHand } from './first-person-hand';

const ArchorDomId = 'ctmViewer-pc-controls-archor';

export class PCControls {
    public controls: PointerLockControls | undefined;
    private _enabled = true;

    private moveForward = false;
    private moveBackward = false;
    private moveLeft = false;
    private moveRight = false;
    private prevTime = performance.now();

    private velocity = new Vector3(0, 0, 0);
    private maxVelocity = 2;
    private acceleration = 3;

    public onLock = () => { };
    public onUnlock = () => { };

    constructor(private camera: Camera, private canvas: HTMLCanvasElement, withHand = true) {
        this.initControls();
        if (withHand) {
            loadFirstPersonHand().then(gltf => {
                camera.add(gltf);
            })
        }
    }

    private initControls() {
        this.controls = new PointerLockControls(this.camera, this.canvas);
        this.controls.pointerSpeed = 0.6;
        this.controls.domElement.addEventListener('click', this.lockPLC);
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);

        this.controls.addEventListener('lock', () => {
            this.createArchor();
            this.onLock();
        });
        this.controls.addEventListener('unlock', () => {
            this.removeArchor();
            this.onUnlock();
        });
    }

    public dispose() {
        if (!this.controls) {
            return;
        }
        this.controls.unlock();
        this.onUnlock(); // 避免因为后面dispose后无法触发unlock事件
        this.controls.dispose();
        this.controls.domElement.removeEventListener('click', this.lockPLC);
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        this.removeArchor();
        this.controls = undefined;
    }

    public update() {
        if (!this.controls) {
            return;
        }

        const time = performance.now();

        if (this.controls.isLocked) {
            const delta = (time - this.prevTime) / 1000;

            if (this.moveForward) {
                if (this.velocity.z < this.maxVelocity) {
                    this.velocity.z += this.acceleration * delta;
                } else {
                    this.velocity.z = this.maxVelocity;
                }
                this.controls.moveForward(this.velocity.z * delta);
            } else if (this.moveBackward) {
                if (this.velocity.z > -this.maxVelocity) {
                    this.velocity.z -= this.acceleration * delta;
                } else {
                    this.velocity.z = -this.maxVelocity;
                }
                this.controls.moveForward(this.velocity.z * delta);
            } else {
                this.velocity.z = 0;
            }

            if (this.moveLeft) {
                if (this.velocity.x > -this.maxVelocity) {
                    this.velocity.x -= this.acceleration * delta;
                } else {
                    this.velocity.x = -this.maxVelocity;
                }
                this.controls.moveRight(this.velocity.x * delta);
            } else if (this.moveRight) {
                if (this.velocity.x < this.maxVelocity) {
                    this.velocity.x += this.acceleration * delta;
                } else {
                    this.velocity.x = this.maxVelocity;
                }
                this.controls.moveRight(this.velocity.x * delta);
            } else {
                this.velocity.x = 0;
            }
        }

        this.prevTime = time;
    }

    private lockPLC = () => {
        if (!this.controls?.isLocked) {
            this.controls?.lock();
        }
    }

    private onKeyDown = (event: KeyboardEvent) => {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.moveForward = true;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                this.moveLeft = true;
                break;

            case 'ArrowDown':
            case 'KeyS':
                this.moveBackward = true;
                break;

            case 'ArrowRight':
            case 'KeyD':
                this.moveRight = true;
                break;
        }
    }

    private onKeyUp = (event: KeyboardEvent) => {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.moveForward = false;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                this.moveLeft = false;
                break;

            case 'ArrowDown':
            case 'KeyS':
                this.moveBackward = false;
                break;

            case 'ArrowRight':
            case 'KeyD':
                this.moveRight = false;
                break;
        }
    };

    get enabled() {
        return this._enabled;
    }
    set enabled(value: boolean) {
        if (this._enabled !== !!value) {
            this._enabled = !!value;
            if (this._enabled) {
                this.initControls();
            } else {
                this.dispose();
            }
        }
    }

    private createArchor() {
        const dom = document.createElement('div');
        dom.id = ArchorDomId;
        dom.style.position = 'absolute';
        dom.style.top = 'calc(50% - 25px)';
        dom.style.left = 'calc(50% - 25px)';
        dom.style.width = '50px';
        dom.style.height = '50px';
        dom.style.backgroundColor = 'rgba(0, 0, 0, 0)';
        dom.style.color = 'rgba(256, 256, 256, 0.3)';
        dom.style.fontSize = '50px';
        dom.style.lineHeight = '50px';
        dom.innerText = '+';
        this.canvas.parentElement?.appendChild(dom);
    }

    private removeArchor() {
        const dom = document.getElementById(ArchorDomId);
        dom?.remove();
    }
}