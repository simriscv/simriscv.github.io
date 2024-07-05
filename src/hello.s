.global _start

.data
    str: .string "Hello, World!\n"

.text
_start:
    li a0, 1
    la a1, str
    li a2, 14
    li a7, 64
    ecall

    li a7, 93
    ecall