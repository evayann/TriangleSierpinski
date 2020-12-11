import Stats from 'stats-js';

import {GUI} from "./GUI";
import {BuffSwapNoModCA, BuffSwapCA, LittleBufCA, NaifCA, CellularAutomata} from "./CellularAutomata";

let isStop: boolean = true;
let timeForOneGeneration: number = 1;
let updater: NodeJS.Timeout;

let currentVersion: string;
let widthNbBlock: number;
let heightNbBlock: number;

function start(ca: CellularAutomata, gui: GUI, stats: Stats) {
    updater = setInterval(() => {
        update(ca, gui, stats);
    }, timeForOneGeneration);
}

function stop() {
    clearInterval(updater);
}

function update(ca: CellularAutomata, gui: GUI, stats: Stats) {
    stats.begin();
    ca.update();
    stats.end();

    gui.update();
}

window.onload = () => {
    console.log("Loading");

    const switchState = () => {
        isStop = ! isStop;
        (isStop) ? stop() : start(ca, gui, stats);
    }

    const cellAutomata = {BuffSwapNoModCA: () => new BuffSwapNoModCA(widthNbBlock, heightNbBlock),
        NaifCA: () => new NaifCA(widthNbBlock, heightNbBlock),
        BuffSwapCA: () => new BuffSwapCA(widthNbBlock, heightNbBlock),
        LittleBufCA: () => new LittleBufCA(widthNbBlock, heightNbBlock)
    }

    const updateCellularAutomata = (version) => {
        gui.reset()
        switchState();
        ca = cellAutomata[version]();
        gui.setAutomata(ca);
        switchState();
    }

    currentVersion = "BuffSwapNoModCA";
    widthNbBlock = 500;
    heightNbBlock = 500;
    let ca: CellularAutomata = cellAutomata[currentVersion]();

    let gui: GUI = new GUI(ca, {widthNbBlock: widthNbBlock, heightNbBlock: heightNbBlock,
        setWidthNbBlock: (nbW) => {
            widthNbBlock = nbW;
            updateCellularAutomata(currentVersion);
        },
        setHeightNbBlock: (nbH) => {
            heightNbBlock = nbH;
            updateCellularAutomata(currentVersion);
        },
        fill: "#863621",
        stroke: "#863621",
        background: "#204243",
        alphaGradient: 255,
        version: currentVersion,
        versions: ["BuffSwapNoModCA", "BuffSwapCA", "LittleBufCA", "NaifCA"],
        updateVersion: updateCellularAutomata,
        stop: switchState,
        timeForOneGeneration: 1,
        updateTimeGeneration: (value) => {
            timeForOneGeneration = value;
            switchState();
            switchState();
        },
        reset: () => {
            ca.reset();
            gui.reset();
        }
    });

    let stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.domElement);

    switchState();
}
