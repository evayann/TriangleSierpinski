import Stats from 'stats-js';

import {GUI} from "./GUI";
import {BuffSwapNoModCA, CellularAutomata, NaifCA} from "./CellularAutomata";

function update(ca: CellularAutomata, gui: GUI, stats: Stats) {
    setInterval(() => {
        stats.begin();
        ca.update();
        stats.end();

        gui.update();
    }, 1);
}

window.onload = () => {
    console.log("Loading");
    let ca: CellularAutomata = new BuffSwapNoModCA(750, 750);
    let gui: GUI = new GUI(ca, {width: 300, height: 300, reset: () => ca.reset()});

    let stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.domElement);

    update(ca, gui, stats);
}
