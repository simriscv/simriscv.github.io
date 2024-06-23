const flag = {
    n : 0, z : 0, c : 0, v : 0,
    init() {
        Object.assign(this, { n: 0, z: 0, c: 0, v: 0 });
    }
}


export default class CPU {
    constructor() {
        this.registers = new Array(32).fill(0);
        this.instructions = [];
        this.pc = 0;
        this.debug = false;
        this.flag = flag;
    }

    init() {
        this.registers.fill(0);
        this.pc = 0;
        this.flag.init();
    }

    run() {

    }

    step() {


    }

    stop() {

    }

    execute() {
        // fetch

        // decode

        // execute

    }

}

