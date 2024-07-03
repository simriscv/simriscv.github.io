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
        let addr = 0;
        let view = new DataView(this.stack);     
        for (let i of this.instructions) {
            if (i.code == c.DIRECTIVE && i.f3 == c.DATA) {
                for (let j of i.vars) {
                    if (j.type == c.BYTE){
                        for (let k of j.value) {
                            view.setInt8(addr,k);
                            addr += 1;
                        }
                    } else if (j.type == c.HALF){
                        for (let k of j.value) {
                            view.setInt16(addr,k);
                            addr += 2;
                        }
                    } else if (j.type == c.WORD){
                        for (let k of j.value) {
                            view.setInt32(addr,k);
                            addr += 4;
                        }
                    }  else if (j.type == c.DWORD){
                        for (let k of j.value) {
                            view.setBigInt64(addr,k);
                            addr += 8;
                        }
                    } else if (j.type == c.ASCII || j.type == c.ASCIZ || j.type == c.STRING){
                        for (let k of j.value) {
                            for (let l of k){
                                view.setUint8(addr,l.charCodeAt(0));
                                addr += 1;
                            }
                            if (j.type == c.ASCIZ || j.type == c.STRING) {
                                view.setUint8(addr,0);
                                addr += 1;
                            }
                        }
                    }
                }
            }
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

