import argparse
import sys
import os
import pathlib
import subprocess


def generateSTL(input, output=None, thickness=0.1):
    try:
        if os.path.exists(input) is not True:
            raise ValueError
    except ValueError:
        print("File not found: " + input, file=sys.stderr)
        exit(1)

    pythonScriptPath = pathlib.Path(__file__).parent.absolute()

    outputStlPath = os.path.join(pythonScriptPath, "output.stl")

    scadfilePath = os.path.join(pythonScriptPath, "scadfile.scad")

    scad_string = """
rotate([0,0,-90])
translate([-210,0,0])
"""
    scad_string += "linear_extrude(height = " + str(thickness) + ")\n"
    scad_string += "\t\timport(file = \"" + input.replace(os.sep, '/') + "\");"

    with open(scadfilePath, mode='w') as scadfile:
        scadfile.write(scad_string)
        scadfile.close()

    if output is None:
        output = input.rsplit(".", maxsplit=1)[0] + ".stl"
        # output = output.replace(os.sep, '/')

    runcmd = 'openscad.exe -o ' + output + ' ' + scadfilePath

    runcmd = os.path.join(pythonScriptPath, runcmd)
    try:
        # result = subprocess.run(runcmd, capture_output=True, universal_newlines=True)
        result = subprocess.run(runcmd, stdout=subprocess.DEVNULL)

        # if (result.returncode != 0):
        #     print(" ")
        #     print(runcmd)
        #     print(" ")
        #     print(result.returncode)
        #     print(" ")
        #     print(result.stdout)
        #     print(" ")
        #     print(result.stderr)
        #     print(" ")

    except:
        pass

    print("Generated ", output, " at height: ", thickness)
    print(" ")
    return output


if __name__ == "__main__":
    arg_parse = argparse.ArgumentParser(description="SVG to STL generator! ")

    arg_parse.add_argument('-input-file', metavar='filename.svg', type=str,
                           help="SVG file", action='store', default='EC.svg')

    arg_parse.add_argument('-substrate-thickness', action='store', help="Thickness of the substrate", default=0.1)

    try:
        args = arg_parse.parse_args()
        args = vars(args)
    except:
        arg_parse.print_help()

    generateSTL(args['input_file'], height=args['substrate_thickness'])
