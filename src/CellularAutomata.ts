let False: number = 0;
let True: number = 1;

export abstract class CellularAutomata {
    public width: number;
    public height: number;
    protected currGeneration: number[][];

    private pos: [number, number] = null;

    protected constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.currGeneration = new Array(height).fill(False).map(() => new Array(width).fill(False));

        //setInterval(this.update.bind(this), 1000);
    }

    abstract computeGeneration(): void;

    protected rule(p: number, q:number, r:number): number {
        return p ^ (p && q || r);
    }

    public addCell(x: number, y: number): void {
        this.currGeneration[y][x] = True;
    }

    public reset(): void {
        this.currGeneration = new Array(this.height).fill(False).map(() => new Array(this.width).fill(False));
    }

    public update(): void {
        if (this.pos != null)
            this.addCell(this.pos[0], this.pos[1]);

        this.computeGeneration();
    }

    public getAutomata(): number[][] {
        return this.currGeneration;
    }

}

export class NaifCA extends CellularAutomata {
    nextGeneration: number[][];

    constructor(width: number, height: number) {
        super(width, height);
        this.nextGeneration = new Array(height).fill(False).map(() => new Array(width).fill(False));
    }

    parents(x: number, y: number): number {
        let top: number = (y - 1) < 0 ? this.height + y - 1 : (y - 1) % this.height;
        let xm1: number = (x - 1) < 0 ? this.width + x - 1 : (x - 1) % this.width;
        let p: number = this.currGeneration[top][xm1];
        let q: number = this.currGeneration[top][x];
        let r: number = this.currGeneration[top][(x + 1) % this.width];
        return this.rule(p, q, r);
    }

    computeGeneration(): void {
        for (let i = 0; i < this.height; i++)
            for (let j = 0; j < this.width; j++)
                this.nextGeneration[i][j] = this.parents(j, i);

        // Update generation
        this.currGeneration = this.nextGeneration.map((array) => {return array.slice()});
    }
}

export class BuffSwapCA extends CellularAutomata {
    nextGeneration: number[][];

    constructor(width: number, height: number) {
        super(width, height);
        this.nextGeneration = new Array(height).fill(False).map(() => new Array(width).fill(False));
    }

    parents(x: number, y: number): number {
        let top: number = (y - 1) < 0 ? this.height + y - 1 : (y - 1) % this.height;
        let xm1: number = (x - 1) < 0 ? this.width + x - 1 : (x - 1) % this.width;
        let p: number = this.currGeneration[top][xm1];
        let q: number = this.currGeneration[top][x];
        let r: number = this.currGeneration[top][(x + 1) % this.width];
        return this.rule(p, q, r);
    }

    computeGeneration(): void {
        for (let i = 0; i < this.height; i++)
            for (let j = 0; j < this.width; j++)
                this.nextGeneration[i][j] = this.parents(j, i);

        // Update generation, Buffer Swap
        [this.currGeneration, this.nextGeneration] = [this.nextGeneration, this.currGeneration];
    }
}

export class BuffSwapNoModCA extends CellularAutomata {
    nextGeneration: number[][];

    constructor(width: number, height: number) {
        super(width, height);
        this.nextGeneration = new Array(height).fill(False).map(() => new Array(width).fill(False));
    }

    computeGeneration(): void {
        let origine: number = this.currGeneration[this.height - 1][0];
        let originep1: number = this.currGeneration[this.height - 1][1];
        let old: number = origine;
        for (let j = 1; j < this.width - 1; j++) {
            let curr: number = this.currGeneration[this.height - 1][j];
            this.nextGeneration[0][j] = this.rule(old, curr, this.currGeneration[this.height - 1][j + 1]);
            old = curr;
        }
        this.nextGeneration[0][this.width - 1] = this.rule(old, this.currGeneration[this.height - 1][this.width - 1], origine);
        this.nextGeneration[0][0] = this.rule(this.currGeneration[this.height - 1][this.width - 1], origine, originep1);

        for (let i = 1; i < this.height; i++) {
            let origine: number = this.currGeneration[i - 1][0];
            let originep1: number = this.currGeneration[i - 1][1];
            let old: number = origine;
            for (let j = 1; j < this.width - 1; j++) {
                let curr: number = this.currGeneration[i - 1][j];
                this.nextGeneration[i][j] = this.rule(old, curr, this.currGeneration[i - 1][j + 1]);
                old = curr;
            }
            this.nextGeneration[i][this.width - 1] = this.rule(old, this.currGeneration[i - 1][this.width - 1], origine);
            this.nextGeneration[i][0] = this.rule(this.currGeneration[i - 1][this.width - 1], origine, originep1);
        }

        // Update generation, Buffer Swap
        [this.currGeneration, this.nextGeneration] = [this.nextGeneration, this.currGeneration];
    }
}

export class LittleBufCA extends CellularAutomata {

    constructor(width: number, height: number) {
        super(width, height);
    }

    computeGeneration(): void {
        let buffer: number[] = []; // Buffer of size : width
        let origine: number = this.currGeneration[0][0];
        let originep1: number = this.currGeneration[0][1];
        let old: number = origine;
        for (let j = 1; j < this.width - 1; j++) {
            let curr: number = this.currGeneration[0][j];
            buffer[j] = this.rule(old, curr, this.currGeneration[0][j + 1]);
            old = curr;
        }
        buffer[this.width - 1] = this.rule(old, this.currGeneration[0][this.width - 1], origine);
        buffer[0] = this.rule(this.currGeneration[0][this.width - 1], origine, originep1); // First element

        for (let i = 2; i < this.height; i++) {
            let origine: number = this.currGeneration[i - 1][0];
            let originep1: number = this.currGeneration[i - 1][1];
            let old: number = origine;
            for (let j = 1; j < this.width - 1; j++) {
                let curr: number = this.currGeneration[i - 1][j];
                this.currGeneration[i - 1][j] = buffer[j];
                buffer[j] = this.rule(old, curr, this.currGeneration[i - 1][j + 1]);
                old = curr;
            }
            let last: number = this.currGeneration[i - 1][this.width - 1];
            this.currGeneration[i - 1][this.width - 1] = buffer[this.width - 1];
            buffer[this.width - 1] = this.rule(old, last, origine);

            this.currGeneration[i - 1][0] = buffer[0];
            buffer[0] = this.rule(last, origine, originep1); // First element
        }

        origine = this.currGeneration[this.height - 1][0];
        originep1 = this.currGeneration[this.height - 1][1];
        old = origine;
        for (let j = 1; j < this.width - 1; j++) {
            let curr: number = this.currGeneration[this.height - 1][j];
            this.currGeneration[this.height - 1][j] = buffer[j];
            buffer[j] = this.rule(old, curr, this.currGeneration[this.height - 1][j + 1]);
            old = curr;
        }

        let last: number = this.currGeneration[this.height - 1][this.width - 1];

        this.currGeneration[this.height - 1][this.width - 1] = buffer[this.width - 1];
        buffer[this.width - 1] = this.rule(old, last, origine);

        this.currGeneration[this.height - 1][0] = buffer[0];
        buffer[0] = this.rule(last, origine, originep1); // First element

        // Assign last buffer
        this.currGeneration[0] = buffer;
    }
}