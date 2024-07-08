/* instruction constants */

export const DIRECTIVE = 0;
    export const GLOBAL = 0;
    export const DATA = 2;
        export const BYTE = 0;
        export const HALF = 1;
        export const WORD = 2;
        export const DWORD = 3;
        export const ASCII = 4;
        export const ASCIZ = 5;
        export const STRING = 6;
export const LABEL = 1;
export const ECALL = 2;
export const I_TYPE_LOAD = 3
    export const LB = 0
        export const LBI = 0
        export const LBR = 1
        export const LBS = 2
    export const LH = 1
        export const LHI = 0
        export const LHR = 1
        export const LHS = 2
    export const LW = 2
        export const LWI = 0
        export const LWR = 1
        export const LWS = 2    
export const I_TYPE = 19;
    export const ADDI = 0;
    export const XORI = 4;
    export const ORI = 6;
    export const ANDI = 7;
export const LA = 24;
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

export const ADDR = [
    "0xFFFF80", "0xFFFF88", "0xFFFF90", "0xFFFF98",
    "0xFFFFA0", "0xFFFFA8", "0xFFFFB0", "0xFFFFB8",
    "0xFFFFC0", "0xFFFFC8", "0xFFFFD0", "0xFFFFD8",
    "0xFFFFE0", "0xFFFFE8", "0xFFFFF0", "0xFFFFF8",
    "0x000000", "0x000008", "0x000010", "0x000018",
    "0x000020", "0x000028", "0x000030", "0x000038",
    "0x000040", "0x000048", "0x000050", "0x000058",
    "0x000060", "0x000068", "0x000070", "0x000078" ];

