; Created: 2021-09-02 13:14:57

; ###### Drop Syringe Tool 3 - Electrolyte ######

G90 ; Absolute Positioning
M211 S0 ; Disable software end-stops
G0 Z10 F10000
G0 X161 Y220 F10000
G0 Y270 Z40 F10000

G0 Y309 ; Move on top of tool holder

G91 ; Relative Positioning
G0 E-0.5 F250
G90 ; Absolute Positioning

G0 Z0 F10000 ; Lower
G91 ; Relative Positioning
G0 Z-10 F10000
G90 ; Absolute Positioning

G0 Y230 F10000 ; Move away

G91 ; Relative Positioning
G0 Z-2 F10000
G0 Z2
G92 Z0 ; Set Z height to 0
G90 ; Absolute Positioning

M211 S1 ; Enable software end-stops

; ###### Drop Syringe Tool 3 - Electrolyte End ######

; ###### End Code ######

G0 X2 Y2

; ###### End Code End ######
