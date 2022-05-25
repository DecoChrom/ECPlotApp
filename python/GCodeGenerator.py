import subprocess
import pathlib
import os
import argparse

from slic3r import arguments


def generateGCode(input, output=None, print_type=None, line_width=None, diameter=None, thickness=0.1, offset=0.1,
                  speed=15.0, travel_speed=30.0, retract_length=None, extrusion_multiplier=None):
    if line_width is not None:
        arguments['first-layer-extrusion-width'] = line_width
        arguments['extrusion-width'] = line_width
    if diameter is not None:
        arguments['filament-diameter'] = diameter
        arguments['nozzle-diameter'] = diameter
    if offset is not None:
        arguments['z-offset'] = offset
    if thickness is not None:
        arguments['layer-height'] = thickness
        arguments['first-layer-height'] = thickness
    if speed is not None:
        arguments['perimeter-speed'] = speed
        arguments['infill-speed'] = speed
        arguments['first-layer-speed'] = speed
    if travel_speed is not None:
        arguments['travel-speed'] = travel_speed
    if retract_length is not None:
        arguments['retract-length'] = retract_length
        arguments['retract-before-travel'] = retract_length
    if extrusion_multiplier is not None:
        arguments['extrusion-multiplier'] = extrusion_multiplier

    pythonScriptPath = pathlib.Path(__file__).parent.absolute()

    if output == "None":
        output = None

    if output is None:
        docName = input.split(".")[0]
    else:
        docName = input[0:len(input)-6] + output

    arg = "".join(['--%s %s ' % (key, value) for (key, value) in arguments.items()])

    if output is None:
        runcmd = os.path.join(pythonScriptPath, '../Slic3r/slic3r-console.exe ') + input + " " + arg
    else:
        out = docName + ".gcode"
        runcmd = os.path.join(pythonScriptPath, '../Slic3r/slic3r-console.exe ') + input + " -o " + out + " " + arg

    # runcmd = os.path.join(pythonScriptPath, '../Slic3r/slic3r-console.exe ') + input + " " + arg

    # print(" ")
    # print("output:  ", output)
    print("LineWidth: ", line_width, ", Diameter", diameter, ", Thickness", thickness, ", Offset", offset)
    # print("runcmd:  ", runcmd)

    subprocess.run(runcmd, stdout=subprocess.DEVNULL)

    cmds_to_remove = ['M107', 'M104', 'M140']
    gcode = ""
    with open(docName + ".gcode") as generatedGCode:
        gcode = generatedGCode.readlines()
    with open(docName + ".gcode", 'w') as cleanedfile:
        cleanedfile.write(";\n;The following gcode is for printing " + print_type + " layer !\r;\n")
        for line in gcode:
            writeline = True

            if "; filament used" in line:
                print("Ink" + line[10:len(line)])

            if any(cmd in line for cmd in cmds_to_remove) and line.index("\n") != 0:
                writeline = False

            if line[0] == ";":
                writeline = False

            if writeline:
                cleanedfile.write(line)

        cleanedfile.close()

    with open(docName + ".gcode") as finalfile:
        final = finalfile.readlines()

    final[4] = ""

    return final


if __name__ == '__main__':
    arg_parse = argparse.ArgumentParser(description="GCode generator script! "
                                                    "Takes an stl file and converts it to gcode.")

    arg_parse.add_argument('-stl-file', metavar='filename.stl', type=str,
                           help="stl file (.stl) (default=EC.stl)", action='store', default='EC.stl')
    arg_parse.add_argument('-o', metavar='filename.stl', type=str,
                           help="stl file (.stl) (default=EC.stl)", action='store', default='None')
    arg_parse.add_argument('-layertype', metavar='electrochromic', type=str,
                           help="layertype [electrochromic, conductive or electrolyte]", action='store',
                           default='electrochromic')
    arg_parse.add_argument('-line-width', type=float,
                           help="Line Width", metavar='0.3', action='store', default=0.3)
    arg_parse.add_argument('-syringe-diameter', metavar='6.0', type=float,
                           help="Used to adjust feedrate of ink. Lower = more ink, Higher = less ink", action='store',
                           default=6.0)
    arg_parse.add_argument('-substrate-thickness', action='store', help="Thickness of the substrate", default=0.1)
    arg_parse.add_argument('-retract-length', action='store', help="Retraction Length", default=2.0)

    try:
        args = arg_parse.parse_args()
        print(args)
        args = vars(args)
    except:
        arg_parse.print_help()
        exit(1)

    generateGCode(args['stl_file'], args['o'], args['layertype'], args['line_width'], args['syringe_diameter'],
                  args['substrate_thickness'])
    # generateGCode("D:\\Dropbox\\DecoChrom\\Development\\ECPlot\\PrintDesigns\\IllustratorScripting\\test_design_AG.stl", "electrochromic")
