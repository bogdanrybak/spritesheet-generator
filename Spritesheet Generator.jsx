/***
/* Somewhat simplistic spritesheet generation script
/* Author: @bogdan_rybak github.com/bogdanrybak
/*/

#target photoshop
var strLabelPaddingType = "Padding Type:";

var selectedIndex = 0;
// the drop down list indexes for each padding type
var uniformIndex = 0;
var separateIndex = 1;

function SpriteGenerator()
{
    var dlg,
      sheetName,
      dataFileName = "_spritesheets.txt",
      frames = 1,
      currentDoc,
      columns = 4,
      rows = 4,
      paddingUniform = 0,
      paddingLeft = 0,
      paddingRight = 0,
      paddingTop = 0,
      paddingBottom = 0,
      spriteWidth,
      spriteHeight;

    function createSpriteSheet(onFinished)
    {
        try
        {
            dlg.hide();
            
            columns = dlg.columns.text;
            rows = dlg.rows.text;

            paddingUniform = parseInt(dlg.paddingUniform.text);

            paddingLeft = parseInt(dlg.paddingLeft.text);
            paddingRight = parseInt(dlg.paddingRight.text);
            paddingTop = parseInt(dlg.paddingTop.text);
            paddingBottom = parseInt(dlg.paddingBottom.text);

            sheetName = dlg.sheetName.text + "_" + currentDoc.width.value + "x" + currentDoc.height.value;
            var startFrame = parseInt(dlg.startFrame.text);
            
            var spriteWidthPadded = spriteWidth; 
            var spriteHeightPadded = spriteHeight;
            alert("index" + selectedIndex + ", padding: " + paddingUniform);
            switch (selectedIndex) {
                case uniformIndex:
                    
                    spriteWidthPadded += paddingUniform * 2;
                    spriteHeightPadded += paddingUniform*2;
                    break;
                case separateIndex:
                    spriteWidthPadded += paddingLeft + paddingRight;
                    spriteHeightPadded += paddingTop + paddingBottom;
                    break;
            }
            var spriteSheetDoc = app.documents.add(spriteWidthPadded * columns, spriteHeightPadded * rows, 72, sheetName);
            var tempDoc = app.documents.add(spriteWidthPadded, spriteHeightPadded, 72, sheetName + "_tmp");
            

            var cellSize = getSelectionShape(spriteWidth, 0, spriteHeight, 0);

            var currentColumn = 0,
                currentRow = 0;

            if (frames > 0)
            {
                for (var i = 0; i < frames; i++)
                {
                    app.activeDocument = currentDoc;
                    selectFrame(startFrame + i);
                    app.activeDocument.selection.select(cellSize);

                    // Only way at the moment to check for empty selection is to catch the exception
                    var selectionIsEmpty = false;
                    try { app.activeDocument.selection.copy(true); }
                    catch (ex) { selectionIsEmpty = true; }

                    if (!selectionIsEmpty)
                    {
                        app.activeDocument = tempDoc;
                        app.activeDocument.selection.select(cellSize);

                        // paste in place might not work in versions below CS5
                        pasteInPlace();
                        var layer = app.activeDocument.activeLayer.duplicate(spriteSheetDoc);

                        app.activeDocument = spriteSheetDoc;
                        
                        switch(selectedIndex)
                        {
                            case uniformIndex:
                                layer.translate(currentColumn * spriteWidthPadded, currentRow * spriteHeightPadded);
                                break;
                            case separateIndex:
                                layer.translate(currentColumn * spriteWidthPadded + paddingLeft - (paddingLeft + paddingRight) / 2, currentRow * spriteHeightPadded + paddingTop - (paddingTop + paddingBottom) / 2);
                                break;
                        }
                    }

                    currentColumn++;

                    if (currentColumn >= columns)
                    {
                       currentRow++;
                       currentColumn = 0;
                    }
                }

                app.activeDocument = tempDoc;
                app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);

                app.activeDocument = currentDoc;
                app.activeDocument.selection.deselect();

                app.activeDocument = spriteSheetDoc;
                // Remove the default background layer
                app.activeDocument.artLayers.getByName(app.activeDocument.backgroundLayer.name).remove();
                
                if (onFinished)
                {
                    onFinished(spriteSheetDoc, currentDoc);
                }
            }
            // alert("paddings: " + paddingLeft + ", " + paddingRight +", "+paddingTop + ", " + paddingBottom);
            exit();
        }
        catch (ex)
        {
            alert("An error occured, please submit a bug report. Error: " + ex);
        }
    }

    function selectFrame(number)
    {
        var idslct = charIDToTypeID( "slct" );
        var desc = new ActionDescriptor();
        var idnull = charIDToTypeID( "null" );
        var ref = new ActionReference();
        var idanimationFrameClass = stringIDToTypeID( "animationFrameClass" );
        ref.putIndex( idanimationFrameClass, number );
        desc.putReference( idnull, ref );
        executeAction( idslct, desc, DialogModes.NO );
    }

    function getSelectionShape(width, column, height, row)
    {
        var shape =
        [
            [column * width, row * height], // top left
            [column * width, row * height + height], // bottom left
            [column * width + width, row * height + height], // bottom right
            [column * width + width, row * height] // top right
        ];

        return shape;
    }

    function pasteInPlace()
    {
        var idpast = charIDToTypeID( "past" );
        var desc4 = new ActionDescriptor();
        var idinPlace = stringIDToTypeID( "inPlace" );
        desc4.putBoolean( idinPlace, true );
        var idAntA = charIDToTypeID( "AntA" );
        var idAnnt = charIDToTypeID( "Annt" );
        var idAnno = charIDToTypeID( "Anno" );
        desc4.putEnumerated( idAntA, idAnnt, idAnno );
        executeAction( idpast, desc4, DialogModes.NO );
    }
    
    /***
    /* Window setup and prep calculations
    /**/
    function calculateColRowVals()
    {
        rows = Math.round (Math.sqrt (frames));
        columns = Math.ceil (frames / rows);
    }

    function onFramesChange(e)
    {
        frames = parseInt(dlg.endFrame.text) - parseInt(dlg.startFrame.text) + 1;
        
        calculateColRowVals();
        
        dlg.rows.text = rows;
        dlg.columns.text = columns;
    }

    function saveAsPNG()
    {
        var selectedFile = File.saveDialog("Save as PNG", "*.png");
        if (selectedFile == null) { return; }
        
        var finished = function(spriteSheet, originalDoc) {
            var o = new ExportOptionsSaveForWeb();
            o.format = SaveDocumentType.PNG;
            o.PNG8 = false;
            o.transparency = true;
            o.interlaced = false;
            o.includeProfile = false;
            
            spriteSheet.exportDocument(selectedFile, ExportType.SAVEFORWEB, o);
            
            if (dlg.saveData.value == true)
            {
                saveSizeData(selectedFile);
            }
            
            spriteSheet.close(SaveOptions.DONOTSAVECHANGES);
            app.activeDocument = originalDoc;
        }
        
        createSpriteSheet(finished);
    }

    function saveSizeData(pngPath)
    {
        var f = File(pngPath.path + '/' + dataFileName);
        
        f.encoding = 'UTF8';
        f.open('r');
        var contents = f.read();
        f.close();
        
        var dataToWrite = pngPath.name + ',' + spriteWidth.value + ',' + spriteHeight.value + ',' + frames;
        var lines;
        
        if (contents.length > 0)
        {
            lines = contents.split('\n');
            var replaced = false;
            for (var i = 0; i < lines.length; i++)
            {
                if (lines[i].length < 1) { continue; }
                
                if (lines[i].indexOf(pngPath.name) > -1)
                {
                    lines[i] = dataToWrite;
                    replaced = true;
                    break;
                }
            }
        
            if (!replaced)
            {
                lines.push(dataToWrite);
            }
        }
        else
        {
            lines = [dataToWrite];
        }
        
        contents = "";
        for (var i = 0; i < lines.length; i++)
        {
            contents += lines[i];
            
            if (i < lines.length - 1) { contents += '\n'; }
        }
        
        f.open('w');
        f.write(contents);
        f.close();
    }

    function exit() { dlg.close(); }

    function createWindow()
    {
        dlg = new Window('dialog', 'Spritesheet generator');

        dlg.panel = dlg.add('panel', undefined, undefined);
        
        dlg.frameGroup = dlg.panel.add('group');
        dlg.frameGroup.alignment = ['left', 'top'];
        
        dlg.frameGroup.add('StaticText', undefined, 'Start frame ');
        dlg.startFrame = dlg.frameGroup.add('EditText', undefined, 1);
        dlg.startFrame.characters = 3;
        dlg.startFrame.onChange = onFramesChange;
        
        dlg.frameGroup.add('StaticText', undefined, 'End frame ');
        dlg.endFrame = dlg.frameGroup.add('EditText', undefined, 1);
        dlg.endFrame.characters = 3;
        dlg.endFrame.onChange = onFramesChange;
        
        dlg.dimensionsGroup = dlg.panel.add('group');
        dlg.dimensionsGroup.alignment = ['left', 'top'];
        
        dlg.dimensionsGroup.add('StaticText', undefined, 'Columns ');
        dlg.columns = dlg.dimensionsGroup.add('EditText', undefined, columns);
        dlg.columns.characters = 4;
        
        dlg.dimensionsGroup.add('StaticText', undefined, 'Rows ');
        dlg.rows = dlg.dimensionsGroup.add('EditText', undefined, rows);
        dlg.rows.characters = 4;
        
        
        dlg.paddingGroup = dlg.panel.add('group');
        dlg.paddingGroup.alignment = ['left','top'];

        dlg.paddingPanel = dlg.paddingGroup.add('panel', undefined, "Padding Option");
        dlg.paddingPanel.alignment = 'fill';

        dlg.paddingType = dlg.paddingPanel.add("dropdownlist");
        // dlg.paddingType.preferredSize.width = StrToIntWithDefault(100,100);
        dlg.paddingType.alignment = 'left'
        
        dlg.paddingType.add("item", "Uniform");
        dlg.paddingType.add("item", "Separate");
        
        dlg.paddingType.onChange = function () {
            hideAllPaddingPanel(dlg);
            selectedIndex = this.selection.index; 
            switch(this.selection.index)
            {
                case uniformIndex:
                    dlg.paddingPanel.paddingOptions.uniformPaddingOptions.show();
                    break;
                case separateIndex:
                    dlg.paddingPanel.paddingOptions.separatePaddingOptions.show();
                    break;
            }
        }

        dlg.paddingPanel.paddingOptions = dlg.paddingPanel.add('group');
        dlg.paddingPanel.paddingOptions.alignment = 'fill';
        dlg.paddingPanel.paddingOptions.alignment = 'stack';

        // Uniform Padding Options
        dlg.paddingPanel.paddingOptions.uniformPaddingOptions = dlg.paddingPanel.add('group');
        dlg.paddingPanel.paddingOptions.uniformPaddingOptions.alignment = ['left', 'top'];

        dlg.paddingPanel.paddingOptions.uniformPaddingOptions.add('StaticText', undefined, 'Padding');
        dlg.paddingUniform = dlg.paddingPanel.paddingOptions.uniformPaddingOptions.add('EditText', undefined, paddingUniform);
        dlg.paddingPanel.paddingOptions.uniformPaddingOptions.visible = (selectedIndex == uniformIndex);

        // Separate Padding Options
        dlg.paddingPanel.paddingOptions.separatePaddingOptions = dlg.paddingPanel.add('group');
        dlg.paddingPanel.paddingOptions.separatePaddingOptions.alignment = ['left', 'top'];
        
        dlg.paddingPanel.paddingOptions.separatePaddingOptions.add('StaticText', undefined, 'Padding');
        dlg.paddingPanel.paddingOptions.separatePaddingOptions.add('StaticText', undefined, 'Left');
        dlg.paddingLeft = dlg.paddingPanel.paddingOptions.separatePaddingOptions.add('EditText', undefined, paddingLeft); 
        dlg.paddingLeft.characters = 4;
        
        dlg.paddingPanel.paddingOptions.separatePaddingOptions.add('StaticText', undefined, 'Top');
        dlg.paddingTop = dlg.paddingPanel.paddingOptions.separatePaddingOptions.add('EditText', undefined, paddingTop);
        dlg.paddingTop.characters = 4;

        dlg.paddingPanel.paddingOptions.separatePaddingOptions.add('StaticText', undefined, 'Right');
        dlg.paddingRight = dlg.paddingPanel.paddingOptions.separatePaddingOptions.add('EditText', undefined, paddingRight);
        dlg.paddingRight.characters = 4;
        
        dlg.paddingPanel.paddingOptions.separatePaddingOptions.add('StaticText', undefined, 'Bottom');
        dlg.paddingBottom = dlg.paddingPanel.paddingOptions.separatePaddingOptions.add('EditText', undefined, paddingBottom); 
        dlg.paddingBottom.characters = 4;
        dlg.paddingPanel.paddingOptions.separatePaddingOptions.visible = (selectedIndex == separateIndex);



        
        dlg.panel.docName = dlg.panel.add('StaticText', undefined, 'Document Name ');
        dlg.panel.docName.alignment = ['left', 'top'];
        dlg.sheetName = dlg.panel.add('EditText', undefined, sheetName);
        dlg.sheetName.characters = 40;
        
        dlg.buttons = dlg.add('group');
        dlg.buttons.cancel = dlg.buttons.add('button', undefined, 'Cancel');
        dlg.buttons.cancel.onClick = exit;

        dlg.buttons.createButton = dlg.buttons.add('button', undefined, 'Generate document');
        dlg.buttons.createButton.onClick = createSpriteSheet;
        
        dlg.buttons.saveAsPNGBtn = dlg.buttons.add('button', undefined, 'Save as PNG');
        dlg.buttons.saveAsPNGBtn.onClick = saveAsPNG;
        
        dlg.saveDataGroup = dlg.add('group');
        dlg.saveData = dlg.saveDataGroup.add('Checkbox', undefined, 'Save data to ' + dataFileName + ' when saving as PNG');

        dlg.saveData.value = true;
        
        dlg.show();
    }
    
    function init()
    {
        currentDoc = app.activeDocument;
        sheetName = currentDoc.name.split('.')[0];
        spriteWidth = currentDoc.width;
        spriteHeight = currentDoc.height;

        calculateColRowVals();
        
        createWindow();
    }

    init();
}

if (app && app.activeDocument)
{
    var savedPrefs = {
        typeUnits: app.preferences.typeUnits,
        rulerUnits: app.preferences.rulerUnits
    };

    app.preferences.typeUnits = TypeUnits.PIXELS;
    app.preferences.rulerUnits = Units.PIXELS;
   
    var spriteGenerator = new SpriteGenerator();

    app.preferences.typeUnits = savedPrefs.typeUnits;
    app.preferences.rulerUnits = savedPrefs.rulerUnits;
}

function hideAllPaddingPanel(dlg)
{
    // dlg.paddingPanel.uniformPaddingOptions.hide();
    // dlg.paddingPanel.separatePaddingOptions.hide();

    dlg.paddingPanel.paddingOptions.uniformPaddingOptions.hide();
    dlg.paddingPanel.paddingOptions.separatePaddingOptions.hide();
}