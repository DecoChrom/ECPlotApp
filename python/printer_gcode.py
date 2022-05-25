import os
import pathlib
from datetime import date, datetime
from random import random

tool1 = {'x': 295, 'name': "Syringe Tool 1 - Conductive", 'retract': 0.02}
tool2 = {'x': 228, 'name': "Syringe Tool 2 - Electrochromic", 'retract': 0.01}
tool3 = {'x': 161, 'name': "Syringe Tool 3 - Electrolyte", 'retract': 0.02}
tool4 = {'x': 90.2, 'name': "Heat Gun"}
tool5 = {'x': 20, 'name': "UV Curing"}


def gcode_comment(text):
    return """
; ###### """ + text + """ ######
"""


def add_date():
    dt_string = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return """; Created: """ + str(dt_string) + """
"""


def start():
    return gcode_comment("Start Code") + """
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
""" + gcode_comment("Start Code End")


def end():
    return gcode_comment("End Code") + """
G0 X2 Y2
""" + gcode_comment("End Code End")


def pick_syringe_tool(tool):
    return gcode_comment("Pick " + tool['name']) + """
G90 ; Absolute Positioning
M211 S0 ; Disable software end-stops

G0 X""" + str(tool['x']) + """ Z5 F10000
G0 Y309 F10000

G0 Y309 Z45

G0 Y230 F10000

G0 X321.3 Y108.4 Z30; Move to homing spot
G28 Z; Home Z nozzle

M206 Z6.76 ; Offset Z Homing position

; Move and Prime 
G0 Z25
G0 Y""" + str(140 + int((random() * 25))) + """
G0 Z0
G92 E0
G1 E1.5 F25
G4 S5
G1 E"""+str(1.5 - tool['retract'])+ """ F25
G92 E0
G0 Z25 F10000
G0 Y125
G0 Z6.7
G0 Z25
; Move and Prime End

G0 X295
G1 E0.1

M211 S1 ; Enable software end-stops
""" + gcode_comment("Pick " + tool['name'] + " End")


def drop_syringe_tool(tool):
    return gcode_comment("Drop " + tool['name']) + """
G90 ; Absolute Positioning
M211 S0 ; Disable software end-stops
G0 Z10 F10000
G0 X""" + str(tool['x']) + """ Y220 F10000
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
""" + gcode_comment("Drop " + tool['name'] + " End")


def pick_extra_tool(tool):
    return gcode_comment("Pick " + tool['name']) + """G90 ; Absolute Positioning
M211 S0 ; Disable software end-stops

G0 X""" + str(tool['x']) + """ Z5 F10000
G0 Y309 F10000

G0 Y309 Z45

G0 Y230 F10000

M211 S1 ; Enable software end-stops
""" + gcode_comment("Pick " + tool['name'] + " End")


def drop_extra_tool(tool):
    return gcode_comment("Drop " + tool['name']) + """G90 ; Absolute Positioning
M211 S0 ; Disable software end-stops
G0 Z10 F10000
G0 X""" + str(tool['x']) + """ Y220 F10000
G0 Y270 Z50 F5000

G0 Y309 ; Move on top of tool holder

G0 Z0 F10000 ; Lower

G0 Y230 F10000 ; Move away

M211 S1 ; Enable software end-stops
""" + gcode_comment("Drop " + tool['name'] + " End")


def pick_heat_gun():
    return pick_extra_tool(tool4) + """
M400;
M106 S50; Fan speed (20%)
M190 S110; Heatgun temperature
"""


def drop_heat_gun():
    return """
M400;
M190 S0; Heatgun temperature
M106 S0; Fan speed (0%)
""" + drop_extra_tool(tool4)


def pick_uv_lamp():
    return """
; M0 
""" + pick_extra_tool(tool5)


def drop_uv_lamp():
    return drop_extra_tool(tool5)


def generate_gcode_files():
    script_path = pathlib.Path(__file__).parent.absolute()
    script_path = str(script_path)

    with open(script_path + "\gcodes\pick1.gcode", "w") as file:
        file.write(add_date())
        file.write(start())
        file.write(pick_syringe_tool(tool1))
        file.close()

    with open(script_path + "\gcodes\drop1.gcode", "w") as file:
        file.write(add_date())
        file.write(drop_syringe_tool(tool1))
        file.write(end())
        file.close()

    with open(script_path + "\gcodes\pick2.gcode", "w") as file:
        file.write(add_date())
        file.write(start())
        file.write(pick_syringe_tool(tool2))
        file.close()

    with open(script_path + "\gcodes\drop2.gcode", "w") as file:
        file.write(add_date())
        file.write(drop_syringe_tool(tool2))
        file.write(end())
        file.close()

    with open(script_path + "\gcodes\pick3.gcode", "w") as file:
        file.write(add_date())
        file.write(start())
        file.write(pick_syringe_tool(tool3))
        file.close()

    with open(script_path + "\gcodes\drop3.gcode", "w") as file:
        file.write(add_date())
        file.write(drop_syringe_tool(tool3))
        file.write(end())
        file.close()

    with open(script_path + "\gcodes\pick_heat_gun.gcode", "w") as file:
        file.write(add_date())
        file.write(start())
        file.write(pick_heat_gun())
        file.close()

    with open(script_path + "\gcodes\drop_heat_gun.gcode", "w") as file:
        file.write(add_date())
        file.write(drop_heat_gun())
        file.write(end())
        file.close()

    with open(script_path + "\gcodes\pick_uv_lamp.gcode", "w") as file:
        file.write(add_date())
        file.write(start())
        file.write(pick_uv_lamp())
        file.close()

    with open(script_path + "\gcodes\drop_uv_lamp.gcode", "w") as file:
        file.write(add_date())
        file.write(drop_uv_lamp())
        file.write(end())
        file.close()

    with open(script_path + "\gcodes\end.gcode", "w") as file:
        file.write(add_date())
        file.write(end())
        file.close()


if __name__ == '__main__':
    generate_gcode_files()

    gcode = start()
    gcode += pick_syringe_tool(tool1)
    gcode += drop_syringe_tool(tool1)
    gcode += pick_syringe_tool(tool2)
    gcode += drop_syringe_tool(tool2)
    gcode += pick_syringe_tool(tool3)
    gcode += drop_syringe_tool(tool3)

    # gcode += pick_heat_gun()
    # gcode += drop_extra_tool(tool4)
    #
    # gcode += pick_uv_lamp()
    # gcode += drop_extra_tool(tool5)
    gcode += end()

    with open("test_gcode.gcode", "w") as file:
        file.write(gcode)
        file.close()

    # print(gcode)
