// Luis Espino
// 2024

{	
	let i = [];		// opcodes array
	let s = 0; 		// 0 text 1 data 2 bss 3 rodata 
}

program
	=  statements {return i	;}
    
statements 
	= statement *

statement
	= __ stmt:label	comment? end?	
		{ i.push(stmt); }
    / __ stmt:directive	
    / __ stmt:instruction comment? end
		{ i.push(stmt); }
    / __ comments
    
label
	= n:name _ ":" 
		{ return { code: 1, name: n }; }

directive
	= "."("global "i/"globl "i) _ n:name comment? end 	
 		{ i.push({ code:0, f3:0, name:n }); }
	/ data
	/ bss
   
    / ".text"i comment? end
 		{ i.push({ code:0, f3:3, name:"text" }); }

data
	= __ ".data"i comment? end (declaration)*


declaration
	= __ n:name _ ":" tail:(__ definition comment? end)+
		{
			i.push({ code:0, f3:2, name:n,
			vars:[].concat(tail.map(function(i){return i[1];}))});
		}         
definition
	= t:type v:value 
    	{ return { type:t, value:v }; }
	/ t:type_array head:values tail:(comma values)*
		{
			return {type:t, 
			value:[head].concat(tail.map(function(i){return i[1];}))};
		}
	/ t:type_float head:float tail:(comma float)*
		{
			return {type:t, 
			value:[head].concat(tail.map(function(i){return i[1];}))};
		}
	/ t:type_bss s:bss_size 
    	{ return { type:t, size:s }; }

type
	= ".ascii "i { return 4; }
	/ ".asciz "i { return 5; }
	/ ".string "i { return 6; }

value
	= "\""str:("\t"/" "/"!"/[#-~])*"\"" { return str.join("");}

type_array
	= ".byte "i { return 0; }
	/ ".half "i { return 1; }
	/ ".word "i { return 2; }
	/ ".dword "i { return 3; }

values
	= imm:imm { return imm;}

type_float
	= ".float "i { return 8; }
	/ ".double "i { return 9; }

type_bss
	= ".skip "i { return 7; }
	/ ".space "i { return 7; }
	
bss_size
	= _ s:("+")? _ n:([1-9][0-9]*)
    	{ return parseInt(n.join("")); }

bss
	= __ ".bss"i end (bssdeclaration)*

bssdeclaration
	= __ n:name _ ":" tail:(__ bssdefinition comment? end)+
		{
			i.push({ code:0, f3:4, name:n,
			vars:[].concat(tail.map(function(i){return i[1];}))});
		}         
bssdefinition
	= t:type_bss s:bss_size 
    	{ return { type:t, size:s }; }

instruction
	// load immediate I
	= op:"lb "i rd:reg comma _ "(" rs1:reg _ ")"  
		{ return { code:3, f3:0, f7:0, rd:rd, rs1:rs1 }; }
	/ op:"lb "i rd:reg comma imm:imm _ "(" rs1:reg _ ")"  
		{ return { code:3, f3:0, f7:1, rd:rd, rs1:rs1, imm:imm }; }
	/ op:"lb "i rd:reg comma _ name:name  
		{ return { code:3, f3:0, f7:2, rd:rd, name:name }; }
	/ op:"lh "i rd:reg comma _ "(" rs1:reg _ ")"
		{ return { code:3, f3:1, f7:0, rd:rd, rs1:rs1 }; }
	/ op:"lh "i rd:reg comma imm:imm _ "(" rs1:reg _ ")"  
		{ return { code:3, f3:1, f7:1, rd:rd, rs1:rs1, imm:imm }; }
	/ op:"lh "i rd:reg comma _ name:name
		{ return { code:3, f3:1, f7:2, rd:rd, name:name }; }
	/ op:"lw "i rd:reg comma _ "(" rs1:reg _ ")"
		{ return { code:3, f3:2, f7:0, rd:rd, rs1:rs1 }; }
	/ op:"lw "i rd:reg comma imm:imm _ "(" rs1:reg _ ")"  
		{ return { code:3, f3:2, f7:1, rd:rd, rs1:rs1, imm:imm }; }
	/ op:"lw "i rd:reg comma _ name:name
		{ return { code:3, f3:2, f7:2, rd:rd, name:name }; }

	// arithmetic immediate I
	/ op:"addi "i rd:reg comma rs1:reg comma imm:imm
		{ return { code: 19, f3: 0, rd:rd, rs1:rs1, imm:imm }; }
	/ op:"slli "i rd:reg comma rs1:reg comma imm:imm
		{ return { code: 19, f3: 1, rd:rd, rs1:rs1, imm:imm }; }
	/ op:"slti "i rd:reg comma rs1:reg comma imm:imm
		{ return { code: 19, f3: 2, rd:rd, rs1:rs1, imm:imm }; }
	/ op:"slitu "i rd:reg comma rs1:reg comma imm:imm
		{ return { code: 19, f3: 3, rd:rd, rs1:rs1, imm:imm }; }
	/ op:"xori "i rd:reg comma rs1:reg comma imm:imm
		{ return { code: 19, f3: 4, rd:rd, rs1:rs1, imm:imm }; }
	/ op:"srli "i rd:reg comma rs1:reg comma imm:imm
		{ return { code: 19, f3: 5, f7:0, rd:rd, rs1:rs1, imm:imm }; }
	/ op:"srai "i rd:reg comma rs1:reg comma imm:imm
		{ return { code: 19, f3: 5, f7:32, rd:rd, rs1:rs1, imm:imm }; }
	/ op:"ori "i rd:reg comma rs1:reg comma imm:imm
		{ return { code: 19, f3: 6, rd:rd, rs1:rs1, imm:imm }; }
	/ op:"andi "i rd:reg comma rs1:reg comma imm:imm
		{ return { code: 19, f3: 7, rd:rd, rs1:rs1, imm:imm }; }

	// store S
	/ op:"sb "i rs2:reg comma _ "(" rs1:reg _ ")"  
		{ return { code:35, f3:0, f7:0, rs2:rs2, rs1:rs1 }; }
	/ op:"sb "i rs2:reg comma imm:imm _ "(" rs1:reg _ ")"  
		{ return { code:35, f3:0, f7:1, rs2:rs2, rs1:rs1, imm:imm }; }
	/ op:"sb "i rs2:reg comma _ name:name  
		{ return { code:35, f3:0, f7:2, rs2:rs2, name:name }; }
	/ op:"sh "i rs2:reg comma _ "(" rs1:reg _ ")"
		{ return { code:35, f3:1, f7:0, rs2:rs2, rs1:rs1 }; }
	/ op:"sh "i rs2:reg comma imm:imm _ "(" rs1:reg _ ")"  
		{ return { code:35, f3:1, f7:1, rs2:rs2, rs1:rs1, imm:imm }; }
	/ op:"sh "i rs2:reg comma _ name:name
		{ return { code:35, f3:1, f7:2, rs2:rs2, name:name }; }
	/ op:"sw "i rs2:reg comma _ "(" rs1:reg _ ")"
		{ return { code:35, f3:2, f7:0, rs2:rs2, rs1:rs1 }; }
	/ op:"sw "i rs2:reg comma imm:imm _ "(" rs1:reg _ ")"  
		{ return { code:35, f3:2, f7:1, rs2:rs2, rs1:rs1, imm:imm }; }
	/ op:"sw "i rs2:reg comma _ name:name
		{ return { code:35, f3:2, f7:2, rs2:rs2, name:name }; }

	// arithmetic R
	/ op:"add "i rd:reg comma rs1:reg comma rs2:reg
		{ return { code: 51, f3: 0, f7: 0, rd:rd, rs1:rs1, rs2:rs2 }; }
 	/ op:"sub "i rd:reg comma rs1:reg comma rs2:reg
		{ return { code: 51, f3: 0, f7: 32, rd:rd, rs1:rs1, rs2:rs2 }; }

	// RVM arithmetic R
 	/ op:"mul "i rd:reg comma rs1:reg comma rs2:reg
		{ return { code: 51, f3: 0, f7: 1, rd:rd, rs1:rs1, rs2:rs2 }; }
 	/ op:"div "i rd:reg comma rs1:reg comma rs2:reg
		{ return { code: 51, f3: 4, f7: 1, rd:rd, rs1:rs1, rs2:rs2 }; }
 	/ op:"divu "i rd:reg comma rs1:reg comma rs2:reg
		{ return { code: 51, f3: 5, f7: 1, rd:rd, rs1:rs1, rs2:rs2 }; }
 	/ op:"rem "i rd:reg comma rs1:reg comma rs2:reg
		{ return { code: 51, f3: 6, f7: 1, rd:rd, rs1:rs1, rs2:rs2 }; }
 	/ op:"remu "i rd:reg comma rs1:reg comma rs2:reg
		{ return { code: 51, f3: 7, f7: 1, rd:rd, rs1:rs1, rs2:rs2 }; }

	// logic R
	/ op:"sll "i rd:reg comma rs1:reg comma rs2:reg
		{ return { code: 51, f3: 1, f7: 0, rd:rd, rs1:rs1, rs2:rs2 }; }
	/ op:"slt "i rd:reg comma rs1:reg comma rs2:reg
		{ return { code: 51, f3: 2, f7: 0, rd:rd, rs1:rs1, rs2:rs2 }; }
	/ op:"sltu "i rd:reg comma rs1:reg comma rs2:reg
		{ return { code: 51, f3: 3, f7: 0, rd:rd, rs1:rs1, rs2:rs2 }; }
	/ op:"xor "i rd:reg comma rs1:reg comma rs2:reg
		{ return { code: 51, f3: 4, f7: 0, rd:rd, rs1:rs1, rs2:rs2 }; }
	/ op:"srl "i rd:reg comma rs1:reg comma rs2:reg
		{ return { code: 51, f3: 5, f7: 0, rd:rd, rs1:rs1, rs2:rs2 }; }
	/ op:"sra "i rd:reg comma rs1:reg comma rs2:reg
		{ return { code: 51, f3: 5, f7: 32, rd:rd, rs1:rs1, rs2:rs2 }; }
	/ op:"or "i rd:reg comma rs1:reg comma rs2:reg
		{ return { code: 51, f3: 6, f7: 0, rd:rd, rs1:rs1, rs2:rs2 }; }
	/ op:"and "i rd:reg comma rs1:reg comma rs2:reg
		{ return { code: 51, f3: 7, f7: 0, rd:rd, rs1:rs1, rs2:rs2 }; }
		
	// logic immediate I
	/ op:"andi "i rd:reg comma rs1:reg comma imm:imm
		{ return { code: 19, f3: 7, rd:rd, rs1:rs1, imm:imm }; }
	/ op:"ori "i rd:reg comma rs1:reg comma imm:imm
		{ return { code: 19, f3: 6, rd:rd, rs1:rs1, imm:imm }; }
	/ op:"xori "i rd:reg comma rs1:reg comma imm:imm
		{ return { code: 19, f3: 4, rd:rd, rs1:rs1, imm:imm }; }

	// branch B
	/ op:"beq "i rs1:reg comma rs2:reg comma _ label:name
		{ return { code: 99, f3: 0, rs1:rs1, rs2:rs2, label:label }; }
	/ op:"bne "i rs1:reg comma rs2:reg comma _ label:name
		{ return { code: 99, f3: 1, rs1:rs1, rs2:rs2, label:label }; }
	/ op:"blt "i rs1:reg comma rs2:reg comma _ label:name
		{ return { code: 99, f3: 4, rs1:rs1, rs2:rs2, label:label }; }
	/ op:"bge "i rs1:reg comma rs2:reg comma _ label:name
		{ return { code: 99, f3: 5, rs1:rs1, rs2:rs2, label:label }; }
	/ op:"bltu "i rs1:reg comma rs2:reg comma _ label:name
		{ return { code: 99, f3: 6, rs1:rs1, rs2:rs2, label:label }; }
	/ op:"bgeu "i rs1:reg comma rs2:reg comma _ label:name
		{ return { code: 99, f3: 7, rs1:rs1, rs2:rs2, label:label }; }

	// jump J
	/ op:"jalr "i rd:reg comma rs1:reg comma imm:imm
		{ return { code: 103, rd:rd, rs1:rs1, imm:imm }; }
	/ op:"jal "i rd:reg comma _ label:name
		{ return { code: 111, rd:rd, label:label }; }


	// pseudo
	/ op:"nop"i 
 		{ return { code:19, f3:0, rd:0, rs1:0, imm:0 }; }
 	/ op:"li "i rd:reg comma imm:imm // addi rs1=x0
		{ return { code:19, f3:0, rd:rd, rs1:0, imm:imm }; }
	/ op:"mv "i rd:reg comma rs1:reg // addi imm=0
		{ return { code:19, f3:0, rd:rd, rs1:rs1, imm:0 }; }
	/ op:"not "i rd:reg comma rs1:reg // xori rs2=-1
		{ return { code:19, f3:4, rd:rd, rs1:rs1, rs2:-1 }; }
	/ op:"neg "i rd:reg comma rs1:reg // sub rs2=rs1 rs1=0
		{ return { code:51, f3:0, f7:32, rd:rd, rs1:0, rs2:rs1 }; }
	/ op:"seqz "i rd:reg comma rs1:reg
		{ return { code: 19, f3: 3, rd:rd, rs1:rs1, imm:1 }; }
	/ op:"snez "i rd:reg comma rs1:reg
		{ return { code: 51, f3: 3, f7: 0, rd:rd, rs1:0, rs2:rs1 }; }
	/ op:"sltz "i rd:reg comma rs1:reg
		{ return { code: 51, f3: 2, f7: 0, rd:rd, rs1:rs1, rs2:0 }; }
	/ op:"sgtz "i rd:reg comma rs1:reg 
		{ return { code: 51, f3: 2, f7: 0, rd:rd, rs1:0, rs2:rs1 }; }
	/ op:"beqz "i rs1:reg comma _ label:name
		{ return { code: 99, f3: 0, rs1:rs1, rs2:0, label:label }; }
	/ op:"bnez "i rs1:reg comma _ label:name
		{ return { code: 99, f3: 1, rs1:rs1, rs2:0, label:label }; }
	/ op:"blez "i rs1:reg comma _ label:name
		{ return { code: 99, f3: 5, rs1:0, rs2:rs1, label:label }; }
	/ op:"bgez "i rs1:reg comma _ label:name
		{ return { code: 99, f3: 5, rs1:rs1, rs2:0, label:label }; }
	/ op:"bltz "i rs1:reg comma _ label:name
		{ return { code: 99, f3: 4, rs1:rs1, rs2:0, label:label }; }
	/ op:"bgtz "i rs1:reg comma _ label:name
		{ return { code: 99, f3: 4, rs1:0, rs2:rs1, label:label }; }
	/ op:"ble "i rs1:reg comma rs2:reg comma _ label:name
		{ return { code: 99, f3: 5, rs1:rs2, rs2:rs1, label:label }; }
	/ op:"bgt "i rs1:reg comma rs2:reg comma _ label:name
		{ return { code: 99, f3: 4, rs1:rs2, rs2:rs1, label:label }; }
	/ op:"bleu "i rs1:reg comma rs2:reg comma _ label:name
		{ return { code: 99, f3: 7, rs1:rs2, rs2:rs1, label:label }; }
	/ op:"bgtu "i rs1:reg comma rs2:reg comma _ label:name
		{ return { code: 99, f3: 6, rs1:rs2, rs2:rs1, label:label }; }
	/ op:"la "i rd:reg comma _ name:name
		{ return { code:24, rd:rd, name:name }; }
	/ op:"j "i _ label:name
		{ return { code: 111, rd:0, label:label }; }
	/ op:"jal "i _ label:name
		{ return { code: 111, rd:1, label:label }; }
	/ op:"call "i _ label:name
		{ return { code: 111, rd:1, label:label }; }
	/ op:"jr "i rs1:reg
		{ return { code: 103, rd:0, rs1:rs1, imm:0 }; }
	/ op:"jalr "i rs1:reg
		{ return { code: 103, rd:1, rs1:rs1, imm:0 }; }
	/ op:"ret"i
		{ return { code: 103, rd:0, rs1:1, imm:0 }; }

	// others
	/ "ecall"i
		{ return { code: 2 }; }

	// floating point FD
	/ op:"fadd.s "i fd:freg comma fs1:freg comma fs2:freg
		{ return { code: 83, f3: 0, fd:fd, fs1:fs1, fs2:fs2 }; }
	/ op:"fadd.d "i fd:freg comma fs1:freg comma fs2:freg
		{ return { code: 83, f3: 1, fd:fd, fs1:fs1, fs2:fs2 }; }
	/ op:"fsub.s "i fd:freg comma fs1:freg comma fs2:freg
		{ return { code: 83, f3: 2, fd:fd, fs1:fs1, fs2:fs2 }; }
	/ op:"fsub.d "i fd:freg comma fs1:freg comma fs2:freg
		{ return { code: 83, f3: 3, fd:fd, fs1:fs1, fs2:fs2 }; }
	/ op:"fmul.s "i fd:freg comma fs1:freg comma fs2:freg
		{ return { code: 83, f3: 4, fd:fd, fs1:fs1, fs2:fs2 }; }
	/ op:"fmul.d "i fd:freg comma fs1:freg comma fs2:freg
		{ return { code: 83, f3: 5, fd:fd, fs1:fs1, fs2:fs2 }; }
	/ op:"fdiv.s "i fd:freg comma fs1:freg comma fs2:freg
		{ return { code: 83, f3: 6, fd:fd, fs1:fs1, fs2:fs2 }; }
	/ op:"fdiv.d "i fd:freg comma fs1:freg comma fs2:freg
		{ return { code: 83, f3: 7, fd:fd, fs1:fs1, fs2:fs2 }; }
	/ op:"fmin.s "i fd:freg comma fs1:freg comma fs2:freg
		{ return { code: 83, f3: 8, fd:fd, fs1:fs1, fs2:fs2 }; }
	/ op:"fmin.d "i fd:freg comma fs1:freg comma fs2:freg
		{ return { code: 83, f3: 9, fd:fd, fs1:fs1, fs2:fs2 }; }
	/ op:"fmax.s "i fd:freg comma fs1:freg comma fs2:freg
		{ return { code: 83, f3: 10, fd:fd, fs1:fs1, fs2:fs2 }; }
	/ op:"fmax.d "i fd:freg comma fs1:freg comma fs2:freg
		{ return { code: 83, f3: 11, fd:fd, fs1:fs1, fs2:fs2 }; }
	/ op:"fsqrt.s "i fd:freg comma fs1:freg
		{ return { code: 83, f3: 12, fd:fd, fs1:fs1 }; }
	/ op:"fsqrt.d "i fd:freg comma fs1:freg
		{ return { code: 83, f3: 13, fd:fd, fs1:fs1 }; }
	/ op:"feq.s "i rd:reg comma fs1:freg comma fs2:freg
		{ return { code: 83, f3: 14, rd:rd, fs1:fs1, fs2:fs2 }; }
	/ op:"feq.d "i rd:reg comma fs1:freg comma fs2:freg
		{ return { code: 83, f3: 15, rd:rd, fs1:fs1, fs2:fs2 }; }
	/ op:"flt.s "i rd:reg comma fs1:freg comma fs2:freg
		{ return { code: 83, f3: 16, rd:rd, fs1:fs1, fs2:fs2 }; }
	/ op:"flt.d "i rd:reg comma fs1:freg comma fs2:freg
		{ return { code: 83, f3: 17, rd:rd, fs1:fs1, fs2:fs2 }; }
	/ op:"fld.s "i rd:reg comma fs1:freg comma fs2:freg
		{ return { code: 83, f3: 18, rd:rd, fs1:fs1, fs2:fs2 }; }
	/ op:"fld.d "i rd:reg comma fs1:freg comma fs2:freg
		{ return { code: 83, f3: 19, rd:rd, fs1:fs1, fs2:fs2 }; }

	/ op:"flw "i fd:freg comma _ "(" rs1:reg _ ")"
		{ return { code:83, f3:32, fd:fd, rs1:rs1 }; }
	/ op:"flw "i fd:freg comma imm:imm _ "(" rs1:reg _ ")"  
		{ return { code:83, f3:33, fd:fd, rs1:rs1, imm:imm }; }
	/ op:"fsw "i fs2:freg comma _ "(" rs1:reg _ ")"
		{ return { code:83, f3:34, fs2:fs2, rs1:rs1 }; }
	/ op:"fsw "i fs2:freg comma imm:imm _ "(" rs1:reg _ ")"  
		{ return { code:83, f3:35, fs2:fs2, rs1:rs1, imm:imm }; }
	/ op:"fld "i fd:freg comma _ "(" rs1:reg _ ")"
		{ return { code:83, f3:36, fd:fd, rs1:rs1 }; }
	/ op:"fld "i fd:freg comma imm:imm _ "(" rs1:reg _ ")"  
		{ return { code:83, f3:37, fd:fd, rs1:rs1, imm:imm }; }
	/ op:"fsd "i fs2:freg comma _ "(" rs1:reg _ ")"
		{ return { code:83, f3:38, fs2:fs2, rs1:rs1 }; }
	/ op:"fsd "i fs2:freg comma imm:imm _ "(" rs1:reg _ ")"  
		{ return { code:83, f3:39, fs2:fs2, rs1:rs1, imm:imm }; }

	/ op:"fcvt.w.s "i rd:reg comma fs1:freg
		{ return { code:83, f3:64, rd:rd, fs1:fs1}; }
	/ op:"fcvt.s.w "i fd:freg comma rs1:reg
		{ return { code:83, f3:65, fd:fd, rs1:rs1}; }
	/ op:"fmv.s.w "i rd:reg comma fs1:freg
		{ return { code:83, f3:66, rd:rd, fs1:fs1}; }
	/ op:"fmv.w.x "i fd:freg comma rs1:reg
		{ return { code:83, f3:67, fd:fd, rs1:rs1}; }
	/ op:"fcvt.w.d "i rd:reg comma fs1:freg
		{ return { code:83, f3:68, rd:rd, fs1:fs1}; }
	/ op:"fcvt.d.w "i fd:freg comma rs1:reg
		{ return { code:83, f3:69, fd:fd, rs1:rs1}; }
	/ op:"fcvt.s.d "i fd:freg comma fs1:reg
		{ return { code:83, f3:70, fd:fd, fs1:fs1}; }
	/ op:"fcvt.d.s "i fd:freg comma fs1:reg
		{ return { code:83, f3:71, fd:fd, fs1:fs1}; }

reg "register"
	= _ ("zero"i/"x0"i/"r0"i) { return 0; }
    / _ ("ra"i/"x1"i/"r1"i) { return 1; }
    / _ ("sp"i/"x2"i/"r2"i) { return 2; }
    / _ ("gp"i/"x3"i/"r3"i) { return 3; }
    / _ ("tp"i/"x4"i/"r4"i) { return 4; }
	/ _ ("t0"i/"x5"i/"r5"i) { return 5; }
    / _ ("t1"i/"x6"i/"r6"i) { return 6; }
    / _ ("t2"i/"x7"i/"r7"i) { return 7; }
    / _ ("a0"i/"x10"i/"r10"i) { return 10; }
    / _ ("a1"i/"x11"i/"r11"i) { return 11; }
    / _ ("a2"i/"x12"i/"r12"i) { return 12; }
    / _ ("a3"i/"x13"i/"r13"i) { return 13; }
    / _ ("a4"i/"x14"i/"r14"i) { return 14; }
    / _ ("a5"i/"x15"i/"r15"i) { return 15; }
    / _ ("a6"i/"x16"i/"r16"i) { return 16; }
    / _ ("a7"i/"x17"i/"r17"i) { return 17; }
    / _ ("s2"i/"x18"i/"r18"i) { return 18; }
    / _ ("s3"i/"x19"i/"r19"i) { return 19; }
    / _ ("s4"i/"x20"i/"r20"i) { return 20; }
    / _ ("s5"i/"x21"i/"r21"i) { return 21; }
    / _ ("s6"i/"x22"i/"r22"i) { return 22; }
    / _ ("s7"i/"x23"i/"r23"i) { return 23; }
    / _ ("s8"i/"x24"i/"r24"i) { return 24; }
    / _ ("s9"i/"x25"i/"r25"i) { return 25; }
    / _ ("s10"i/"x26"i/"r26"i) { return 26; }
    / _ ("s11"i/"x27"i/"r27"i) { return 27; }
    / _ ("t3"i/"x28"i/"r28"i) { return 28; }
    / _ ("t4"i/"x29"i/"r29"i) { return 29; }
    / _ ("t5"i/"x30"i/"r30"i) { return 30; }
    / _ ("t6"i/"x31"i/"r31"i) { return 31; }

freg "float register"
	= _ ("ft0"i/"f0"i) { return 0; }
    / _ ("ft1"i/"f1"i) { return 1; }
    / _ ("ft2"i/"f2"i) { return 2; }
    / _ ("ft3"i/"f3"i) { return 3; }
    / _ ("ft4"i/"f4"i) { return 4; }
	/ _ ("ft5"i/"f5"i) { return 5; }
    / _ ("ft6"i/"f6"i) { return 6; }
    / _ ("ft7"i/"f7"i) { return 7; }
	/ _ ("fs0"i/"f8"i) { return 8; }
	/ _ ("fs1"i/"f9"i) { return 9; }
    / _ ("fa0"i/"f10"i) { return 10; }
    / _ ("fa1"i/"f11"i) { return 11; }
    / _ ("fa2"i/"f12"i) { return 12; }
    / _ ("fa3"i/"f13"i) { return 13; }
    / _ ("fa4"i/"f14"i) { return 14; }
    / _ ("fa5"i/"f15"i) { return 15; }
    / _ ("fa6"i/"f16"i) { return 16; }
    / _ ("fa7"i/"f17"i) { return 17; }
    / _ ("fs2"i/"f18"i) { return 18; }
    / _ ("fs3"i/"f19"i) { return 19; }
    / _ ("fs4"i/"f20"i) { return 20; }
    / _ ("fs5"i/"f21"i) { return 21; }
    / _ ("fs6"i/"f22"i) { return 22; }
    / _ ("fs7"i/"f23"i) { return 23; }
    / _ ("fs8"i/"f24"i) { return 24; }
    / _ ("fs9"i/"f25"i) { return 25; }
    / _ ("fs10"i/"f26"i) { return 26; }
    / _ ("fs11"i/"f27"i) { return 27; }
    / _ ("ft8"i/"f28"i) { return 28; }
    / _ ("ft9"i/"f29"i) { return 29; }
    / _ ("ft10"i/"f30"i) { return 30; }
    / _ ("ft11"i/"f31"i) { return 31; }

name "name"
	= [A-Z_a-z][A-Z_a-z0-9]* { return text(); }

imm "signed immediate"
	= _ s:("-"/"+")? _ n:[0-9]+ 
    	{ 	if(s) return parseInt(s + n.join("")); 
        	else return parseInt(n.join("")); }
	/ _ "'" c:[^'] "'" 
      	{ 	return c.charCodeAt(0); }

float "floating point"
	= _ ("+"/"-")? _ [0-9]* "."? [0-9]* 
		{
			let f = parseFloat(text().replace(/\s/g, "")); 
			return Number.isNaN(f)?0:f;
		}


comma "comma"
	= _ "," 

end
	= _ ("\n"/!.) __
    
_ "ignored"
	= [ \t]*

__ "ignoredwithnewline"
	= [ \t\n]*

___ "ignoredwithnewlineempty"
	= [ \t\n]+
    
comments
	= _ "#"str:("\t"/" "/"!"/[#-~])* end 

comment
	= _ "#"str:("\t"/" "/"!"/[#-~])* 

