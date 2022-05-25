import subprocess

arguments = {
    "filament-diameter": 6,
    "first-layer-extrusion-width": 0.5,
    "nozzle-diameter": 1.0,
    "z-offset": 0.1,
    "extrusion-multiplier": 1.0,
    "temperature": 0,
    "first-layer-temperature": 0,
    "bed-temperature": 0,
    "first-layer-bed-temperature": 0,
    "travel-speed": 60,
    "perimeter-speed": 15,
    "infill-speed": 15,
    "first-layer-speed": 15,
    "layer-height": 0.1,
    "first-layer-height": 0.1,
    "perimeters": 50,
    "fill-pattern": "rectilinear",
    "fill-density": 100,
    "fill-angle": 0,
    "retract-length": 0.1,
    "retract-before-travel": 0.1,
    "retract-lift": 1.5,
    "retract-speed": 12.5,
    "skirts": 0,
    "extrusion-width": 0.2,
    "start-gcode": '";"',
    "end-gcode": ";",
    "disable-fan-first-layers": 3,
    "cooling": "",
    "extra-perimeters": 0,
    "dont-arrange": "",
    # "avoid-crossing-perimeters": "",
    "only-retract-when-crossing-perimeters": "",
    # "wipe": "",
}

syringechangeandwait = """
;
; The following code is for syringe change !
;
;M906 E20 ; Set current for Extruder motor
;G1 E-0.1 ; Move z and extruder for change
M906 E300 ; Set current for Extruder motor
G92 E0 ; reset extruder pos
;G1 E0.5 ; extrude a bit, air pockets
;G1 E-0.1 ; retract a bit
;G1 X150 Y100 Z35 F4000

"""

syringechangehoming = """
G0 X321.3 Y108.4 Z10 F4000; Z homing endstop !!!
G28 Z ; Home Z with new tip
M211 S0 ; Disable software endstops
G0 X300 Z10 F4000 ; Move out of the way
M206 Z4.9 ; Offset Z Homing position ; Higher number = closer to bed
;G1 X280 Y270 Z35 F4000 ; Move to sponge
;G1 Z23 ; Lower to top of sponge
;G92 E0 ; Reset extruder position
;G1 E0.2000 F200 ; Prime tip
;G92 E0 ; Reset extruder position
;G1 E-0.1 ; retract a bit
;G1 Z35 ; Move up
;G1 Y220 F4000 ; Move out of the way
"""

endgcode = """
; End Gcode.
G1 E-0.2 ;
M906 E20 ; Set current for Extruder motor
G92 E0 ; Reset extruder
G1 X150 Y5 Z35 F4000

"""

auto0 = """
;G90 ; absolute position
;G91 ; relative position

; Auto start code.
; First reduce current for Z axis motor so it doesn't break gantry
; Set relative positioning
; Move up 6cm to ensure it's at the top
; Home X and Y

M906 Z20 ; reduce current for Z axis
M906 E75 ; Set current for Extruder motor

G91 ; Relative Positioning
M117 Moving Z axis up 6CM
G0 Z20 ; Move up 6CM
G0 Z-10 F4000;

G90 ; Absolute Positionin
M117 Homing X and Y
G28 X Y;

M117 Moving to Z endstop
M906 Z400
G0 X321.3 Y108.4 Z30 F4000; Z homing endstop !!!
G28 Z;
M211 S0 ; Disable software endstops
M206 Z4.55 ; Offset Z Homing position
;G0 Z10
G0 Z20
G0 X150 Y10
"""
