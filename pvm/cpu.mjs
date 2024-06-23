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
        init();
        if (this.registers.length != 0) {
            while (this.pc < this.registers.length) {
                switch(this.registers[this.pc]) {
                    
                }
                this.pc++;
            }
        }
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

