/* instruction constants */

export const DIRECTIVE = 0;
    export const GLOBAL = 0;
export const LABEL = 1;
export const ECALL = 2;
export const I_TYPE_LOAD = 3
export const I_TYPE = 19;
    export const ADDI = 0;
    export const XORI = 4;
    export const ORI = 6;
    export const ANDI = 7;
export const R_TYPE = 51;
    export const R0 = 0;
        export const ADD = 0;
        export const SUB = 32;
        export const MUL = 1;
    export const R4 = 4;
        export const XOR = 0;
        export const DIV = 1;
    export const R5 = 5;
        export const DIVU = 1;
    export const R6 = 6;
        export const OR = 0;
        export const REM = 1;
    export const R7 = 7;
        export const AND = 0;
        export const REMU = 1;
    
export const ALIAS = [
    "zero", "ra", "sp", "gp", "tp", "t0", "t1", "t2", 
    "s0/fp", "s1", "a0", "a1", "a2", "a3", "a4", "a5", 
    "a6", "a7", "s2", "s3", "s4", "s5", "s6", "s7", 
    "s8", "s9", "s10", "s11", "t3", "t4", "t5", "t6" ];



