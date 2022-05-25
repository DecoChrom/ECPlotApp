; Created: 2021-09-02 13:14:57

M400;
M190 S0; Heatgun temperature
M106 S0; Fan speed (0%)

; ###### Drop Heat Gun ######
G90 ; Absolute Positioning
M211 S0 ; Disable software end-stops
G0 Z10 F10000
G0 X90.2 Y220 F10000
G0 Y270 Z50 F5000

G0 Y309 ; Move on top of tool holder

G0 Z0 F10000 ; Lower

G0 Y230 F10000 ; Move away

M211 S1 ; Enable software end-stops

; ###### Drop Heat Gun End ######

; ###### End Code ######

G0 X2 Y2

; ###### End Code End ######
