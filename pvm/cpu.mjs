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
        this.stack = new ArrayBuffer(16777215);
        this.addr = c.ADDR;
        this.instructions = [];
        this.alias = c.ALIAS;
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

    loadStack() {
        this.registers[28] = 1;
        let addr = 0;
        let view = new DataView(this.stack);
        let len = this.instructions.length;
        
        for (let i=0; i<len; i++) {
            
            let op = this.instructions[i];
            this.registers[28] = i;
            if (op.code == c.DIRECTIVE) {
                this.registers[28] = 3;
                if (op.f3 == c.DATA) {
                    this.registers[29] = 1;
                    let lv = op.vars.length;
                    for (let j=0; j<lv; j++) {
                        this.registers[30] = 1;
                        if (op.vars[j].type == 2){
                            ld = op.vars[j].value.length;
                            for (let k=1; k<ld; k++) {
                                this.registers[31] = op.vars[j].value[k];
                                view.setInt32(addr,op.vars[j].value[k]);
                                addr += 4;
                            }
                        }
                    }
                }
            } else this.registers[31] = 1;
        }
    }

    run() {
        // initialization
        this.init();
        this.loadStack();
        let len = this.instructions.length;

        // pipeline cycle
        if (len != 0) {
            while (this.pc < len) {               
                // fetch
                let op = this.instructions[this.pc];
                this.pc++;

                // decode

                // execute
                if (op.code == c.I_TYPE) {
                    if (op.f3 == c.ADDI){
                        let rs1 = this.registers[op.rs1];
                        this.registers[op.rd] = rs1 + op.imm;
                    } else if (op.f3 == c.XORI) {
                        let rs1 = this.registers[op.rs1];
                        this.registers[op.rd] = rs1 ^ op.imm;
                    } else if (op.f3 == c.ORI) {
                        let rs1 = this.registers[op.rs1];
                        this.registers[op.rd] = rs1 | op.imm;
                    } else if (op.f3 == c.ANDI) {
                        let rs1 = this.registers[op.rs1];
                        this.registers[op.rd] = rs1 & op.imm;
                    }
                } else if (op.code == c.R_TYPE) {
                    if (op.f3 == c.R0){
                        if (op.f7 == c.ADD){
                            let rs1 = this.registers[op.rs1];
                            let rs2 = this.registers[op.rs2];
                            this.registers[op.rd] = rs1 + rs2;
                        }  else if (op.f7 == c.SUB){
                            let rs1 = this.registers[op.rs1];
                            let rs2 = this.registers[op.rs2];
                            this.registers[op.rd] = rs1 - rs2;
                        }  else if (op.f7 == c.MUL){
                            let rs1 = this.registers[op.rs1];
                            let rs2 = this.registers[op.rs2];
                            this.registers[op.rd] = rs1 * rs2;
                        }
                    } else if (op.f3 == c.R4){
                        if (op.f7 == c.XOR){
                            let rs1 = this.registers[op.rs1];
                            let rs2 = this.registers[op.rs2];
                            this.registers[op.rd] = rs1 ^ rs2;
                        }  else if (op.f7 == c.DIV){
                            let rs1 = this.registers[op.rs1];
                            let rs2 = this.registers[op.rs2];
                            let rd = parseInt(rs1 / rs2);
                            this.registers[op.rd] = rd;
                        }
                    } else if (op.f3 == c.R5){
                        if (op.f7 == c.OR){
                            let rs1 = this.registers[op.rs1];
                            let rs2 = this.registers[op.rs2];
                            this.registers[op.rd] = rs1 | rs2;
                        }  else if (op.f7 == c.DIVU){
                            let rs1 = this.registers[op.rs1];
                            let rs2 = this.registers[op.rs2];
                            rs1 = Math.abs(rs1);
                            rs2 = Math.abs(rs2);
                            let rd = parseInt(rs1 / rs2);
                            this.registers[op.rd] = rd;
                        }
                    } else if (op.f3 == c.R6){
                        if (op.f7 == c.REM){
                            let rs1 = this.registers[op.rs1];
                            let rs2 = this.registers[op.rs2];
                            this.registers[op.rd] = rs1 % rs2;
                        }
                    } else if (op.f3 == c.R7){
                        if (op.f7 == c.AND){
                            let rs1 = this.registers[op.rs1];
                            let rs2 = this.registers[op.rs2];
                            this.registers[op.rd] = rs1 & rs2;
                        }  else if (op.f7 == c.REMU){
                            let rs1 = this.registers[op.rs1];
                            let rs2 = this.registers[op.rs2];
                            rs1 = Math.abs(rs1);
                            rs2 = Math.abs(rs2);
                            this.registers[op.rd] = rs1 % rs2;
                        }
                    }
                } else if (op.code == c.ECALL) {

                } else if (op.code == c.LABEL) {

                } else if (op.code == c.DIRECTIVE) {
                    if (op.f3 == c.GLOBAL) {
                        if (op.name === "_start") {
                            this.entrySymbol = true;
                        }
                    } else {
                        this.output += "\nwarning: unknown directive";
                    }
                } else {
                    this.output += "\nwarning: unknown instruction";
                }
            }
            this.output += "\n"+len+" instructions executed";
        } else {
            this.output += "\nwarning: no instruction found";
        }
    }

    step() {


    }

}

