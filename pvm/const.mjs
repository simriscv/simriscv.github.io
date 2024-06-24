/* instruction constants */

export const DIRECTIVE = 0;
    export const GLOBAL = 0;
export const LABEL = 1;
export const ECALL = 2;
export const I_TYPE_LOAD = 3
export const I_TYPE = 19;
    export const ADDI = 0;
export const R_TYPE = 51;
    export const ADD_SUB = 0;
        export const ADD = 0;
        export const SUB = 32;
export const ALIAS = [
    "zero", "ra", "sp", "gp", "tp", "t0", "t1", "t2", 
    "s0/fp", "s1", "a0", "a1", "a2", "a3", "a4", "a5", 
    "a6", "a7", "s1", "s2", "s3", "s4", "s5", "s6", "s7", 
    "s8", "s9", "s10", "s11", "t3", "t4", "t5", "t6" ];



