class NoobProcess {
    currentStep = 1
    maxSteps = 5
    fileName = "ClothHeart-01.svg"
        // fileName = null
    svgData = ""

    svgSubstrateLayer = null
    svgDebugLayer = null
    svgElectrochromicLayer = null
    svgConductiveLayer = null
    svgElectrolyteLayer = null
    svgSelectLayer = null
    connectorGroup = null
    connectionGroup = null
    connectorSize = 0
    numConnectors = 0
    usableElements = ["rect", "circle", "ellipse", "line", "polyline", "polygon", "path"]
    printGroup = null

    gridSize = 2.54

    draw = null
    draw2 = null
    borderLines = null
    selectedLine = null

    print_pos_x = 0
    print_pos_y = 0
    red = "#f06"
    green = "#0f6"


    constructor() {
        this.draw = SVG().width("100%").height("700")
        this.draw.addTo("#svgWindow")

        $(document).on("mousemove", function(e) {
            let p = this.draw.node.createSVGPoint()
            p.x = e.pageX
            p.y = e.pageY
            p = p.matrixTransform(this.draw.node.getScreenCTM().inverse())
            $("#coords").html(Number(e.pageX).toFixed(2) + " - " + Number(e.pageY).toFixed(2) + "<br/>" +
                Number(p.x).toFixed(2) + " - " + Number(p.y).toFixed(2))
        }.bind(this))
        $("#btnNextStep").on("click", this.nextStep.bind(this))
        $("#btnPrevStep").on("click", this.prevStep.bind(this))
        $('#loadFileForm').on('change', function(e) { this.fileSelected(e.target.files[0]) }.bind(this))

        $('#substrate_width').val(297)
        $('#substrate_height').val(210)

        setTimeout(function() { this.setSvgCanvasDimensions(297, 210) }.bind(this), 150)

        $('#set_substrate_dimensions').on('click', function() {
            let w = $('#substrate_width').val()
            let h = $('#substrate_height').val()

            this.setSvgCanvasDimensions(w, h)

        }.bind(this))

        $('#change_substrate_orientation').on('click', function() {
            let h = $('#substrate_width').val()
            let w = $('#substrate_height').val()

            $('#substrate_width').val(w)
            $('#substrate_height').val(h)


            this.setSvgCanvasDimensions(w, h)

        }.bind(this))

        $('#print_pos_x').on("input propertychange", function(e) {
            // this.svgElectrochromicLayer.x(Number(e.target.value))
            this.generateRoute()
        }.bind(this))

        $('#print_pos_y').on("input propertychange", function(e) {
            // this.svgElectrochromicLayer.y(Number(e.target.value))
            this.generateRoute()
        }.bind(this))

        $('#export').on('click', function() {
            console.log(this.draw.svg())
        }.bind(this))

        $("#btnReady").on("click", this.nextStep.bind(this))

        $("#addConnectionsS").on("click", function() { this.createConnectors(1) }.bind(this))
        $("#addConnectionsL").on("click", function() { this.createConnectors(2) }.bind(this))

        $("#exportEC").on("click", function() { this.export("EC") }.bind(this))
        $("#exportAG").on("click", function() { this.export("AG") }.bind(this))
        $("#exportEL").on("click", function() { this.export("EL") }.bind(this))

        fetch(this.fileName).then(response => response.text()).then((data) => {
            this.svgData = data;
            this.draw.svg(this.svgData)
            this.nextStep()

            this.createConnectors(2)
        })
    }

    update() {
        // this.change_display()
        // this.change_footer_text()
        switch (this.currentStep) {
            case 1:
                break;
            case 2:
                this.placePrint()
                break;
            case 3:
                this.processConductives()
                break;

        }

    }

    change_display() {
        $(".wrapper").children("div").each(function(index, value) {
            $(value).hide()
        })
        $("#step" + this.currentStep).css("display", "flex");
    }

    change_footer_text() {
        $("#footerLabel").text("Step " + this.currentStep + " of 5")
        if (this.currentStep == 1) {
            $("#btnPrevStep").hide()
        } else if ($("#btnPrevStep").is(":hidden")) {
            $("#btnPrevStep").show()
        }

        if (this.currentStep == this.maxSteps || this.currentStep == 1) {
            $("#btnNextStep").hide()
        } else if ($("#btnNextStep").is(":hidden")) {
            $("#btnNextStep").show()
        }


    }
    nextStep() {
        this.currentStep += 1
        this.update()
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.update()
        }

    }

    fileSelected(file) {
        if (file == null) return;

        let reader = new FileReader();
        reader.readAsText(file)

        reader.onload = function() {
            this.svgData = reader.result
            this.draw.svg(this.svgData)
            this.nextStep()
        }.bind(this)

        reader.onerror = function() {
            console.log(reader.error);
        }
    }

    setSvgCanvasWidth(width) {
        if (width <= 10) return;

        let vb = this.draw.viewbox()
        vb.width = width
        vb.w = width
        this.draw.viewbox(vb)


        // this.draw.width(width)
    }

    setSvgCanvasHeight(height) {
        if (height <= 10) return;
        // this.draw.height(height)
        let vb = this.draw.viewbox()
        vb.height = height
        vb.h = height
        this.draw.viewbox(vb)

    }

    setSvgCanvasDimensions(width, height) {
        if (height <= 10 || width <= 10 || height >= 400 || width >= 400) { alert("Dimensions are too small or large.\n\nSmallest dimension possible: 10mm.\nLargest dimension possible: 400mm") }

        let vb = this.draw.viewbox()
        vb.height = height
        vb.h = height
        vb.width = width
        vb.w = width
        this.svgSubstrateLayer.width(vb.w)
        this.svgSubstrateLayer.height(vb.h)
        this.svgSubstrateLayer.viewbox(vb)
        this.draw.viewbox(vb)

    }

    placePrint() {
        // if (this.draw != null) return
        // Setup Main Window

        // Create a bounding substrate svg
        if (this.svgSubstrateLayer == null) { this.createSubstrateLayer(this.draw) }


        // Set Loaded SVG component to draggable and add dimensions for proper viweing
        if (this.svgElectrochromicLayer == null) {
            this.createElectrochromicLayer(this.draw)
        } else {
            this.svgElectrochromicLayer.draggable()
            this.svgElectrochromicLayer.css("cursor", "pointer")
        }

        // Add SVG for conductive layer
        if (this.svgConductiveLayer == null) { this.createConductiveLayer() }

        if (this.svgSelectLayer != null) { this.svgSelectLayer.hide() }

        // Add SVG for debug information
        if (this.svgDebugLayer == null) { this.createDebugLayer() } else { this.svgDebugLayer.hide() }

    }

    createConductiveLayer() {
        this.svgConductiveLayer = SVG()
        this.svgConductiveLayer.attr("id", "conductive_svg")
        this.svgConductiveLayer.attr("width", "100%")
        this.svgConductiveLayer.attr("height", "100%")
        this.svgConductiveLayer.attr("fill", "#bfbf99")
        this.svgConductiveLayer.css("color", "#bfbf99")

        this.svgConductiveLayer.addTo(this.svgSubstrateLayer)
    }

    createDebugLayer() {
        this.svgDebugLayer = SVG()
        this.svgDebugLayer.attr("id", "debug_svg")
        this.svgDebugLayer.attr("width", "100%")
        this.svgDebugLayer.attr("height", "100%")
        this.svgDebugLayer.addTo(this.svgSubstrateLayer)

    }

    createSubstrateLayer(draw) {
        this.svgSubstrateLayer = SVG()
        this.svgSubstrateLayer.attr("id", "substrate_svg")
        this.svgSubstrateLayer.attr("width", "297")
        this.svgSubstrateLayer.attr("height", "210")
        this.svgSubstrateLayer.attr("viewBox", "0 0 297 210")

        this.svgSubstrateLayer.addTo(draw)
        let boundRect = this.svgSubstrateLayer.rect()
        boundRect.attr("width", "100%")
        boundRect.attr("height", "100%")
        boundRect.attr("fill", "white")
        boundRect.attr("stroke", "grey")
        boundRect.attr("stroke-width", "0.2")

    }

    createElectrochromicLayer(draw) {
        this.svgElectrochromicLayer = draw.children()[0]

        this.svgElectrochromicLayer.find("script").remove()

        let ec = this.svgElectrochromicLayer
        let vb = ec.viewbox()
        ec.width(vb.w)
        ec.height(vb.h)
        ec.draggable()
        ec.on("dragmove", function() { this.generateRoute() }.bind(this))
        ec.css("cursor", "pointer")
        ec.attr("id", "electrochromic_svg")
        ec.attr("x", 20)
        ec.attr("y", 20)

        ec.on('dragmove', function(e) {
            this.print_pos_x = Number(e.target.attributes.x.value)
            this.print_pos_y = Number(e.target.attributes.y.value)
            this.updatePrintPos()
        }.bind(this))

        ec.addTo(this.svgSubstrateLayer)


        return ec
    }

    createConnectors(size) {
        let numConnectors = this.getECFieldCount()


        let width = 1.5
        let pitch = 2.54

        if (size == 2) {
            width = 5
            pitch = 10
        }
        this.connectorSize = size

        if (this.connectorGroup !== null) { this.connectorGroup.clear() } else {
            this.connectorGroup = this.draw.group()
            this.connectorGroup.draggable()
            this.connectorGroup.css({ 'cursor': 'pointer' })
            this.connectorGroup.attr({ 'id': "connectors" })
        }


        for (let i = 0; i < numConnectors; i++) {
            // this.connectorGroup.rect(width, 10).fill('#000').x((i * pitch))
            this.connectorGroup.rect(width, 10).x((i * pitch))
        }

        this.svgConductiveLayer.add(this.connectorGroup)
        this.svgConductiveLayer.insertBefore(this.svgElectrochromicLayer)

        this.generateRoute()
        this.connectorGroup.on("dragmove", function() { this.generateRoute() }.bind(this))
    }

    getECFieldCount() {
        // Clone loaded design
        let children = this.svgElectrochromicLayer.clone()
            // Flatten it to avoid grouping problems
        children = children.flatten()
            // Get the children
        children = children.children()

        let usableCount = 0

        children.forEach(function(v, i) {
            if (this.usableElements.includes(v.type)) { usableCount++ }
        }.bind(this))
        this.numConnectors = usableCount
        children.remove()
        return usableCount
    }
    processConductives() {
        // Setup Main Window
        this.draw.addTo("#svgWindow2")
        let substrate = this.svgSubstrateLayer
        let print = this.svgElectrochromicLayer
        let select = this.svgSelectLayer
        let debug = this.svgDebugLayer

        if (select == null) {
            select = SVG()
            select.attr("id", "select_svg")
            select.attr("width", "100%")
            select.attr("height", "100%")
            select.insertBefore(debug)
        } else {
            select.show()
        }
        this.svgSelectLayer = select
        let w = substrate.node.width.baseVal.valueInSpecifiedUnits
        let h = substrate.node.height.baseVal.valueInSpecifiedUnits


        print.draggable(false)
        print.css("cursor", null)

        let margin = 10
        let lineWidth = 4
        let green = this.green
        let red = this.red

        this.borderLines = []
        let borderLines = this.borderLines

        borderLines.push(select.line(0 + margin, 0, w - margin, 0).stroke({ color: "#f06", width: lineWidth }).attr('id', 'topLine'))
        borderLines.push(select.line(0, 0 + margin, 0, h - margin).stroke({ color: "#f06", width: lineWidth }).attr('id', 'leftLine'))
        borderLines.push(select.line(0 + margin, h, w - margin, h).stroke({ color: "#f06", width: lineWidth }).attr('id', 'bottomLine'))
        borderLines.push(select.line(w, 0 + margin, w, h - margin).stroke({ color: "#f06", width: lineWidth }).attr('id', 'rightLine'))
            // rightLine.on("mouseover", function() { this.stroke({ color: green }).css('cursor', 'pointer') })
            // rightLine.on("mouseout", function() { this.stroke({ color: red }).css('cursor', null) })

        borderLines.forEach(function(line) {
            line.on("mouseover", function() { this.stroke({ color: green }).css('cursor', 'pointer') })
            line.on("mouseout", function() { this.stroke({ color: red }).css('cursor', null) })
            line.on("click", function(e) {
                this.selectedLine = select.find("#" + e.target.attributes.id.value)[0]
                this.resetBorderStyle()
                this.generateConductiveLayer()
            }.bind(this))
        }.bind(this))

        this.selectedLine = borderLines[0]
        this.resetBorderStyle()

        this.generateConductiveLayer()
    }

    resetBorderStyle() {
        let green = this.green
        let red = this.red
        this.borderLines.forEach(function(line) {
            if (line !== this.selectedLine) {
                line.stroke({ color: red })
                line.on("mouseover", function() { this.stroke({ color: green }).css('cursor', 'pointer') })
                line.on("mouseout", function() { this.stroke({ color: red }).css('cursor', null) })
            } else {
                this.selectedLine.off("mouseout")
                line.stroke({ color: green })

            }
        }.bind(this))

    }

    generateConductiveLayer() {
        let print = this.svgElectrochromicLayer
        let sub = this.svgSubstrateLayer
        let selectedLine = this.selectedLine
        let dL = this.svgDebugLayer
        dL.show()
        dL.clear()

        let transform = sub.node.getScreenCTM().inverse()

        let usableElements = ["rect", "circle", "ellipse", "line", "polyline", "polygon", "path"]

        let path = print.children()[1]

        let i, li
        li = 25

        for (i = 0; i < li; i++) {
            let p = sub.node.createSVGPoint()
            let l = (i / li) * path.length()

            p = path.node.getPointAtLength(l)

            let tfm = sub.node.createSVGTransformFromMatrix(sub.node.getScreenCTM().inverse().multiply(path.node.getScreenCTM()))

            p = p.matrixTransform(tfm.matrix)
            sub.circle(2).move(p.x - 1, p.y - 1).css("fill", "#f00")

        }



        print.children().forEach(function(e) {
            if (usableElements.includes(e.type)) {
                let curBox = e.rbox()

                let pSelectLineLeft = dL.node.createSVGPoint()
                pSelectLineLeft.x = selectedLine.x()
                pSelectLineLeft.y = selectedLine.y()

                let pSelectLineRight = dL.node.createSVGPoint()
                pSelectLineRight.x = selectedLine.x() + selectedLine.width()
                pSelectLineRight.y = selectedLine.y()



                let pTopLeft = dL.node.createSVGPoint()
                pTopLeft.x = curBox.x
                pTopLeft.y = curBox.y
                pTopLeft = pTopLeft.matrixTransform(transform) // Convert to SVG coords

                let pTopRight = dL.node.createSVGPoint()
                pTopRight.x = curBox.x + curBox.width
                pTopRight.y = curBox.y
                pTopRight = pTopRight.matrixTransform(transform)

                let pBottomLeft = dL.node.createSVGPoint()
                pBottomLeft.x = curBox.x
                pBottomLeft.y = curBox.y + curBox.height
                pBottomLeft = pBottomLeft.matrixTransform(transform)

                let pBottomRight = dL.node.createSVGPoint()
                pBottomRight.x = curBox.x + curBox.width
                pBottomRight.y = curBox.y + curBox.height
                pBottomRight = pBottomRight.matrixTransform(transform)


                // dL.circle(2).move(pSelectLineLeft.x, pSelectLineLeft.y)
                // dL.circle(2).move(pSelectLineRight.x, pSelectLineRight.y)


                // dL.circle(2).move(pTopLeft.x, pTopLeft.y)
                // dL.circle(2).move(pTopRight.x, pTopRight.y)
                // dL.circle(2).move(pBottomLeft.x, pBottomLeft.y)
                // dL.circle(2).move(pBottomRight.x, pBottomRight.y)



                // this.draw2.line(rb1.x, rb1.y, rb2.x, rb2.y).stroke({ color: "#f06", width: 1 })
                // console.log(this.selectedLine.bbox())
                // console.log(e.bbox())
            }

        }.bind(this))

    }

    updatePrintPos() {
        let sub = this.svgSubstrateLayer.node
        let print = this.svgElectrochromicLayer.node
        let p = sub.createSVGPoint()
        p.x = print.getBoundingClientRect().x
        p.y = print.getBoundingClientRect().y
            // let tfm = sub.createSVGTransformFromMatrix(sub.getScreenCTM().inverse().multiply(print.getScreenCTM()))

        p = p.matrixTransform(sub.getScreenCTM().inverse())

        console.log(p)

        $("#print_pos_x").val(Number(p.x).toFixed(2))
        $("#print_pos_y").val(Number(p.y).toFixed(2))
    }

    getUsablePrintElements() {
        let elements = []

        this.svgElectrochromicLayer.children().forEach(function(v, i) {
            if (this.usableElements.includes(v.type)) {
                elements.push(v)
            }
        }.bind(this))

        return elements

    }
    connectConnectorToField() {
        if (this.connectorGroup == null) { return }
        let sTime = performance.now()
        let printElements = this.getUsablePrintElements()
        let sub = this.svgSubstrateLayer
        this.svgDebugLayer.clear()

        if (this.connectionGroup !== null) { this.connectionGroup.clear() } else {
            this.connectionGroup = this.draw.group()
            this.connectionGroup.attr({ 'id': "connections" })
            this.svgConductiveLayer.add(this.connectionGroup)
                // this.svgConductiveLayer.insertBefore(this.svgElectrochromicLayer)

        }

        for (let i = 0; i < this.numConnectors; i++) {
            let connector = this.connectorGroup.children()[i]
            let element = printElements[i]
            let x0 = connector.cx()
            let y0 = connector.cy()
            let x1 = connector.cx()
            let y1 = connector.cy()

            let x2 = element.cx()
            let y2 = element.cy()
            let x3 = 0
            let y3 = 0

            // Find connector end points based on position relative to print elements
            if (y1 < y2) {
                y0 = connector.y() + connector.height() - 1
                y1 = connector.y() + connector.height() + 3
            } else {
                y0 = connector.y() + 1
                y1 = connector.y() - 3
            }


            // Find point on print element that is inside
            if (y1 < y2) {
                let p = sub.node.createSVGPoint()
                p.x = x2
                p.y = element.y()
                y3 = element.y() - 1
                x3 = element.cx()

                for (let i = 0; i < 50; i++) {

                    p.y += (i / 50) * (element.height() / 2)

                    if (element.node.isPointInFill(p)) { y2 = p.y; break }
                }
            } else {
                let p = sub.node.createSVGPoint()
                p.x = x2
                p.y = element.y() + element.height()
                y3 = element.y() + element.height() + 1
                x3 = element.cx()


                for (let i = 0; i < 50; i++) {

                    p.y -= (i / 50) * (element.height() / 2)

                    if (element.node.isPointInFill(p)) { y2 = p.y; break }
                }

            }

            let tfm = sub.node.createSVGTransformFromMatrix(sub.node.getScreenCTM().inverse().multiply(element.node.getScreenCTM()))
            let p = sub.node.createSVGPoint()
            let p2 = sub.node.createSVGPoint()
            p2.x = x3
            p2.y = y3
            p2 = p2.matrixTransform(tfm.matrix)
            x3 = p2.x
            y3 = p2.y

            p.x = x2
            p.y = y2
            p = p.matrixTransform(tfm.matrix)
            x2 = p.x
            y2 = p.y

            this.connectionGroup.polyline([
                [x0, y0],
                [x1, y1],
                [x3, y3],
                [x2, y2]
            ]).fill("none").stroke({ color: "#bfbf99", width: this.connectorSize == 2 ? 2.5 : 1.25, linecap: "round", linejoin: "round" })



        }
        // console.log(Number(performance.now() - sTime).toFixed(4) + "ms");
    }


    generateRoute() {
        let gridWidth = 0
        let gridHeight = 0
        let gridX = 0
        let gridY = 0
        this.connectConnectorToField()
            // this.svgDebugLayer.rect(1, 1).fill('#f00')



    }

    export (layer) {
        let data = ""
        let fn = ""
        let subtemp = SVG()
        subtemp.attr("width", this.svgSubstrateLayer.width() + "mm")
        subtemp.attr("height", this.svgSubstrateLayer.height() + "mm")
        subtemp.attr("viewbox", this.svgSubstrateLayer.viewbox())
        subtemp.attr("xml:space", "preserve")

        if (layer == "EC") {
            let contemp = this.svgElectrochromicLayer.clone()
            subtemp.add(contemp)
            subtemp.flatten()

            data += subtemp.svg()
            fn = "EC.svg"
        }

        if (layer == "AG") {
            let contemp = this.svgConductiveLayer.clone()
            subtemp.add(contemp)
            subtemp.flatten()
            data += subtemp.svg()
            fn = "AG.svg"
        }

        if (layer == "EL") {
            let eltemp = this.svgElectrolyteLayer
            if (eltemp == null) {
                eltemp = SVG().rect(0, 0, 10, 10)
            } else {
                eltemp.clear()
            }

            let elements = this.getUsablePrintElements()

            let group = SVG().group();

            elements.forEach(function(v) { group.add(v.clone()) })


            subtemp.add(eltemp)
            data += subtemp.svg()
        }


        ipcRenderer.send('saveSVGData', ["BoB", data])

        let blob = new Blob([data], { type: "text/plain" })

        let saveLink = document.createElement("a")
        saveLink.download = fn
        saveLink.href = window.URL.createObjectURL(blob)

        // saveLink.click()

    }
}

const noobProcess = new NoobProcess()

noobProcess.update()