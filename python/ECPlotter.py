import argparse
import sys
import time
from os import path

from GCodeGenerator import generateGCode
from STLGenerator import generateSTL
from printer_gcode import *


def generateLayer(inputfile, output, layertype, layername, linewidth=0.3, diameter=3.0, thickness=0.1, offset=0.1,
                  speed=15.0, travel_speed=30.0, retract_length=0.2, extrusion_multiplier=1.0):
    try:
        if path.exists(inputfile) is not True:
            raise ValueError
    except ValueError:
        print(layertype + " input file not found", file=sys.stderr)
        arg_parse.print_help()
        exit(1)

    print("Generating stl from", inputfile)
    stl = generateSTL(inputfile, thickness=thickness)

    print()
    print("Generating gcode for " + layername + " layer")
    gcode = generateGCode(stl, output, layername, line_width=linewidth, diameter=diameter, offset=offset, speed=speed,
                          travel_speed=travel_speed, retract_length=retract_length, thickness=thickness,
                          extrusion_multiplier=extrusion_multiplier)

    return gcode


def main():
    print("Running EC Plotter GCode generator script!")
    print(" ")
    print("Substrate Thickness:", args['substrate_thickness'])
    if 'EC' in args['layers']:
        thickness = 0.1
        try:
            if path.exists(args['ec_input_file']) is not True:
                raise ValueError
        except ValueError:
            print("EC input file not found", file=sys.stderr)
            arg_parse.print_help()
            exit(1)

        print(" ")
        print("Generating stl from", args['ec_input_file'])
        ec_stl = generateSTL(args['ec_input_file'], thickness=thickness)

        print()
        print("Generating gcode for electrochromic layer")
        ecGCode = generateGCode(ec_stl, None, 'EC', line_width=args['ec_line_width'],
                                diameter=args['ec_syringe_diameter'], offset=float(args['substrate_thickness']) ,
                                retract_length=args['ec_retract_length'], thickness=thickness,
                                extrusion_multiplier=args['ec_multiplier'], speed=5)

        if args['ec_cure'] == "true":
            print(" ")
            print("Generating gcode for electrochromic cure layer")
            ecCureGCode = generateGCode(ec_stl, 'EC_HEAT', 'EC_HEAT', line_width=3,
                                        diameter=args['ec_syringe_diameter'],
                                        offset=args['substrate_thickness'], speed=0.5, travel_speed=30,
                                        thickness=thickness, extrusion_multiplier=args['ec_multiplier'])
        else:
            ecCureGCode = ""
    if 'AG' in args['layers']:
        thickness = 0.30
        try:
            if path.exists(args['ag_input_file']) is not True:
                raise ValueError
        except ValueError:
            print("AG input file not found", file=sys.stderr)
            arg_parse.print_help()
            exit(1)

        print(" ")
        print("Generating stl from", args['ag_input_file'])
        ag_stl = generateSTL(args['ag_input_file'], thickness=thickness)

        print()
        print("Generating gcode for conductive layer")

        agGCode = generateGCode(ag_stl, None, 'AG', line_width=args['ag_line_width'],
                                diameter=args['ag_syringe_diameter'], speed=3,
                                offset=args['substrate_thickness'], retract_length=args['ag_retract_length'],
                                thickness=thickness, extrusion_multiplier=args['ag_multiplier'])

        if args['ag_cure'] == "true":

            print(" ")
            print("Generating gcode for conductive cure layer")

            agCureGCode = generateGCode(ag_stl, 'AG_HEAT', 'AG_HEAT', line_width=0.8,
                                        diameter=args['el_syringe_diameter'],
                                        offset=args['substrate_thickness'], thickness=thickness, speed=0.5,
                                        travel_speed=30, )
        else:
            agCureGCode = ""

    if 'EL' in args['layers']:
        thickness = 0.30
        try:
            if path.exists(args['el_input_file']) is not True:
                raise ValueError
        except ValueError:
            print("EL input file not found", file=sys.stderr)
            arg_parse.print_help()
            exit(1)

        print(" ")
        print("Generating stl from", args['el_input_file'])
        el_stl = generateSTL(args['el_input_file'], thickness=thickness)

        print()
        print("Generating gcode for electrolyte layer")
        elGCode = generateGCode(el_stl, None, 'EL', line_width=args['el_line_width'],
                                diameter=args['el_syringe_diameter'],
                                offset=float(args['substrate_thickness']) + 0.1,
                                retract_length=args['el_retract_length'],
                                thickness=thickness, extrusion_multiplier=args['el_multiplier'])

        if args['el_cure'] == "true":
            print(" ")
            print("Generating gcode for electrolyte cure layer")
            elCureGCode = generateGCode(el_stl, 'EL_CURE', 'EL_CURE', line_width=5,
                                        diameter=args['el_syringe_diameter'],
                                        offset=args['substrate_thickness'], thickness=thickness, speed=0.5,
                                        travel_speed=30, )
        else:
            elCureGCode = ""

    print(" ")
    print("Generating outputfile: ", args['o'])

    with open(args['o'], 'w') as outputFile:
        outputFile.write(start())
        if 'EC' in args['layers']:
            outputFile.write(pick_syringe_tool(tool2))
            for line in ecGCode:
                outputFile.write(line)
            outputFile.write(drop_syringe_tool(tool2))

            if args['ec_cure'] == "true":
                outputFile.write(pick_heat_gun())
                for line in ecCureGCode:
                    outputFile.write(line)
                outputFile.write(drop_heat_gun())

        if 'AG' in args['layers']:
            outputFile.write(pick_syringe_tool(tool1))
            for line in agGCode:
                outputFile.write(line)
            outputFile.write(drop_syringe_tool(tool1))

            if args['ag_cure'] == "true":
                outputFile.write(pick_heat_gun())
                for line in agCureGCode:
                    outputFile.write(line)
                outputFile.write(drop_heat_gun())

        if 'EL' in args['layers']:
            outputFile.write(pick_syringe_tool(tool3))
            for line in elGCode:
                outputFile.write(line)
            outputFile.write(drop_syringe_tool(tool3))

            if args['el_cure'] == "true":
                outputFile.write(pick_uv_lamp())
                for line in elCureGCode:
                    outputFile.write(line)
                outputFile.write(drop_uv_lamp())

        outputFile.write(end())


if __name__ == "__main__":
    arg_parse = argparse.ArgumentParser(description="EC Plotter GCode generator script! "
                                                    "Takes svg files, converts them to stl and then to gcode.")
    arg_parse.add_argument('-ec-input-file', metavar='filename.svg', type=str,
                           help="Electrochromic input file (.svg) (default=EC.svg)", action='store', default='EC.svg')
    arg_parse.add_argument('-ec-syringe-diameter', metavar='6.0', type=float,
                           help="Used to adjust feedrate of ink. Lower = more ink, Higher = less ink", action='store',
                           default=4.8)
    arg_parse.add_argument('-ec-line-width', type=float,
                           help="EC Line Width", metavar='0.3', action='store', default=0.8)
    arg_parse.add_argument('-ec-retract-length', type=float,
                           help="EC Retract Length", metavar='0.3', action='store', default=0.005)
    arg_parse.add_argument('-ec-multiplier', type=float,
                           help="EC Extrusion Multiplier", metavar='0.3', action='store', default=1.0)
    arg_parse.add_argument('-ec-cure', type=str, help="Add Cure Pass", default="true")

    arg_parse.add_argument('-el-input-file', metavar='filename.svg', type=str,
                           help="Electrolyte input file (.svg) (default=EL.svg)", action='store', default='EL.svg')
    arg_parse.add_argument('-el-syringe-diameter', metavar='3.0', type=float,
                           help="Used to adjust feedrate of ink. Lower = more ink, Higher = less ink", action='store',
                           default=4.8)
    arg_parse.add_argument('-el-line-width', type=float,
                           help="EL Line Width", metavar='1.0', action='store', default=2.0)
    arg_parse.add_argument('-el-retract-length', type=float,
                           help="EL Retract Length", metavar='0.3', action='store', default=0.1)
    arg_parse.add_argument('-el-multiplier', type=float,
                           help="EL Extrusion Multiplier", metavar='0.3', action='store', default=1.0)
    arg_parse.add_argument('-el-cure', type=str, help="Add Cure Pass", default="true")

    arg_parse.add_argument('-ag-input-file', metavar='filename.svg', type=str,
                           help="Conductive input file (.svg) (default=AG.svg)",
                           action='store', default='AG.svg')
    arg_parse.add_argument('-ag-syringe-diameter', metavar='3.0', type=float,
                           help="Used to adjust feedrate of ink. Lower = more ink, Higher = less ink", action='store',
                           default=4.8)
    arg_parse.add_argument('-ag-line-width', type=float,
                           help="AG Line Width", metavar='0.5', action='store', default=1.2)
    arg_parse.add_argument('-ag-retract-length', type=float,
                           help="AG Retract Length", metavar='0.3', action='store', default=0.15)
    arg_parse.add_argument('-ag-multiplier', type=float,
                           help="AG Extrusion Multiplier", metavar='0.3', action='store', default=1.0)
    arg_parse.add_argument('-ag-cure', type=str, help="Add Cure Pass", default="true")

    arg_parse.add_argument('-o', metavar='outputfile.gcode', type=str, help="Generated GCode",
                           action='store', default='generated.gcode')
    arg_parse.add_argument('-layers', metavar="['AG','EC','EL']", nargs="*", action='store',
                           help="Select layers to generate",
                           default=['AG', 'EC', 'EL'])
    arg_parse.add_argument('-substrate-thickness', action='store', help="Thickness of the substrate", default=0.1)
    # Photo paper thickness     = 0.28 == 0.3
    # Regular paper             = 0.07 == 0.1

    try:
        args = arg_parse.parse_args()
        args = vars(args)
        # print(args)
        # print(" ")
        if len(args['layers']) == 1:
            args['layers'] = args['layers'][0].split(",")

    except:
        print(sys.argv)
        print(" ")
        arg_parse.print_help()
        exit(1)

    main()
