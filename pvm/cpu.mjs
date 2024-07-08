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
        this.globalvar = []
    }

    init() {
        this.registers.fill(0);
        this.pc = 0;
        this.flag.init();
        this.output = "";
        this.entrySymbol = false;
        this.globalvar = [];
    }

    loadStack() {
        let addr = 0;
        let view = new DataView(this.stack);  
        for (let i of this.instructions) {
            if (i.code == c.DIRECTIVE && i.f3 == c.DATA) {
                this.globalvar.push({name:i.name, addr:addr});
                for (let j of i.vars) {
                    if (j.type == c.BYTE){
                        for (let k of j.value) {
                            view.setInt8(addr,k,);
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
                    } else if (j.type == c.DWORD){
                        for (let k of j.value) {
                            view.setBigInt64(addr,k);
                            addr += 8;
                        }
                    } else if (j.type == c.ASCII || j.type == c.ASCIZ || j.type == c.STRING){
                        let escape = false;
                        for (let k of j.value) {
                            if (escape) {
                                if (k == "n") {
                                    view.setUint8(addr,10);
                                    addr += 1;
                                } else if (k == "t") {
                                    view.setUint8(addr,9);
                                    addr += 1;
                                } else {
                                    view.setUint8(addr,k.charCodeAt(0));
                                    addr += 1;
                                }
                                escape = false;
                            } else {
                                if (k == "\\") {
                                    escape = true;
                                    continue;
                                } else {
                                    view.setUint8(addr,k.charCodeAt(0));
                                    addr += 1;
                                }
                            }
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

                // decode and execute

// ********** I TYPE LOAD **********               
                if (op.code == c.I_TYPE_LOAD) {
                    if (op.f3 == c.LB){
                        if (op.f7 == c.LBI) {
                            let addr = this.registers[op.rs1];
                            addr += op.imm;
                            let offset = 1;
                            let i8a = new Uint8Array(this.stack.slice(addr,offset));
                            this.registers[op.rd] = i8a[0];
                        } else if (op.f7 == c.LBR) {
                            let addr = this.registers[op.rs1];
                            let offset = 1;
                            let i8a = new Uint8Array(this.stack.slice(addr,offset));
                            this.registers[op.rd] = i8a[0];
                        } else if (op.f7 == c.LBS) {
                            let addr = this.locateAddr(op.name);
                            if (addr != null) {
                                let offset = 1;
                                let i8a = new Uint8Array(this.stack.slice(addr,offset));
                                this.registers[op.rd] = i8a[0];
                            } else {
                                this.output += "\n"+(this.pc-1)+": Error: Cannot find symbol: "+op.name;
                                return; 
                            }
                        }
                    } else if (op.f3 == c.LH) {
                        if (op.f7 == c.LHI) {
                            let addr = this.registers[op.rs1];
                            addr += op.imm;
                            let offset = 4;
                            let view = new DataView(this.stack.slice(addr,offset));
                            this.registers[op.rd] = view.getUint16();
                        } else if (op.f7 == c.LHR) {
                            let addr = this.registers[op.rs1];
                            let offset = 4;
                            let view = new DataView(this.stack.slice(addr,offset));
                            this.registers[op.rd] = view.getUint16();
                        } else if (op.f7 == c.LHS) {
                            let addr = this.locateAddr(op.name);
                            if (addr != null) {
                                let offset = 4;
                                let view = new DataView(this.stack.slice(addr,offset));
                                this.registers[op.rd] = view.getUint16();
                            } else {
                                this.output += "\n"+(this.pc-1)+": Error: Cannot find symbol: "+op.name;
                                return; 
                            }
                        }
                    } else if (op.f3 == c.LW) {
                        if (op.f7 == c.LWI) {
                            let addr = this.registers[op.rs1];
                            addr += op.imm;
                            let offset = 8;
                            let view = new DataView(this.stack.slice(addr,offset));
                            this.registers[op.rd] = view.getUint32();
                        } else if (op.f7 == c.LWR) {
                            let addr = this.registers[op.rs1];
                            let offset = 8;
                            let view = new DataView(this.stack.slice(addr,offset));
                            this.registers[op.rd] = view.getUint32();
                        } else if (op.f7 == c.LWS) {
                            let addr = this.locateAddr(op.name);
                            if (addr != null) {
                                let offset = 8;
                                let view = new DataView(this.stack.slice(addr,offset));
                                this.registers[op.rd] = view.getUint32();
                            } else {
                                this.output += "\n"+(this.pc-1)+": Error: Cannot find symbol: "+op.name;
                                return; 
                            }
                        }
                    }
                } 

// ********** I TYPE **********
                else if (op.code == c.I_TYPE) {
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
                }

// ********** LOAD ADDRESS **********                
                else if(op.code == c.LA){
                    let addr = this.locateAddr(op.name);
                    if (addr != null) {
                        this.registers[op.rd] = addr;
                    } else {
                        this.output += "\n"+(this.pc-1)+": Error: Cannot find symbol: "+op.name;
                        return; 
                    }
                } 

// ********** R TYPE **********
                else if (op.code == c.R_TYPE) {
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
                } 

// ********** ECALL **********
                else if (op.code == c.ECALL) {
                    if (this.registers[17] == 93) {
                        //this.output += "\n"+len+" instructions executed";
                        return; 
                    } else if (this.registers[17] == 64) {
                        if (this.registers[10] == 1) {
                            let addr = this.registers[11];
                            let offset = this.registers[12];
                            let i8a = new Uint8Array(this.stack.slice(addr,offset));
                            let str = String.fromCharCode.apply(null, i8a);
                            this.output += str;
                        }
                        
                    }

                }

// ********** OTHERS **********
                else if (op.code == c.LABEL) {

                } else if (op.code == c.DIRECTIVE) {
                    if (op.f3 == c.GLOBAL) {
                        if (op.name === "_start") {
                            this.entrySymbol = true;
                        }
                    } else {
                        //this.output += "\nwarning: unknown directive";
                    }
                } else {
                    //this.output += "\nwarning: unknown instruction";
                }
            }
            //this.output += "\n"+len+" instructions executed";
        } else {
            this.output += "\nwarning: no instruction found";
        }
    }

    locateAddr(name) {
        let item = this.globalvar.find(obj=>{return obj.name===name});
        if (item)
            return item.addr;
        else
            return null;
    }

}

