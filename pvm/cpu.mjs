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
        this.fregisters = new Array(32).fill(0.0);
        this.stack = new ArrayBuffer(16777216);
        this.addr = c.ADDR;
        this.instructions = [];
        this.alias = c.ALIAS;
        this.aliasFloat = c.ALIAS_FLOAT;
        this.pc = 0;
        this.debug = false;
        this.flag = flag;
        this.output = "";
        this.entrySymbol = false;
        this.globalvar = []
        this.labels = []
    }

    // initialization
    init() {
        this.registers.fill(0);
        this.pc = 0;
        this.flag.init();
        this.output = "";
        this.entrySymbol = false;
        this.globalvar = [];
        this.labels = [];
    }

    // load global vars to stack[]
    loadStack() {
        let addr = 0;
        let view = new DataView(this.stack);  
        for (let i of this.instructions) {
            if (i.code == c.DIRECTIVE && i.f3 == c.DATA) {
                this.globalvar.push({name:i.name, addr:addr});
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
                    } else if (j.type == c.SKIP) {
                        addr += j.size;
                    } else if (j.type == c.FLOAT){
                        for (let k of j.value) {
                            view.setFloat32(addr,k);
                            addr += 4;
                        }
                    } else if (j.type == c.DOUBLE){
                        for (let k of j.value) {
                            view.setFloat64(addr,k);
                            addr += 8;
                        }
                    }
                }
            } else if (i.code == c.DIRECTIVE && i.f3 == c.BSS) {
                this.globalvar.push({name:i.name, addr:addr});
                for (let j of i.vars) {
                    if (j.type == c.SKIP){
                        addr += j.size;
                    }
                }
            }
        }
    }

    // load labels and instr number to labels[]
    loadLabels() {
        let instr = this.instructions;
        for(let i = 0; i < instr.length; i++) {
            if (instr[i].code == c.LABEL) {
                this.labels.push({label:instr[i].name, instr:(i+1)});
            }
        }       
    }

    run() {
        // initialization
        let threshold = 0;
        this.init();
        this.loadStack();
        this.loadLabels();
        let len = this.instructions.length;

        // pipeline cycle
        if (len != 0) {
            while (this.pc < len) {
                // instruction threshold
                if (threshold++ > 200000){
                    this.output += "Instruction threshold has been reached!\n";
                    return;
                }

                        
                // fetch
                let op = this.instructions[this.pc];
                this.pc++;

                // decode and execute

// ********** I TYPE LOAD **********               
                if (op.code == c.I_TYPE_LOAD) {
                    if (op.f3 == c.LB){
                        if (op.f7 == c.LBR) {
                            let addr = this.registers[op.rs1];
                            let offset = addr + 1;
                            let i8a = new Uint8Array(this.stack.slice(addr,offset));    
                            this.registers[op.rd] = i8a[0]; 
                        } else if (op.f7 == c.LBI) {
                            let addr = this.registers[op.rs1];
                            addr += op.imm;
                            let offset = addr + 1;
                            let i8a = new Uint8Array(this.stack.slice(addr,offset));
                            this.registers[op.rd] = i8a[0];
                        } else if (op.f7 == c.LBS) {
                            let addr = this.locateAddr(op.name);
                            if (addr != null) {
                                let offset = addr + 1;
                                let i8a = new Uint8Array(this.stack.slice(addr,offset));
                                this.registers[op.rd] = i8a[0];
                            } else {
                                this.output += ""+(this.pc-1)+": Error: Cannot find symbol: "+op.name;
                                return; 
                            }
                        }
                    } else if (op.f3 == c.LH) {
                        if (op.f7 == c.LHR) {
                            let addr = this.registers[op.rs1];
                            let offset = addr + 4;
                            let view = new DataView(this.stack.slice(addr,offset));
                            this.registers[op.rd] = view.getUint16();
                        } else if (op.f7 == c.LHI) {
                            let addr = this.registers[op.rs1];
                            addr += op.imm;
                            let offset = addr + 4;
                            let view = new DataView(this.stack.slice(addr,offset));
                            this.registers[op.rd] = view.getUint16();
                        } else if (op.f7 == c.LHS) {
                            let addr = this.locateAddr(op.name);
                            if (addr != null) {
                                let offset = addr + 4;
                                let view = new DataView(this.stack.slice(addr,offset));
                                this.registers[op.rd] = view.getUint16();
                            } else {
                                this.output += ""+(this.pc-1)+": Error: Cannot find symbol: "+op.name;
                                return; 
                            }
                        }
                    } else if (op.f3 == c.LW) {
                        if (op.f7 == c.LWR) {
                            let addr = this.registers[op.rs1];
                            if (addr < 0) addr += c.MEM_SIZE;
                            let offset = addr + 8;
                            let view = new DataView(this.stack.slice(addr,offset));
                            this.registers[op.rd] = view.getUint32();
                        } else if (op.f7 == c.LWI) {
                            let addr = this.registers[op.rs1];
                            addr += op.imm;
                            if (addr < 0) addr += c.MEM_SIZE;
                            let offset = addr + 8;
                            let view = new DataView(this.stack.slice(addr,offset));
                            this.registers[op.rd] = view.getUint32();
                        } else if (op.f7 == c.LWS) {
                            let addr = this.locateAddr(op.name);
                            if (addr != null) {
                                let offset = addr + 8;
                                let view = new DataView(this.stack.slice(addr,offset));
                                this.registers[op.rd] = view.getUint32();
                            } else {
                                this.output += ""+(this.pc-1)+": Error: Cannot find symbol: "+op.name;
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
                    } else if (op.f3 == c.SLLI) {
                        let rs1 = this.registers[op.rs1];
                        this.registers[op.rd] = rs1 << op.imm;
                    } else if (op.f3 == c.SLTI) {
                        let rs1 = this.registers[op.rs1];
                        if (rs1 < op.imm) {
                            this.registers[op.rd] = 1;
                        } else {
                            this.registers[op.rd] = 0;
                        }                        
                    } else if (op.f3 == c.SLTIU) {
                        let rs1 = this.registers[op.rs1];
                        if (Math.abs(rs1) < Math.abs(op.imm)) {
                            this.registers[op.rd] = 1;
                        } else {
                            this.registers[op.rd] = 0;
                        }                        
                    } else if (op.f3 == c.XORI) {
                        let rs1 = this.registers[op.rs1];
                        this.registers[op.rd] = rs1 ^ op.imm;
                    } else if (op.f3 == c.I5) {
                        if (op.f7 == c.SRLI || op.f7 == c.SRAI) {
                            let rs1 = this.registers[op.rs1];
                            this.registers[op.rd] = rs1 >> op.imm;                            
                        }
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
                        this.output += ""+(this.pc-1)+": Error: Cannot find symbol: "+op.name;
                        return; 
                    }
                } 

// ********** S TYPE STORE **********               
                else if (op.code == c.S_TYPE) {
                    let view = new DataView(this.stack);
                    if (op.f3 == c.SB){
                        if (op.f7 == c.SBR) {
                            let addr = this.registers[op.rs1];
                            let value = this.registers[op.rs2];
                            let buffer = new ArrayBuffer(4);
                            let dv = new DataView(buffer);
                            dv.setInt32(0, value);
                            let i8a = new Uint8Array(buffer);
                            view.setInt8(addr,i8a[3]);
                        } else if (op.f7 == c.SBI) {
                            let addr = this.registers[op.rs1];
                            addr += op.imm;
                            let value = this.registers[op.rs2];
                            let buffer = new ArrayBuffer(4);
                            let dv = new DataView(buffer);
                            dv.setInt32(0, value);
                            let i8a = new Uint8Array(buffer);
                            view.setInt8(addr,i8a[3]);
                        } else if (op.f7 == c.SBS) {
                            let addr = this.locateAddr(op.name);
                            if (addr != null) {
                                let value = this.registers[op.rs2];
                                let buffer = new ArrayBuffer(4);
                                let dv = new DataView(buffer);
                                dv.setInt32(0, value);
                                let i8a = new Uint8Array(buffer);
                                view.setInt8(addr,i8a[3]);
                            } else {
                                this.output += ""+(this.pc-1)+": Error: Cannot find symbol: "+op.name;
                                return; 
                            }
                        }
                    } else if (op.f3 == c.SH) {
                        if (op.f7 == c.SHR) {
                            let addr = this.registers[op.rs1];
                            let value = this.registers[op.rs2];
                            let buffer = new ArrayBuffer(4);
                            let dv = new DataView(buffer);
                            dv.setInt32(0, value);
                            let i8a = new Uint16Array(buffer);
                            view.setInt16(addr,i8a[1]);
                        } else if (op.f7 == c.SHI) {
                            let addr = this.registers[op.rs1];
                            addr += op.imm;
                            let value = this.registers[op.rs2];
                            let buffer = new ArrayBuffer(4);
                            let dv = new DataView(buffer);
                            dv.setInt32(0, value);
                            let i8a = new Uint16Array(buffer);
                            view.setInt16(addr,i8a[1]);
                        } else if (op.f7 == c.SHS) {
                            let addr = this.locateAddr(op.name);
                            if (addr != null) {
                                let value = this.registers[op.rs2];
                                let buffer = new ArrayBuffer(4);
                                let dv = new DataView(buffer);
                                dv.setInt32(0, value);
                                let i8a = new Uint16Array(buffer);
                                view.setInt16(addr,i8a[1]);
                            } else {
                                this.output += ""+(this.pc-1)+": Error: Cannot find symbol: "+op.name;
                                return; 
                            }
                        }
                    } else if (op.f3 == c.SW) {
                        if (op.f7 == c.SWR) {
                            let addr = this.registers[op.rs1];
                            let value = this.registers[op.rs2];
                            if (addr < 0) addr += c.MEM_SIZE;
                            view.setInt32(addr,value);
                        } else if (op.f7 == c.SWI) {
                            let addr = this.registers[op.rs1];
                            let value = this.registers[op.rs2];
                            addr += op.imm;
                            if (addr < 0) addr += c.MEM_SIZE;                                                     
                            view.setInt32(addr,value);
                        } else if (op.f7 == c.SWS) {
                            let addr = this.locateAddr(op.name);
                            if (addr != null) {
                                let value = this.registers[op.rs2];
                                addr += op.imm;                            
                                view.setInt32(addr,value);
                            } else {
                                this.output += ""+(this.pc-1)+": Error: Cannot find symbol: "+op.name;
                                return; 
                            }
                        }
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
                    } else if (op.f3 == c.R1) {
                        if (op.f7 == c.SLL){
                            let rs1 = this.registers[op.rs1];
                            let rs2 = this.registers[op.rs2];
                            this.registers[op.rd] = rs1 << rs2;
                        }  
                    } else if (op.f3 == c.R2) {
                        if (op.f3 == c.SLT) {
                            let rs1 = this.registers[op.rs1];
                            let rs2 = this.registers[op.rs2];
                            if (rs1 < rs2) {
                                this.registers[op.rd] = 1;
                            } else {
                                this.registers[op.rd] = 0;
                            }                        
                        }
                    } else if (op.f3 == c.R3) {
                        if (op.f3 == c.SLTU) {
                            let rs1 = this.registers[op.rs1];
                            let rs2 = this.registers[op.rs2];
                            if (Math.abs(rs1) < Math.abs(rs2)) {
                                this.registers[op.rd] = 1;
                            } else {
                                this.registers[op.rd] = 0;
                            }                        
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
                        } else if (op.f7 == c.SRL || op.f7 == c.SRA){
                            let rs1 = this.registers[op.rs1];
                            let rs2 = this.registers[op.rs2];
                            this.registers[op.rd] = rs1 >> rs2;
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

// ********** FD TYPE **********
                else if (op.code == c.FD_TYPE) {
                    if (op.f3 == c.FADDS || op.f3 == c.FADDD) {
                        let fs1 = this.fregisters[op.fs1];
                        let fs2 = this.fregisters[op.fs2];
                        this.fregisters[op.fd] = fs1 + fs2;
                    } else if (op.f3 == c.FSUBS || op.f3 == c.FSUBD) {
                        let fs1 = this.fregisters[op.fs1];
                        let fs2 = this.fregisters[op.fs2];
                        this.fregisters[op.fd] = fs1 - fs2;
                    } else if (op.f3 == c.FMULS || op.f3 == c.FMULD) {
                        let fs1 = this.fregisters[op.fs1];
                        let fs2 = this.fregisters[op.fs2];
                        this.fregisters[op.fd] = fs1 * fs2;
                    } else if (op.f3 == c.FDIVS || op.f3 == c.FDIVD) {
                        let fs1 = this.fregisters[op.fs1];
                        let fs2 = this.fregisters[op.fs2];
                        this.fregisters[op.fd] = fs1 / fs2;
                    } else if (op.f3 == c.FMINS || op.f3 == c.FMIND) {
                        let fs1 = this.fregisters[op.fs1];
                        let fs2 = this.fregisters[op.fs2];
                        this.fregisters[op.fd] = Math.min(fs1, fs2);
                    } else if (op.f3 == c.FMAXS || op.f3 == c.FMAXD) {
                        let fs1 = this.fregisters[op.fs1];
                        let fs2 = this.fregisters[op.fs2];
                        this.fregisters[op.fd] = Math.max(fs1, fs2);
                    } else if (op.f3 == c.FSQRTS || op.f3 == c.FSQRTD) {
                        let fs1 = this.fregisters[op.fs1];
                        this.fregisters[op.fd] = Math.sqrt(fs1);
                    } else if (op.f3 == c.FEQS || op.f3 == c.FEQD) {
                        let fs1 = this.fregisters[op.fs1];
                        let fs2 = this.fregisters[op.fs2];
                        this.registers[op.rd] = (fs1==fs2)?1:0;
                    } else if (op.f3 == c.FLTS || op.f3 == c.FLTD) {
                        let fs1 = this.fregisters[op.fs1];
                        let fs2 = this.fregisters[op.fs2];
                        this.registers[op.rd] = (fs1<fs2)?1:0;
                    } else if (op.f3 == c.FLES || op.f3 == c.FLED) {
                        let fs1 = this.fregisters[op.fs1];
                        let fs2 = this.fregisters[op.fs2];
                        this.registers[op.rd] = (fs1<=fs2)?1:0;
                    } else if (op.f3 == c.FLW) {
                        let addr = this.registers[op.rs1];
                        let view = new DataView(this.stack.slice(addr,addr+4));
                        this.fregisters[op.fd] = view.getFloat32();
                    } else if (op.f3 == c.FLWI) {
                        let addr = this.registers[op.rs1];
                        addr += op.imm;
                        let view = new DataView(this.stack.slice(addr,addr+4));
                        this.fregisters[op.fd] = view.getFloat32();
                    } else if (op.f3 == c.FSW) {
                        let addr = this.registers[op.rs1];
                        let value = this.fregisters[op.fs2];
                        let view = new DataView(this.stack);
                        view.setFloat32(addr,value);
                    } else if (op.f3 == c.FSWI) {
                        let addr = this.registers[op.rs1];
                        let value = this.fregisters[op.fs2];
                        let view = new DataView(this.stack);
                        addr += op.imm;                            
                        view.setFloat32(addr,value);
                    } else if (op.f3 == c.FLD) {
                        let addr = this.registers[op.rs1];
                        let view = new DataView(this.stack.slice(addr,addr+8));
                        this.fregisters[op.fd] = view.getFloat64();
                    } else if (op.f3 == c.FLDI) {
                        let addr = this.registers[op.rs1];
                        addr += op.imm;
                        let view = new DataView(this.stack.slice(addr,addr+8));
                        this.fregisters[op.fd] = view.getFloat64();
                    } else if (op.f3 == c.FSD) {
                        let addr = this.registers[op.rs1];
                        let value = this.fregisters[op.fs2];
                        let view = new DataView(this.stack);
                        view.setFloat64(addr,value);
                    } else if (op.f3 == c.FSDI) {
                        let addr = this.registers[op.rs1];
                        let value = this.fregisters[op.fs2];
                        let view = new DataView(this.stack);
                        addr += op.imm;                            
                        view.setFloat64(addr,value);
                    } else if (op.f3 == c.FCVTWS || op.f3 == c.FCVTWD) {
                        let fs1 = this.fregisters[op.fs1];
                        this.registers[op.rd] = Math.round(fs1);
                    } else if (op.f3 == c.FCVTSW || op.f3 == c.FCVTDW) {
                        let rs1 = this.registers[op.rs1];
                        this.fregisters[op.fd] = parseFloat(rs1);
                    } else if (op.f3 == c.FMVXW) {                        
                        let fs1 = this.fregisters[op.fs1];
                        let b = new ArrayBuffer(4);
                        let f = new Float32Array(b);
                        f[0] = fs1;
                        let i = new Uint32Array(b);
                        this.registers[op.fd] = i[0];
                    } else if (op.f3 == c.FMVWX) {
                        let value = this.registers[op.rs1];
                        this.fregisters[op.fd] = value;                        
                    } else if (op.f3 == c.FCVTSD) {
                        let value = this.fregisters[op.fs1];
                        value = doubleToFloat(value);
                        this.fregisters[op.fd] = value;  
                    } else if (op.f3 == c.FCVTDS) {
                        let value = this.fregisters[op.fs1];
                        value = floatToDouble(value);
                        this.fregisters[op.fd] = value;                          
                    }
                }

// ********** B TYPE **********
                else if (op.code == c.B_TYPE) {
                    if (op.f3 == c.BEQ) {
                        let rs1 = this.registers[op.rs1];
                        let rs2 = this.registers[op.rs2];
                        if (rs1 == rs2) {
                            let instr = this.locateLabel(op.label);
                            if (instr != null) {
                                this.pc = instr;
                            } else {
                                this.output += ""+(this.pc-1)+": Error: Cannot find label: "+op.label;
                                return; 
                            }
                        }
                    } else if (op.f3 == c.BNE) {
                        let rs1 = this.registers[op.rs1];
                        let rs2 = this.registers[op.rs2];
                        if (rs1 != rs2) {
                            let instr = this.locateLabel(op.label);
                            if (instr != null) {
                                this.pc = instr;
                            } else {
                                this.output += ""+(this.pc-1)+": Error: Cannot find label: "+op.label;
                                return; 
                            }
                        }
                    } else if (op.f3 == c.BLT) {
                        let rs1 = this.registers[op.rs1];
                        let rs2 = this.registers[op.rs2];
                        if (rs1 < rs2) {
                            let instr = this.locateLabel(op.label);
                            if (instr != null) {
                                this.pc = instr;
                            } else {
                                this.output += ""+(this.pc-1)+": Error: Cannot find label: "+op.label;
                                return; 
                            }
                        }
                    } else if (op.f3 == c.BGE) {
                        let rs1 = this.registers[op.rs1];
                        let rs2 = this.registers[op.rs2];
                        if (rs1 >= rs2) {
                            let instr = this.locateLabel(op.label);
                            if (instr != null) {
                                this.pc = instr;
                            } else {
                                this.output += ""+(this.pc-1)+": Error: Cannot find label: "+op.label;
                                return; 
                            }
                        }
                    } else if (op.f3 == c.BLTU) {
                        let rs1 = this.registers[op.rs1];
                        let rs2 = this.registers[op.rs2];
                        if (Math.abs(rs1) < Math.abs(rs2)) {
                            let instr = this.locateLabel(op.label);
                            if (instr != null) {
                                this.pc = instr;
                            } else {
                                this.output += ""+(this.pc-1)+": Error: Cannot find label: "+op.label;
                                return; 
                            }
                        }
                    } else if (op.f3 == c.BGEU) {
                        let rs1 = this.registers[op.rs1];
                        let rs2 = this.registers[op.rs2];
                        if (Math.abs(rs1) >= Math.abs(rs2)) {
                            let instr = this.locateLabel(op.label);
                            if (instr != null) {
                                this.pc = instr;
                            } else {
                                this.output += ""+(this.pc-1)+": Error: Cannot find label: "+op.label;
                                return; 
                            }
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
                            let offset = addr + this.registers[12];
                            let i8a = new Uint8Array(this.stack.slice(addr,offset));
                            // Encuentra la posición del primer 0
                            let index = i8a.indexOf(0);

                            if (index !== -1) {
                                // Corta el arreglo en el índice del primer 0
                                i8a = i8a.slice(0, index);
                            }

                            
                            let str = String.fromCharCode.apply(null, i8a);
                            this.output += str;
                        }
                        
                    } else if (this.registers[17] == 63) {
                        if (this.registers[10] == 0) {
                            let view = new DataView(this.stack);
                            let addr = this.registers[11];
                            let offset = this.registers[12];
                            let stdin = prompt("Standard input:");
                            if (stdin != null) {
                                if (stdin.length < offset) {
                                    stdin += '\n';
                                } else {
                                    stdin = stdin.slice(0, offset) + '\n';
                                }
                                for (let k of stdin) {
                                    view.setUint8(addr,k.charCodeAt(0));
                                    addr += 1;
                                } 
                                this.output += stdin;
                            }

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
                } 

// ********** J TYPE **********
                else if (op.code == c.JALR) {
                    if (op.rd != 0)
                        this.registers[op.rd] = this.pc;
                    let rs1 = this.registers[op.rs1];
                    this.pc = rs1+op.imm;                    
                } else if (op.code == c.JAL) {
                    if (op.rd != 0)
                        this.registers[op.rd] = this.pc;
                    let instr = this.locateLabel(op.label);
                    if (instr != null) {
                        this.pc = instr;
                    } else {
                        this.output += ""+(this.pc-1)+": Error: Cannot find label: "+op.label;
                        return; 
                    }                    
                } else {
                    //this.output += "\nwarning: unknown instruction";
                }
            }
            //this.output += "\n"+len+" instructions executed";
        } else {
            this.output += "Warning: no instruction found\n";
        }
    }

    locateAddr(name) {
        let item = this.globalvar.find(obj=>{return obj.name===name});
        if (item)
            return item.addr;
        else
            return null;
    }

    locateLabel(label) {
        let item = this.labels.find(obj=>{return obj.label===label});
        if (item)
            return item.instr;
        else
            return null;
    }


}

// Convertir de float (32 bits) a double (64 bits)
function floatToDouble(floatNumber) {
    const buffer = new ArrayBuffer(8); // Crear un buffer de 8 bytes (64 bits)
    const float32View = new Float32Array(buffer); // Vista de 32 bits para el buffer
    float32View[0] = floatNumber; // Escribir el float en el buffer
    const float64View = new Float64Array(buffer); // Vista de 64 bits para el mismo buffer
    return float64View[0]; // Leer el double desde el buffer
}

// Convertir de double (64 bits) a float (32 bits)
function doubleToFloat(doubleNumber) {
    const buffer = new ArrayBuffer(8); // Crear un buffer de 8 bytes (64 bits)
    const float64View = new Float64Array(buffer); // Vista de 64 bits para el buffer
    float64View[0] = doubleNumber; // Escribir el double en el buffer
    const float32View = new Float32Array(buffer); // Vista de 32 bits para el mismo buffer
    return float32View[0]; // Leer el float desde el buffer
}

