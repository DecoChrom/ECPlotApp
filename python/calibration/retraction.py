import os
import pathlib
import shutil
import subprocess
import time
from datetime import datetime

from printer_gcode import *
from slic3r import arguments

this_path = pathlib.Path(__file__).parent.absolute()

temp_stl_folder = os.path.join(this_path, "temp_stl")

"""
1ml syringe diameter = 4.78
1mm of material in syringe = pi * r^2 * h = 3.14 * 2.4^2 * 1 = 18.1mm3


syringe tip length = 13mm

syringe tip diameter = 0.4mm
syringe tip volume = pi * r^2 * h = 3.14 * 0.2^2 * 13 = 1.63mm3

syringe tip diameter = 1mm
syringe tip volume = pi * r^2 * h = 3.14 * 0.5^2 * 13 = 10.21mm3

"""


def generate_stl_block(filename, x_pos=0, y_pos=0, line_width=0.4, height=0.1):
    if os.path.exists(temp_stl_folder) is not True:
        os.mkdir(temp_stl_folder)

    scad_filename = os.path.join(temp_stl_folder, filename + ".scad")

    scad_string = """translate([10+""" + str(x_pos * 20) + """,10+""" + str(y_pos * 20) + """,0])
        for (i = [0 : 10]){
            translate([i,0,0])
                cube(size = [""" + str(line_width) + """,10,""" + str(height) + """]);
    }"""

    with open(scad_filename, mode='w') as scad_file:
        scad_file.write(scad_string)
        scad_file.close()

    runcmd = 'openscad.exe -o ' + os.path.join(temp_stl_folder, filename + ".stl") + ' ' + scad_filename

    runcmd = os.path.join(this_path, "..", runcmd)

    result = subprocess.run(runcmd, universal_newlines=True)


def generate_gcode_block(filename, line_width=0.4, height=0.1, diameter=4.78, substrate_thickness=0.0, speed=30.0,
                         travel_speed=60.0, retract_length=1.0, retract_speed=40.0):
    if line_width is not None:
        arguments['first-layer-extrusion-width'] = line_width
        arguments['extrusion-width'] = line_width
    if diameter is not None:
        arguments['filament-diameter'] = diameter
    if substrate_thickness is not None:
        arguments['z-offset'] = substrate_thickness
    if speed is not None:
        arguments['perimeter-speed'] = speed
        arguments['infill-speed'] = speed
        arguments['first-layer-speed'] = speed
    if travel_speed is not None:
        arguments['travel-speed'] = travel_speed
    if retract_length is not None:
        arguments['retract-length'] = retract_length
        arguments['retract-before-travel'] = retract_length
    if retract_speed is not None:
        arguments['retract-speed'] = retract_speed
    if height is not None:
        arguments["layer-height"] = height
        arguments["first-layer-height"] = height

    arg = "".join(['--%s %s ' % (key, value) for (key, value) in arguments.items()])

    gcode_filename = os.path.join(temp_stl_folder, filename + ".gcode")

    runcmd = "slic3r-console.exe " + os.path.join(temp_stl_folder,
                                                  filename + ".stl") + " -o " + gcode_filename + " " + arg

    runcmd = os.path.join("../../Slic3r", runcmd)
    subprocess.run(runcmd, stdout=subprocess.PIPE)

    cmds_to_remove = ['M107', 'M104', 'M140']
    gcode = ""
    with open(gcode_filename, "r+") as generatedGCode:
        gcode = generatedGCode.readlines()

        cleanedcode = ""
        for line in gcode:
            writeline = True
            if any(cmd in line for cmd in cmds_to_remove) and line.index("\n") != 0:
                writeline = False

            if line[0] == ";":
                writeline = False

            if writeline:
                cleanedcode += line

        generatedGCode.truncate(0)
        infoText = """

; Retract Length: """ + str(retract_length) + """
; Retract Speed: """ + str(retract_speed)
        generatedGCode.write(infoText)
        generatedGCode.write(cleanedcode)

    # with open(gcode_filename, 'w') as cleanedfile:
    #     cleanedfile.write(cleanedcode)
    #     cleanedfile.close()

    # with open(gcode_filename) as finalfile:
    #     final = finalfile.readlines()
    #     finalfile.close()

    # final[4] = ""

    return infoText + cleanedcode


def generate_calibration_gcode(line_width=0.4, height=0.1, retract_min=0.0, retract_speed_min=5.0, x_range=9, y_range=9,
                               retract_increment=0.1, retract_speed_increment=2.5, substrate_thickness=0.1):
    dt_string = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    calibration_gcode = """
; Calibration GCode
; Created: """ + str(dt_string) + """
; Line Width/Syringe Tip Diameter: """ + str(line_width) + """
; Height: """ + str(height) + """
; Retract Increment: """ + str(retract_increment) + """
; Retract Min/Max: """ + str(retract_min) + """ - """ + str(retract_min + retract_increment * x_range) + """
; Retract Speed Increment: """ + str(retract_speed_increment) + """
; Retract Speed Min/Max: """ + str(retract_speed_min) + """ - """ + str(
        retract_speed_min + (retract_speed_increment * y_range)) + """
"""
    for y in range(0, y_range):
        for x in range(0, x_range):
            generate_stl_block(filename="block" + str(x) + "x" + str(y), x_pos=x, y_pos=y, line_width=line_width,
                               height=height)
            print(" --- Generated stl block %i, %i" % (x, y))
            # print(" ")
            block_text = """; Block """ + str(x) + """, """ + str(y)
# ; Retract Length: """ + str(retract_min + retract_increment * x) + """
# ; Retract Speed: """ + str(retract_speed_min + retract_speed_increment * y)
            calibration_gcode += """
""" + block_text
            gcode_block = generate_gcode_block(filename="block" + str(x) + "x" + str(y), height=height,
                                               retract_length=retract_min + x * retract_increment,
                                               retract_speed=retract_speed_min + (y * retract_speed_increment),
                                               substrate_thickness=substrate_thickness, line_width=line_width)
            for line in gcode_block:
                calibration_gcode += line
            print(" --- Generated gcode block %i, %i" % (x, y))
            print(" ")

    return calibration_gcode


def cleanup():
    print("Done. Waiting for a second.")
    time.sleep(1)
    print("Removing temp folder.")
    shutil.rmtree(temp_stl_folder)
    pass


if __name__ == '__main__':
    calibration_gcode = generate_calibration_gcode(line_width=0.8, height=0.10, x_range=10, y_range=10,
                                                   retract_increment=0.05, retract_min=0.05,
                                                   retract_speed_increment=2.5, retract_speed_min=5,
                                                   substrate_thickness=0.0)
    # try:
    # cleanup()
    # except:
    #     pass

    print("Compiling final gcode")
    final_gcode = start()

    final_gcode += pick_syringe_tool(tool2)

    final_gcode += calibration_gcode

    final_gcode += drop_syringe_tool(tool2)

    final_gcode += end()

    with open("retraction.gcode", "w") as finalfile:
        finalfile.write(final_gcode)
        finalfile.close()

    print("Calibration GCode saved as: retraction.gcode")
