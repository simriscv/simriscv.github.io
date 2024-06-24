/* CPU definition */

import * as c from './const.mjs'

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
        this.output = "";
        this.entrySymbol = false;
    }

    init() {
        this.registers.fill(0);
        this.pc = 0;
        this.flag.init();
        this.output = "";
        this.entrySymbol = false;
    }

    run() {
        alert("init");
        // initialization
        init();
        let len = this.instructions.length 

        // pipeline cycle
        if (len != 0) {
            while (this.pc < len) {
                alert("execute line");                
                // fetch
                let op = this.instructions[this.pc];
                let f3 = null;
                let f7 = null; 
                if (f3) f3 = this.instructions[this.pc].f3;
                if (f7) f7 = this.instructions[this.pc].f7;
                this.pc++;

                // decode

                // execute
                if (op == c.I_TYPE) {
                    if (f3 == c.ADDI){
                        let rs1 = this.registers[op.rs1];
                        this.registers[op.rd] =  rs1 + op.imm;
                    }
                } else if (op == c.R_TYPE) {
                    if (f3 == c.ADD_SUB){
                        if (f7 == c.ADD){
                            let rs1 = this.registers[op.rs1];
                            let rs2 = this.registers[op.rs2];
                            this.registers[op.rd] =  rs1 + rs2;
                        }
                    }
                } else if (op == c.ECALL) {

                } else if (op == c.LABEL) {

                } else if (op == c.DIRECTIVE) {
                    if (f3 == c.GLOBAL) {
                        if (op.name === "_start") {
                            this.entrySymbol = true;
                        }
                    } else {
                        this.output += "\nwarning: unknown directive";
                    }
                } else {
                    this.output += "\nwarning: unknown instruction";
                }
                this.pc++;
            }
            this.output += "\n"+len+" instructions executed";
        } else {
            this.output += "\nwarning: no instruction found";
        }
    }

    step() {


    }

}

