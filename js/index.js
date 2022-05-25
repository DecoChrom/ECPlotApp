if (typeof module === 'object') {
    window.module = module;
    module = undefined;
}


(function($) {
    console.log("App Started!")
        // $('#tabs-swipe.tabs').tabs();
})(jQuery)

//let materialize = M.AutoInit();

const { ipcRenderer } = require('electron')

$('#loadFileBtn').on('click', (function() {
    ipcRenderer.send('open-file-dialog')
}))


var fileDrop = document.getElementById('file-drop-div')

fileDrop.addEventListener('drop', function(e) {
    e.preventDefault();
    e.stopPropagation();

    // if (e.dataTransfer.files.length > 1) {
    //     ipcRenderer.send('error-message', ["Loading file.", "Can only load one file at a time.\n\nPlease select only one .svg file to load."])
    //     return;
    // }
    filePaths = [];

    for (let f of e.dataTransfer.files) {
        filePaths.push(f.path)
    }
    //     console.log('The file(s) you dragged: ', f)
    // ipcRenderer.send('load-file', e.dataTransfer.files)
    ipcRenderer.send('load-file', filePaths)
        // }
})

fileDrop.addEventListener('dragover', function(event) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy'
})

ipcRenderer.on("loadSVG", function(e, arg) {
    // console.log('loadSVG', arg['div'] !== undefined)
    if (arg['div'] !== undefined) {


        let domParser = new DOMParser();
        let svg = domParser.parseFromString(arg['svg-data'], 'image/svg+xml')

        // Set background color to white
        svg.getElementsByTagName('svg')[0].style.setProperty('background-color', 'white')

        let blob = new Blob([svg.documentElement.outerHTML], { type: 'image/svg+xml' })
        let url = URL.createObjectURL(blob);

        let svgObject = document.createElement('object');
        svgObject.data = url
        svgObject.type = 'image/svg+xml'
        svgObject.id = arg['div'] + "Object"

        let height = "";
        height += parseInt($(document).height() * 0.8)
        svgObject.style.setProperty('height', height + "px")
        svgObject.style.width = "auto"
        svgObject.style.objectFit = "contain"

        $('#' + arg['div']).html(svgObject)
    }

})


ipcRenderer.on('enableTab', function(e, arg) {
    if (arg['enable']) {
        $('#' + arg['tab']).removeClass("disabled")
        $('#' + arg['tab']).removeClass("hide")
    } else {
        $('#' + arg['tab']).addClass("disabled")
        $('#' + arg['tab']).addClass("hide")

    }

})


window.onresize = function() {

    let docHeight = parseInt($(document).height() * 0.8)

    if (document.getElementById("mainAGObject") !== null) {
        document.getElementById("mainAGObject").style.height = docHeight + "px"
    }
    if (document.getElementById("mainECObject") !== null) {
        document.getElementById("mainECObject").style.height = docHeight + "px"
    }

    if (document.getElementById("mainELObject") !== null) {
        document.getElementById("mainELObject").style.height = docHeight + "px"
    }
}


// quick load files
// ipcRenderer.send('load-file', [
//     'D:\\Dropbox\\DecoChrom\\Development\\ECPlot\\PrintDesigns\\IllustratorScripting\\test_design_AG.svg',
//     'D:\\Dropbox\\DecoChrom\\Development\\ECPlot\\PrintDesigns\\IllustratorScripting\\test_design_EC.svg',
//     'D:\\Dropbox\\DecoChrom\\Development\\ECPlot\\PrintDesigns\\IllustratorScripting\\test_design_EL.svg'
// ])

ipcRenderer.send('load-file', [
    'D:\\Dropbox\\DecoChrom\\Development\\ECPlot\\EvalDisplays\\Eval_AG-01.svg',
    'D:\\Dropbox\\DecoChrom\\Development\\ECPlot\\EvalDisplays\\Eval_EC-01.svg',
    'D:\\Dropbox\\DecoChrom\\Development\\ECPlot\\EvalDisplays\\Eval_EL-01.svg'
])


// jQuery(function() {
//     window.setTimeout(function() {
//         $('ul.tabs').tabs("select", "swipe-print");
//     }, 1)
// })