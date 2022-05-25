const { Console } = require('console')
const electron = require('electron')
const app = electron.app
const screen = electron.screen
const dialog = electron.dialog
const { ipcMain } = require('electron')
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const userDataPath = (electron.app || electron.remote.app).getPath('userData');
const settingsPath = path.join(userDataPath, "settings.json");

const url = require('url')
const fs = require('fs')
const { errorMonitor } = require('events')
const { PythonShell } = require('python-shell')



let mainWindow

delete process.env.ELECTRON_ENABLE_SECURITY_WARNINGS;
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

// TODO Add config json file

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize

    if (!fs.existsSync(settingsPath)) {
        fs.writeFile(settingsPath, "{}", function(err) {
            console.log("Created settings.json succesfully");
        })
    }


    //    mainWindow = new BrowserWindow({ width: width * .75, height: height * .75, webPreferences: { nodeIntegration: true } })
    mainWindow = new BrowserWindow({ width: 1400, height: 900, webPreferences: { nodeIntegration: true } })
        // mainWindow.setResizable(false)

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, '../main.html'),
        protocol: 'file:',
        slashes: true
    }))

    console.log(app.getAppPath())
        // Open the DevTools.

    mainWindow.webContents.openDevTools()
        // mainWindow.menuBarVisible = false

    mainWindow.on('closed', function() {
        mainWindow = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function() {
    if (mainWindow === null) {
        createWindow()
    }
})

ipcMain.on('open-file-dialog', (event, arg) => {
    dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'multiSelections'],
        filters: [
            { name: 'Design files', extensions: ['svg'] }
        ]
    }).then(result => {
        if (!result.canceled) {
            loadFile(result.filePaths)
        }
    })
})

ipcMain.on('load-file', (event, arg) => {
    loadFile(arg)
})

ipcMain.on('error-message', (event, arg) => {
    dialog.showErrorBox(arg[0], arg[1])
})

projectPath = "";
filePathAG = "";
filePathEC = "";
filePathEL = "";
filePathCom = "";

function loadFile(arg) {
    // console.log(arg)
    if (!Array.isArray(arg)) {
        return;
    }

    foundAG = false;
    foundEC = false;
    foundEL = false;

    for (let filePath of arg) {
        if (filePath.search("_AG") != -1) {
            filePathAG = filePath;
            foundAG = true;
        }
        if (filePath.search("_EC") != -1) {
            filePathEC = filePath;
            foundEC = true;
        }
        if (filePath.search("_EL") != -1) {
            filePathEL = filePath;
            foundEL = true;
        }
    }

    if (!foundAG && !foundEC && !foundEL) {
        dialog.showErrorBox("Filenames", "No usable filenames were found.")
        return;
    }

    if (foundAG) {
        loadSVGDataToDiv('mainAG', filePathAG);
        enableTab('agTab', true);
        enableTab('comTab', true);
        projectPath = filePathAG
    }
    if (foundEC) {
        loadSVGDataToDiv('mainEC', filePathEC)
        enableTab('ecTab', true)
        enableTab('comTab', true)
        projectPath = filePathEC
    }
    if (foundEL) {
        loadSVGDataToDiv('mainEL', filePathEL)
        enableTab('elTab', true)
        enableTab('comTab', true)
        projectPath = filePathEL
    }
    // var extension = arg.split('.')[arg.split('.').length - 1]
    // if (extension != "svg") {
    //     dialog.showErrorBox('Loading file.', 'This program only supports svg files.')
    //     return;
    // }


}


ipcMain.on("saveSVGData", function(e, arg) {
    console.log(arg[0], arg[1])
    dialog.showErrorBox(arg[0], arg[1])
})

ipcMain.on("getFilePaths", function(e, arg) {
    msg = { 'filePathAG': filePathAG, 'filePathEC': filePathEC, 'filePathEL': filePathEL, 'filePathCom': filePathCom }
    e.returnValue = msg

})
ipcMain.on("generateGCode", function(e, arg) {

    let opts = {}
    opts = {
        mode: 'text',
        pythonPath: 'python',
        args: []
    }

    filePath = "";
    if (arg['layer'] == "AG") {
        filePath = filePathAG
    }
    if (arg['layer'] == "EC") {
        filePath = filePathEC
    }
    if (arg['layer'] == "EL") {
        filePath = filePathEL
    }

    if (filePath.length == 0) {
        return
    }
    if (filePath.indexOf(".svg") == -1) {
        return
    }

    filePath = filePath.substring(0, filePath.indexOf(".svg")) + ".stl"

    projectName = ""

    console.log(arg)
    if (filePathAG.length > 0 && arg['layer'] == "AG") {
        opts.args.push('-ag-input-file')
        opts.args.push(filePathAG)
        projectName = filePathAG.substring(filePathAG.lastIndexOf("\\"), filePathAG.lastIndexOf("."))

        opts.args.push('-ag-syringe-diameter')
        opts.args.push(arg['syringe-diameter'])

        opts.args.push('-ag-line-width')
        opts.args.push(arg['line-width'])

        opts.args.push('-ag-multiplier')
        opts.args.push(arg['ag-multiplier'])

        opts.args.push('-ag-cure')
        opts.args.push(arg['ag-cure'])

    }

    if (filePathEC.length > 0 && arg['layer'] == "EC") {
        opts.args.push('-ec-input-file')
        opts.args.push(filePathEC)
        projectName = filePathEC.substring(filePathEC.lastIndexOf("\\"), filePathEC.lastIndexOf("."))

        opts.args.push('-ec-syringe-diameter')
        opts.args.push(arg['syringe-diameter'])

        opts.args.push('-ec-line-width')
        opts.args.push(arg['line-width'])

        opts.args.push('-ec-multiplier')
        opts.args.push(arg['ec-multiplier'])

        opts.args.push('-ec-cure')
        opts.args.push(arg['ec-cure'])

    }
    if (filePathEL.length > 0 && arg['layer'] == "EL") {
        opts.args.push('-el-input-file')
        opts.args.push(filePathEL)
        projectName = filePathEL.substring(filePathEL.lastIndexOf("\\"), filePathEL.lastIndexOf("."))

        opts.args.push('-el-syringe-diameter')
        opts.args.push(arg['syringe-diameter'])

        opts.args.push('-el-line-width')
        opts.args.push(arg['line-width'])

        opts.args.push('-el-multiplier')
        opts.args.push(arg['el-multiplier'])

        opts.args.push('-el-cure')
        opts.args.push(arg['el-cure'])

    }

    if (projectPath.length == 0) {
        return
    }


    filePathCom = projectPath.substring(0, projectPath.lastIndexOf("\\")) + projectName + "_gen.gcode"

    // filePathCom = projectPath.substring(0, projectPath.lastIndexOf("\\")) + "\\generated.gcode"
    opts.args.push('-layers')


    opts.args.push(arg['layer'])

    opts.args.push('-o')
    opts.args.push(filePathCom)

    opts.args.push('-substrate-thickness')
    opts.args.push(arg['substrate-thickness'])

    console.log(opts)
    PythonShell.run('python/ECPlotter.py', opts, function(err, results) {
        if (err) {
            console.error(err)
        }

        resultString = ""
        for (let line of results) {
            resultString += line + "\n"
        }
        console.log(resultString)

        let opts = {
            message: resultString,
            type: "info",
            title: "Python output"
        }
        mainWindow.webContents.send("loadGCode", filePathCom)
        dialog.showMessageBox(mainWindow, opts)
    })

    // opts = {
    //     mode: 'text',
    //     pythonPath: 'python',
    //     args: [
    //         '-stl-file', filePath,
    //         '-layertype', arg['layertype'],
    //         '-line-width', arg['line-width'],
    //         '-syringe-diameter', arg['syringe-diameter'],
    //         '-substrate-thickness', arg['substrate-thickness'],
    //     ]
    // }

    // PythonShell.run('python/GCodeGenerator.py', opts, function(err, results) {
    //     if (err) {
    //         console.error(err)
    //     }

    //     resultString = ""
    //     for (let line of results) {
    //         resultString += line + "\n"
    //     }
    //     let opts = {
    //         message: resultString,
    //         type: "info",
    //         title: "Python output"
    //     }
    //     dialog.showMessageBox(mainWindow, opts)
    // })

})


ipcMain.on("generateSTL", function(e, arg) {

    let opts = {}
    filePath = "";
    if (arg['layer'] == "AG") {
        filePath = filePathAG
    }
    if (arg['layer'] == "EC") {
        filePath = filePathEC
    }
    if (arg['layer'] == "EL") {
        filePath = filePathEL
    }

    if (filePath.length == 0) {
        return
    }
    opts = {
        mode: 'text',
        pythonPath: 'python',
        args: [
            '-input-file', filePath,
            '-substrate-thickness', arg['substrate-thickness'],
        ]
    }
    PythonShell.run('python/STLGenerator.py', opts, function(err, results) {
        if (err) {
            console.error(err)
        }

        resultString = ""
        for (let line of results) {
            resultString += line + "\n"
        }
        let opts = {
            message: resultString,
            type: "info",
            title: "Python output"
        }
        dialog.showMessageBox(mainWindow, opts)
    })

})

ipcMain.on("generateAll", function(e, arg) {
    let opts = {}
    opts = {
        mode: 'text',
        pythonPath: 'python',
        args: []
    }
    console.log(arg)
    layers = []
    projectName = ""
    if (filePathAG.length > 0) {
        layers.push("AG")
        opts.args.push('-ag-input-file')
        opts.args.push(filePathAG)
        projectName = filePathAG.substring(filePathAG.lastIndexOf("\\"), filePathAG.lastIndexOf("."))
        opts.args.push('-ag-syringe-diameter')
        opts.args.push(arg['ag-syringe-diameter'])

        opts.args.push('-ag-line-width')
        opts.args.push(arg['ag-line-width'])

        opts.args.push('-ag-multiplier')
        opts.args.push(arg['ag-multiplier'])

        opts.args.push('-ag-cure')
        opts.args.push("true")

    }

    if (filePathEC.length > 0) {
        layers.push("EC")
        opts.args.push('-ec-input-file')
        opts.args.push(filePathEC)
        projectName = filePathEC.substring(filePathEC.lastIndexOf("\\") + 1, filePathEC.lastIndexOf("."))

        opts.args.push('-ec-syringe-diameter')
        opts.args.push(arg['ec-syringe-diameter'])

        opts.args.push('-ec-line-width')
        opts.args.push(arg['ec-line-width'])

        opts.args.push('-ec-multiplier')
        opts.args.push(arg['ec-multiplier'])

        opts.args.push('-ec-cure')
        opts.args.push("true")

    }
    if (filePathEL.length > 0) {
        layers.push("EL")
        opts.args.push('-el-input-file')
        opts.args.push(filePathEL)
        projectName = filePathEL.substring(filePathEL.lastIndexOf("\\"), filePathEL.lastIndexOf("."))

        opts.args.push('-el-syringe-diameter')
        opts.args.push(arg['el-syringe-diameter'])

        opts.args.push('-el-line-width')
        opts.args.push(arg['el-line-width'])

        opts.args.push('-el-multiplier')
        opts.args.push(arg['el-multiplier'])

        opts.args.push('-el-cure')
        opts.args.push("true")
    }

    if (projectPath.length == 0) {
        return
    }

    projectName = projectName.substring(0, projectName.length - 3)
    filePathCom = projectPath.substring(0, projectPath.lastIndexOf("\\")) + projectName + ".gcode"
    console.log(projectPath)
    console.log(projectName)
    console.log(filePathCom)
    opts.args.push('-layers')
    opts.args.push(layers)

    opts.args.push('-o')
    opts.args.push(filePathCom)

    opts.args.push('-substrate-thickness')
    opts.args.push(arg['substrate-thickness'])

    console.log(opts)
    PythonShell.run('python/ECPlotter.py', opts, function(err, results) {
        if (err) {
            console.error(err)
        }

        resultString = ""
        for (let line of results) {
            resultString += line + "\n"
        }


        let opts = {
            message: resultString,
            type: "info",
            title: "Python output"
        }
        mainWindow.webContents.send("loadGCode", filePathCom)
        dialog.showMessageBox(mainWindow, opts)
    })
})

function enableTab(tab, enable) {
    mainWindow.webContents.send('enableTab', { 'tab': tab, 'enable': enable })
}

function loadSVGDataToDiv(div, filePath, tab) {
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            console.error("Something went wrong loading the file: " + err.message)
            return
        }
        mainWindow.webContents.send('loadSVG', { 'div': div, 'svg-data': data })
    })

}

ipcMain.on("openExplorerFolder", function(e, arg) {
    if (arg == "design") {
        electron.shell.showItemInFolder(projectPath)
    }
    if (arg == "settings") {
        electron.shell.showItemInFolder(path.join(userDataPath, "settings.json"))
    }


})

ipcMain.on("jsonData", function(e, arg) {
    if (arg['load']) {
        data = JSON.parse(fs.readFileSync(settingsPath))
        e.returnValue = data

    } else {
        fs.writeFileSync(settingsPath, JSON.stringify(arg['settings']))
    }
})