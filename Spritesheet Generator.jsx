/***
/* Somewhat simplistic spritesheet generation script
/* Author: @bogdan_rybak github.com/bogdanrybak
/*/

function SpriteGenerator()
{
    var dlg,
        sheetName,
        frames = 1,
        currentDoc,
        columns = 4,
        rows = 4,
        spriteWidth,
        spriteHeight;

    function createSpriteSheet(onFinished)
    {
        try
        {
            dlg.hide();
            
            columns = dlg.panel.columns.text;
            rows = dlg.panel.rows.text;
            sheetName = dlg.panel.sheetName.text + "_" + currentDoc.width.value + "x" + currentDoc.height.value;
            
            var spriteSheetDoc = app.documents.add(spriteWidth * columns, spriteHeight * rows, 72, sheetName);
            var tempDoc = app.documents.add(spriteWidth, spriteHeight, 72, sheetName + "_tmp");
            var cellSize = getSelectionShape(spriteWidth, 0, spriteHeight, 0);

            var currentColumn = 0,
                currentRow = 0;

            if (frames > 0)
            {
                for (var i = 0; i < frames; i++)
                {
                    app.activeDocument = currentDoc;
                    selectFrame(i + 1);
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
                        layer.translate(currentColumn * spriteWidth, currentRow * spriteHeight);
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

            dlg.close();
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
        frames = parseInt(dlg.panel.frames.text);
        
        calculateColRowVals();
        
        dlg.panel.rows.text = rows;
        dlg.panel.columns.text = columns;
    }

    function saveAsPNG()
    {
        var selectedFile = File.openDialog("Save as PNG","*.png");
        if (selectedFile == null) { return; }
        
        var finished = function(spriteSheet, originalDoc) {
            var o = new ExportOptionsSaveForWeb();
            o.format = SaveDocumentType.PNG;
            o.PNG8 = false;
            o.transparency = true;
            o.interlaced = false;
            o.includeProfile = false;
            
            spriteSheet.exportDocument(selectedFile, ExportType.SAVEFORWEB, o);
            
            saveSizeData(selectedFile)
            
            spriteSheet.close(SaveOptions.DONOTSAVECHANGES);
            app.activeDocument = originalDoc;
        }
        
        createSpriteSheet(finished);
    }

    function saveSizeData(pngPath)
    {
        var f = File(pngPath.path + '/spritesheets.txt');
        
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
            for (var i = 0; i < lines.lenght; i++)
            {
                if (lines[i].lenght < 1) { continue; }
                
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
        
        dlg.panel.add('StaticText', undefined, 'Last frame number: ');
        dlg.panel.frames = dlg.panel.add('EditText', undefined, frames);
        dlg.panel.frames.characters = 3;
        dlg.panel.frames.onChange = onFramesChange;
        
        dlg.panel.add('StaticText', undefined, 'Sheet Name: ');
        dlg.panel.sheetName = dlg.panel.add('EditText', undefined, sheetName);
        dlg.panel.sheetName.characters = 40;
        
        dlg.panel.add('StaticText', undefined, 'Columns: ');
        dlg.panel.columns = dlg.panel.add('EditText', undefined, columns);
        dlg.panel.columns.characters = 4;
        
        dlg.panel.add('StaticText', undefined, 'Rows: ');
        dlg.panel.rows = dlg.panel.add('EditText', undefined, rows);
        dlg.panel.rows.characters = 4;
        
        dlg.buttons = dlg.add('group');
        dlg.buttons.cancel = dlg.buttons.add('button', undefined, 'Cancel');
        dlg.buttons.cancel.onClick = exit;
        dlg.buttons.cancel.alignment = ['left', 'bottom'];

        dlg.buttons.createButton = dlg.buttons.add('button', undefined, 'Generate');
        dlg.buttons.createButton.onClick = createSpriteSheet;
        
        dlg.buttons.saveAsPNGBtn = dlg.buttons.add('button', undefined, 'Generate and Save as PNG');
        dlg.buttons.saveAsPNGBtn.onClick = saveAsPNG;
        
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