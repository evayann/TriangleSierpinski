import * as dat from 'dat.gui';
import * as P5 from 'p5';
import {CellularAutomata} from "./CellularAutomata";

let WIDTH: number = 1700;
let HEIGHT: number = 900;

export class ParametersGUI {
    private readonly gui: dat.GUI;
    private readonly listeners: object;
    private params;

    constructor(params: object) {
        this.listeners = {};
        this.gui = new dat.GUI();
        this.params = params;

        const handle = name => value => {
            this.triggerChange(name, value);
        };

        const guiCanvas = this.gui.addFolder("Canvas");
        guiCanvas
            .add(params, "width")
            .min(10)
            .max(1920)
            .step(1)
            .onChange(handle("width"));
        guiCanvas
            .add(params, "height")
            .min(10)
            .max(1080)
            .step(1)
            .onChange(handle("height"));
        guiCanvas.open();

        const guiState = this.gui.addFolder("State");
        guiState
            .add(params, "reset")
            .name("Reset");
        guiState.open();

        this.updateDisplay(this.gui);
    }

    updateDisplay(gui) {
        for (let i in gui.__controllers) {
            gui.__controllers[i].updateDisplay();
        }
        for (let f in gui.__folders) {
            this.updateDisplay(gui.__folders[f]);
        }
    }

    triggerChange(name, value) {
        const type = "change";
        this.listeners[type] &&
        this.listeners[type].forEach(callback =>
            callback({ type, name, value })
        );
    }

    /*makeIteration(evt: MouseEvent): void {
        let x = Math.floor((evt.clientX - this.canvasX) / (this.canvasWidth / this.ca.width));
        let y = Math.floor((evt.clientY - this.canvasY) / (this.canvasHeight / this.ca.height));
        if (x >= 0 && y >= 0 && x < WIDTH && y < HEIGHT)
            this.ca.pos = [x, y];
    }

    display(): void {
        this.context.clearRect(0, 0, WIDTH, HEIGHT);
        for (let i = 0; i < this.ca.height; i++) {
            for (let j = 0; j < this.ca.width; j++) {
                if (this.ca.currGeneration[i][j]) {
                    this.drawCell(j, i);
                }
            }
        }
    }

    private drawCell(x: number, y: number): void {
        this.context.beginPath();
        this.context.fillStyle = "red";
        this.context.rect(x * (WIDTH / this.ca.width), y * (HEIGHT / this.ca.height),  (WIDTH / this.ca.width), (HEIGHT / this.ca.height));
        this.context.fill();
        this.context.stroke();
    }*/
}

class AutomataGUI {
    private ca: CellularAutomata;
    private readonly caseW: number;
    private readonly caseH: number;
    private isUpdate: boolean = false;

    constructor(ca: CellularAutomata) {
        this.ca = ca;
        this.caseW = (WIDTH / ca.height);
        this.caseH = (HEIGHT / ca.height);

        let sketch = (p: P5) => {
            p.setup = () => {
                p.frameRate(60);
                let canvas = p.createCanvas(p.windowWidth, p.windowHeight);
                let fct = function () {
                    let x = Math.floor(p.mouseX / this.caseW);
                    let y = Math.floor(p.mouseY / this.caseH);
                    if (x >= 0 && y >= 0 && x < WIDTH && y < HEIGHT)
                        this.ca.pos = [x, y];
                }
                canvas.mouseOver(fct.bind(this));
                canvas.mouseMoved(fct.bind(this));
            }

            p.windowResized = () => {
                p.resizeCanvas(p.windowWidth, p.windowHeight);
            }

            p.draw = () => {
                // Update only when automata is change
                if (! this.update)
                    return;

                p.clear();
                this.ca.update();
                let automata: number[][] = this.ca.getAutomata();
                p.fill("red");
                for (let i = 0; i < this.ca.height; i++) {
                    for (let j = 0; j < this.ca.width; j++) {
                        if (automata[i][j]) {
                            //  Draw rect
                            p.rect(j * this.caseW, i * this.caseH, this.caseW, this.caseH);
                        }
                    }
                }
                this.isUpdate = false;
            }
        }

        new P5(sketch);
    }

    public update(): void {
        this.isUpdate = true;
    }
}

export class GUI {
    private paramGUI: ParametersGUI;
    private automataGUI: AutomataGUI;

    constructor(ca: CellularAutomata, parameters: any) {
        console.log("Create GUI");
        this.automataGUI = new AutomataGUI(ca);
        this.paramGUI = new ParametersGUI(parameters);
        console.log("GUI created");
    }

    public update(): void {
        this.automataGUI.update();
    }
}