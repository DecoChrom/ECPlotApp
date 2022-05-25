; Created: 2021-09-02 13:14:57

; ###### Start Code ######

M906 Z20 ; reduce current for Z axis
M906 E200 ; Set current for Extruder motor
M203 Z20 ; Set max feedrate for Z axis
M304 D133.93 I3.87 P27.87


G90 ; Absolute Positioning
G92 Z0 ; Set Z height to 0
M117 Homing X and Y
G28 X Y;

G91 ; Relative Positioning
;G0 X148 Y148 Z-15 F5000
G0 Z-15 F5000
G0 Z2
G92 Z0 ; Set Z height to 0
G90 ; Absolute Positioning

; ###### Start Code End ######

; ###### Pick Heat Gun ######
G90 ; Absolute Positioning
M211 S0 ; Disable software end-stops

G0 X90.2 Z5 F10000
G0 Y309 F10000

G0 Y309 Z45

G0 Y230 F10000

M211 S1 ; Enable software end-stops

; ###### Pick Heat Gun End ######

M400;
M106 S50; Fan speed (20%)
M190 S110; Heatgun temperature
