jQuery(function() {
    let settings = {}
    settings['substrate-thickness'] = 0.25;

    settings['ag-line-width'] = 1.2;
    settings['ag-syringe-diameter'] = 4.8;
    settings['ag-multiplier'] = 1.10;
    settings['ag-cure'] = true;

    settings['ec-line-width'] = 0.8;
    settings['ec-syringe-diameter'] = 4.8;
    settings['ec-multiplier'] = 1.0;
    settings['ec-cure'] = true;

    settings['el-line-width'] = 2.0;
    settings['el-syringe-diameter'] = 4.8;
    settings['el-multiplier'] = 1.0;
    settings['el-cure'] = true;

    tempSettings = ipcRenderer.sendSync("jsonData", { 'load': true });

    if (tempSettings['substrate-thickness'] !== undefined) {
        settings = tempSettings
    }

    $("#substrate-thickness").val(settings['substrate-thickness'])
    $("#ag-line-width").val(settings['ag-line-width'])
    $("#ag-syringe-diameter").val(settings['ag-syringe-diameter'])
    $("#ag-multiplier").val(settings['ag-multiplier'])
    $("#ag-cure").prop("checked", settings['ag-cure'])
    $("#ec-line-width").val(settings['ec-line-width'])
    $("#ec-syringe-diameter").val(settings['ec-syringe-diameter'])
    $("#ec-multiplier").val(settings['ec-multiplier'])
    $("#ec-cure").prop("checked", settings['ec-cure'])
    $("#el-line-width").val(settings['el-line-width'])
    $("#el-syringe-diameter").val(settings['el-syringe-diameter'])
    $("#el-multiplier").val(settings['el-multiplier'])
    $("#el-cure").prop("checked", settings['el-cure'])
    // 
    // Sliders and labels !!
    // 
    changeText("#substrate-label", "Substrate Thickness: " + $("#substrate-thickness").val())
    $("#substrate-thickness").on("input change", function() {
        changeText("#substrate-label", "Substrate Thickness: " + $(this).val())
        settings['substrate-thickness'] = parseFloat($(this).val());
    })

    changeText("#ag-syringe-diameter-label", $("#ag-syringe-diameter").val())
    changeText("#ag-line-width-label", $("#ag-line-width").val())
    changeText("#ag-multiplier-label", $("#ag-multiplier").val())

    $("#ag-line-width").on("input change", function() {
        changeText("#ag-line-width-label", $(this).val())
        settings['ag-line-width'] = parseFloat($(this).val());
    })
    $("#ag-syringe-diameter").on("input change", function() {
        changeText("#ag-syringe-diameter-label", $(this).val())
        settings['ag-syringe-diameter'] = parseFloat($(this).val());
    })
    $("#ag-multiplier").on("input change", function() {
        changeText("#ag-multiplier-label", $(this).val())
        settings['ag-multiplier'] = parseFloat($(this).val());
    })

    $("#ag-cure").on("click", function() {
        settings['ag-cure'] = $(this).prop("checked")
    })

    changeText("#ec-syringe-diameter-label", $("#ec-syringe-diameter").val())
    changeText("#ec-line-width-label", $("#ec-line-width").val())
    changeText("#ec-multiplier-label", $("#ec-multiplier").val())

    $("#ec-line-width").on("input change", function() {
        changeText("#ec-line-width-label", $(this).val())
        settings['ec-line-width'] = parseFloat($(this).val());
    })
    $("#ec-syringe-diameter").on("input change", function() {
        changeText("#ec-syringe-diameter-label", $(this).val())
        settings['ec-syringe-diameter'] = parseFloat($(this).val());
    })
    $("#ec-multiplier").on("input change", function() {
        changeText("#ec-multiplier-label", $(this).val())
        settings['ec-multiplier'] = parseFloat($(this).val());
    })
    $("#ec-cure").on("click", function() {
        settings['ec-cure'] = $(this).prop("checked")
    })

    changeText("#el-syringe-diameter-label", $("#el-syringe-diameter").val())
    changeText("#el-line-width-label", $("#el-line-width").val())
    changeText("#el-multiplier-label", $("#el-multiplier").val())

    $("#el-line-width").on("input change", function() {
        changeText("#el-line-width-label", $(this).val())
        settings['el-line-width'] = parseFloat($(this).val());
    })
    $("#el-syringe-diameter").on("input change", function() {
        changeText("#el-syringe-diameter-label", $(this).val())
        settings['el-syringe-diameter'] = parseFloat($(this).val());
    })
    $("#el-multiplier").on("input change", function() {
        changeText("#el-multiplier-label", $(this).val())
        settings['el-multiplier'] = parseFloat($(this).val());
    })
    $("#el-cure").on("click", function() {
        settings['el-cure'] = $(this).prop("checked")
    })


    //
    // Slider release and update settings
    $("#substrate-thickness, #ag-line-width, #el-line-width, #ec-line-width, #ag-syringe-diameter, #ec-syringe-diameter, #el-syringe-diameter, #ag-multiplier, #ec-multiplier, #el-multiplier, #ec-cure, #el-cure, #ag-cure").on("change", function() {
        ipcRenderer.send('jsonData', { 'load': false, 'settings': settings })
    })

    // 
    // Buttons
    // 

    $('#generateAll').on("click", function() {
        // var opt = { 'layer': 'AG', 'ag-line-width': $("#ag-line-width").val(), 'ag-syringe-diameter': $("#ag-syringe-diameter").val() }

        ipcRenderer.send("generateAll", settings)
    })

    $('#agGenerateSTL').on("click", function() {
        var opt = { 'layer': 'AG', 'substrate-thickness': settings['substrate-thickness'] }
        ipcRenderer.send("generateSTL", opt)
    })

    $('#ecGenerateSTL').on("click", function() {
        var opt = { 'layer': 'EC', 'substrate-thickness': settings['substrate-thickness'] }
        ipcRenderer.send("generateSTL", opt)
    })

    $('#elGenerateSTL').on("click", function() {
        var opt = { 'layer': 'EL', 'substrate-thickness': settings['substrate-thickness'] }
        ipcRenderer.send("generateSTL", opt)
    })

    $('#agGenerateGCode').on("click", function() {
        var opt = { 'layer': 'AG', 'layertype': 'conductive', 'line-width': settings['ag-line-width'], 'syringe-diameter': settings['ag-syringe-diameter'], 'substrate-thickness': settings['substrate-thickness'], 'ag-multiplier': settings['ag-multiplier'], 'ag-cure': settings['ag-cure'] }
        ipcRenderer.send("generateGCode", opt)
    })

    $('#ecGenerateGCode').on("click", function() {
        var opt = { 'layer': 'EC', 'layertype': 'electrochromic', 'line-width': settings['ec-line-width'], 'syringe-diameter': settings['ec-syringe-diameter'], 'substrate-thickness': settings['substrate-thickness'], 'ec-multiplier': settings['ec-multiplier'], 'ec-cure': settings['ec-cure'] }
        ipcRenderer.send("generateGCode", opt)
    })

    $('#elGenerateGCode').on("click", function() {
        var opt = { 'layer': 'EL', 'layertype': 'electrolyte', 'line-width': settings['el-line-width'], 'syringe-diameter': settings['el-syringe-diameter'], 'substrate-thickness': settings['substrate-thickness'], 'el-multiplier': settings['el-multiplier'], 'el-cure': settings['el-cure'] }
        ipcRenderer.send("generateGCode", opt)
    })


    $('#openFolder').on("click", function() {
        ipcRenderer.send("openExplorerFolder", "design")
    })

    $('#openSettingsFolder').on("click", function() {
        ipcRenderer.send("openExplorerFolder", "settings")
    })


})


function changeText(elem, text) {
    $(elem).html(text)
}