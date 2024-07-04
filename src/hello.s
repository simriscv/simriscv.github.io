.global _start

.data
    str: .string "Hello, World!"

.text
_start:
    li a0, 1
    la a1, str
    li a2, 13
    li a7, 64
    ecall

    li a7, 93
    ecall