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

    function createSpriteSheet()
    {
        try
        {
            dlg.hide();
            
            columns = dlg.panel.columns.text;
            rows = dlg.panel.rows.text;
            sheetName = dlg.panel.sheetName.text + "_" + currentDoc.width.value + "x" + currentDoc.height.value;
            
            var spriteSheetDoc = app.documents.add(spriteWidth * columns, spriteHeight * rows, 72, sheetName);
            app.activeDocument = currentDoc;
           
            var currentColumn = 0,
                currentRow = 0;

            if (frames > 0)
            {
                for (var i = 0; i < frames; i++)
                {
                    selectFrame(i + 1);
                    var layersToCopy = getVisibleLayers(currentDoc.layers);

                    for (var j = 0; j < layersToCopy.length; j++)
                    {
                        var duplicatedLayer = layersToCopy[j].duplicate(spriteSheetDoc);
                        app.activeDocument = spriteSheetDoc;

                        if (layerHasBounds(duplicatedLayer))
                            duplicatedLayer.translate(spriteWidth * currentColumn, spriteHeight * currentRow);

                        app.activeDocument = currentDoc;
                    }

                    currentColumn++;

                    if (currentColumn >= columns) {
                       currentRow++;
                       currentColumn = 0;
                    }
                }

                app.activeDocument = spriteSheetDoc;
                // Remove the default background layer
                app.activeDocument.artLayers.getByName(app.activeDocument.backgroundLayer.name).remove();
            }

            dlg.close();
        }
        catch (ex)
        {
            alert("An error occured within the script: ", + ex);
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

    function getVisibleLayers(layers)
    {
        var result = [];
        for (var i = 0; i < layers.length; i++)
        {
            var layer = layers[i];
            if (layer.visible)
            {
                result.push(layer);
            }
        }

        return result;
    }

    function layerHasBounds(layer)
    {
        return !(layer.bounds[2] == 0 && layer.bounds[3] == 0);
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
        dlg.buttons.cancel.alignment = ['right', 'bottom'];
        
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