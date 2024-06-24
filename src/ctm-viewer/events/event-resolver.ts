import { Raycaster, Vector2, Intersection, Object3DEventMap, Object3D } from "three";
import { DTRenderer } from "../../dt-renderer";

export class EventResolver {
    public forceCanvasMiddleClick = false;
    private raycaster = new Raycaster();
    private clickEvents: ((event: MouseEvent, intersections: Intersection<Object3D<Object3DEventMap>>[]) => void)[] = [];

    constructor(public renderer: DTRenderer) {
        const canvas = this.renderer.canvas;
        if (!canvas) {
            return;
        }

        canvas.addEventListener('click', this.onClick);
    }

    private onClick = (event: MouseEvent) => {
        this.setRaycasterFromEvent(event);
        const intersects = this.raycaster.intersectObjects(this.renderer.scene!.children, true);
        this.clickEvents.forEach(callback => {
            callback(event, intersects);
        });
    }

    public addClickEvent(callback: (event: MouseEvent, intersections: Intersection<Object3D<Object3DEventMap>>[]) => void) {
        this.clickEvents.push(callback);
    }
    public removeClickEvent(callback: (event: MouseEvent, intersections: Intersection<Object3D<Object3DEventMap>>[]) => void) {
        const index = this.clickEvents.indexOf(callback);
        if (index > -1) {
            this.clickEvents.splice(index, 1);
        }
    }

    public dispose() {
        const canvas = this.renderer.canvas;
        if (!canvas) {
            return;
        }

        canvas.removeEventListener('click', this.onClick);
    }

    private setRaycasterFromEvent(event: MouseEvent) {
        const canvas = this.renderer.canvas;
        if (!canvas) {
            return;
        }

        const mousePos = new Vector2();
        if (this.forceCanvasMiddleClick) {
            mousePos.set(0, 0);
        } else {
            const rect = canvas.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            mousePos.set(x, y);
        }

        this.raycaster.setFromCamera(mousePos, this.renderer.camera!);
    }
}