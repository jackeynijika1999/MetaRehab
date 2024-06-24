import nipplejs, { EventData, JoystickOutputData } from 'nipplejs';

export class Joystick {
    private joystickMove: nipplejs.JoystickManager | undefined;
    private joystickRotate: nipplejs.JoystickManager | undefined;

    private joystickContainerL: HTMLDivElement | undefined;
    private joystickContainerR: HTMLDivElement | undefined;
    private joystickContainerLId = 'CTM-Viewer-Joystick-Container-Left';
    private joystickContainerRId = 'CTM-Viewer-Joystick-Container-Right';

    public onLeftJoystickMove: (evt: EventData, data: JoystickOutputData) => void = () => { };
    public onLeftJoystickEnd: () => void = () => { };
    public onRightJoystickMove: (evt: EventData, data: JoystickOutputData) => void = () => { };
    public onRightJoystickEnd: () => void = () => { };

    constructor(dom: HTMLElement) {
        this.joystickContainerL = document.createElement('div');
        this.joystickContainerL.id = this.joystickContainerLId;
        dom?.parentElement?.appendChild(this.joystickContainerL);
        this.joystickContainerR = document.createElement('div');
        this.joystickContainerR.id = this.joystickContainerRId;
        dom?.parentElement?.appendChild(this.joystickContainerR);

        this.joystickMove = nipplejs.create({
            zone: document.getElementById(this.joystickContainerLId) as HTMLDivElement,
            mode: 'static',
            position: { left: '50%', top: '50%' },
            color: 'red',
            size: 140
        });
        this.joystickRotate = nipplejs.create({
            zone: document.getElementById(this.joystickContainerRId) as HTMLDivElement,
            mode: 'static',
            position: { left: '50%', top: '50%' },
            color: 'blue',
            size: 140
        });
        this.listenOperation();
    }

    private listenOperation() {
        this.joystickMove?.on('move', (evt, data) => {
            this.onLeftJoystickMove(evt, data);
        })

        this.joystickMove?.on('end', () => {
            this.onLeftJoystickEnd();
        });

        this.joystickRotate?.on('move', (evt, data) => {
            this.onRightJoystickMove(evt, data);
        })

        this.joystickRotate?.on('end', () => {
            this.onRightJoystickEnd();
        });
    }

    dispose() {
        this.joystickMove?.destroy();
        this.joystickMove = undefined;
        this.joystickRotate?.destroy();
        this.joystickRotate = undefined;
        this.joystickContainerL?.remove();
        this.joystickContainerL = undefined;
        this.joystickContainerR?.remove();
        this.joystickContainerR = undefined;

        this.onLeftJoystickMove = () => { };
        this.onLeftJoystickEnd = () => { };
        this.onRightJoystickMove = () => { };
        this.onRightJoystickEnd = () => { };
    }
}