import * as dat from 'dat.gui';
import * as P5 from 'p5';
import {CellularAutomata} from "./CellularAutomata";

let p: P5;
let fillColor: P5.Color;
let strokeColor: P5.Color;
let backgroundColor: P5.Color;
let alpha: number;
let state: boolean = true;

export class ParametersGUI {
    private readonly gui: dat.GUI;

    constructor(params: object) {
        this.gui = new dat.GUI();

        const guiCanvas = this.gui.addFolder("Canvas");
        guiCanvas
            .add(params, "widthNbBlock", 100, 1500, 10)
            .onChange(value => params["setWidthNbBlock"](value));
        guiCanvas
            .add(params, "heightNbBlock", 100, 1500, 10)
            .onChange(value => params["setHeightNbBlock"](value));
        guiCanvas.open();

        const guiColor = this.gui.addFolder("Colors");
        guiColor
            .addColor(params, "fill")
            .onChange(value => fillColor = p.color(value));
        guiColor
            .addColor(params, "stroke")
            .onChange(value => strokeColor = p.color(value));
        guiColor
            .addColor(params, "background")
            .onChange(value => {
                backgroundColor = p.color(value);
                backgroundColor.setAlpha(alpha);
            });
        guiColor
            .add(params, "alphaGradient", 0, 255, 1)
            .onChange(value => {
                alpha = value;
                backgroundColor.setAlpha(alpha);
            });
        guiColor.open();

        const guiState = this.gui.addFolder("State");
        let st = guiState
            .add(params, "stop")
            .name("Pause")
            .onChange(() => {
                state = ! state;
                (state) ? st.name("Pause") : st.name("Play");
            });

        guiState
            .add(params, "version", params["versions"])
            .onChange(value => params["updateVersion"](value))
            .name("Version");
        guiState
            .add(params, "timeForOneGeneration", 1, 1000, 1)
            .onChange(params["updateTimeGeneration"])
            .name("One generation (ms)");
        guiState
            .add(params, "reset")
            .name("Reset");
        guiState.open();
    }
}

class AutomataGUI {
    private ca: CellularAutomata;
    private caseW: number;
    private caseH: number;

    constructor(ca: CellularAutomata) {
        this.ca = ca;
        this.caseW = window.innerWidth / ca.width;
        this.caseH = window.innerHeight / ca.height;

        let sketch = (p: P5) => {
            p.setup = () => {
                p.frameRate(60);
                let canvas = p.createCanvas(window.innerWidth, window.innerHeight);
                let fct = () => {
                    let x = Math.floor(p.mouseX / this.caseW);
                    let y = Math.floor(p.mouseY / this.caseH);
                    if (x >= 0 && y >= 0 && x < window.innerWidth  && y < window.innerHeight)
                        this.ca.addPosition(x, y);
                }
                canvas.mouseOver(fct.bind(this));
                canvas.mouseMoved(fct.bind(this));
                canvas.mouseOut(() => this.ca.removePosition())
            }

            p.windowResized = () => {
                p.resizeCanvas(window.innerWidth, window.innerHeight);
            }

            p.draw = () => {
                p.fill(backgroundColor);
                p.rect(0, 0, window.innerWidth, window.innerHeight);
                p.fill(fillColor);
                p.stroke(strokeColor);
                let automata: number[][] = this.ca.getAutomata();
                for (let i = 0; i < this.ca.height; i++) {
                    for (let j = 0; j < this.ca.width; j++) {
                        if (automata[i][j]) {
                            p.rect(j * this.caseW, i * this.caseH, this.caseW, this.caseH);
                        }
                    }
                }
                p.noLoop();
            }
        }

        p = new P5(sketch);
    }

    public setAutomata(ca: CellularAutomata): void {
        this.ca = ca;
        this.caseW = window.innerWidth / ca.width;
        this.caseH = window.innerHeight / ca.height;
    }

    public update(): void {
        p.loop();
    }

    public reset(): void {
        p.clear();
        p.loop();
    }
}

export class GUI {
    private paramGUI: ParametersGUI;
    private automataGUI: AutomataGUI;

    constructor(ca: CellularAutomata, parameters: any) {
        console.log("Create GUI");
        this.automataGUI = new AutomataGUI(ca);
        fillColor = p.color(parameters["fill"]);
        strokeColor = p.color(parameters["stroke"]);
        alpha = parameters["alphaGradient"];
        backgroundColor = p.color(parameters["background"]);
        backgroundColor.setAlpha(alpha);
        this.paramGUI = new ParametersGUI(parameters);
        console.log("GUI created");
    }

    public setAutomata(ca: CellularAutomata): void {
        this.automataGUI.setAutomata(ca);
    }

    public update(): void {
        this.automataGUI.update();
    }

    public reset(): void {
        this.automataGUI.reset();
    }
}