
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

; ###### Pick Syringe Tool 1 - Conductive ######

G90 ; Absolute Positioning
M211 S0 ; Disable software end-stops

G0 X295 Z5 F10000
G0 Y309 F10000

G0 Y309 Z45

G0 Y230 F10000

G0 X321.3 Y108.4 Z30; Move to homing spot
G28 Z; Home Z nozzle

M206 Z6.76 ; Offset Z Homing position

; Move and Prime 
G0 Z25
G0 Y142
G0 Z0
G92 E0
G1 E1.5 F25
G4 S5
G1 E1.45 F25
G92 E0
G0 Z25 F10000
G0 Y125
G0 Z6.7
G0 Z25
; Move and Prime End

G0 X295

M211 S1 ; Enable software end-stops

; ###### Pick Syringe Tool 1 - Conductive End ######

; ###### Drop Syringe Tool 1 - Conductive ######

G90 ; Absolute Positioning
M211 S0 ; Disable software end-stops
G0 Z10 F10000
G0 X295 Y220 F10000
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

; ###### Drop Syringe Tool 1 - Conductive End ######

; ###### Pick Syringe Tool 2 - Electrochromic ######

G90 ; Absolute Positioning
M211 S0 ; Disable software end-stops

G0 X228 Z5 F10000
G0 Y309 F10000

G0 Y309 Z45

G0 Y230 F10000

G0 X321.3 Y108.4 Z30; Move to homing spot
G28 Z; Home Z nozzle

M206 Z6.76 ; Offset Z Homing position

; Move and Prime 
G0 Z25
G0 Y143
G0 Z0
G92 E0
G1 E1.5 F25
G4 S5
G1 E1.45 F25
G92 E0
G0 Z25 F10000
G0 Y125
G0 Z6.7
G0 Z25
; Move and Prime End

G0 X295

M211 S1 ; Enable software end-stops

; ###### Pick Syringe Tool 2 - Electrochromic End ######

; ###### Drop Syringe Tool 2 - Electrochromic ######

G90 ; Absolute Positioning
M211 S0 ; Disable software end-stops
G0 Z10 F10000
G0 X228 Y220 F10000
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

; ###### Drop Syringe Tool 2 - Electrochromic End ######

; ###### Pick Syringe Tool 3 - Electrolyte ######

G90 ; Absolute Positioning
M211 S0 ; Disable software end-stops

G0 X161 Z5 F10000
G0 Y309 F10000

G0 Y309 Z45

G0 Y230 F10000

G0 X321.3 Y108.4 Z30; Move to homing spot
G28 Z; Home Z nozzle

M206 Z6.76 ; Offset Z Homing position

; Move and Prime 
G0 Z25
G0 Y144
G0 Z0
G92 E0
G1 E1.5 F25
G4 S5
G1 E1.45 F25
G92 E0
G0 Z25 F10000
G0 Y125
G0 Z6.7
G0 Z25
; Move and Prime End

G0 X295

M211 S1 ; Enable software end-stops

; ###### Pick Syringe Tool 3 - Electrolyte End ######

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
