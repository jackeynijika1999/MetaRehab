import { CTMViewer } from "..";

export abstract class BasePlugin {
    constructor(public ctmViewer: CTMViewer) { }

    public abstract dispose(): void;

    public update(delta: number) { }
}
