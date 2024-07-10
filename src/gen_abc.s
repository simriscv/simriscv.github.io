.global _start

.bss
	str: .skip 27

.text
_start:
	la t0, str
	li t1, 0
	li t2, 97
	li t3, 26

loop:
	sb t2, (t0)
	addi t2, t2, 1
	addi t1, t1, 1
	addi t0, t0, 1
	bne t1, t3, loop
	
	li t2, 10
	sb t2, (t0)
	
	li a0, 1
	la a1, str
	li a2, 27
	li a7, 64
	ecall
	
	li a7, 93
	ecall
	
