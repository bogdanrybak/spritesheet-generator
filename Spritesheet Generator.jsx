/***
/* Somewhat simplistic spritesheet generation script
/* Author: @bogdan_rybak github.com/bogdanrybak
/*/

function SpriteGenerator()
{
    var dlg,
        sheetName,
        currentDoc,
        numberOfLayers,
        columns,
        rows,
        spriteWidth,
        spriteHeight;

    function calculateColRowVals()
    {
        rows = Math.round (Math.sqrt (numberOfLayers));
        columns = Math.ceil (numberOfLayers / rows);
    }
    
    function exit() { dlg.close(); }

    function createSpriteSheet()
    {
        try
        {
            dlg.hide();
            
            // Check if selected layer is truly a set if option selected
            if (dlg.panel.useLayerSet.value && (!currentDoc.activeLayer.layers || !(currentDoc.activeLayer.layers.length > 0)))
            {
                alert("Please select a group that contains at least one element");
                return ;
            }
            
            columns = dlg.panel.columns.text;
            rows = dlg.panel.rows.text;
            sheetName = dlg.panel.sheetName.text + "_" + currentDoc.width.value + "x" + currentDoc.height.value;
            
            var spriteSheetDoc = app.documents.add(spriteWidth * columns, spriteHeight * rows, 72, sheetName);
            app.activeDocument = currentDoc;
           
            // Copy all the layers to the new document
            var currentColumn = 0,
                currentRow = 0;
            for (var i = 0; i < numberOfLayers; i++)
            {
               if (dlg.panel.useLayerSet.value)
               {
                    currentDoc.activeLayer.layers[i].duplicate(spriteSheetDoc);
               }
               else
               {
                   currentDoc.layers[i].duplicate(spriteSheetDoc);
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
            
            // Move the layers into respective grid positions
            currentColumn = currentRow = 0;
            for (var i = 0; i < numberOfLayers; i++)
            {
               app.activeDocument.layers[i].translate(spriteWidth * currentColumn, spriteHeight * currentRow);
               
               currentColumn++;
           
               if (currentColumn >= columns) {
                   currentRow++;
                   currentColumn = 0;
               }
            }
            
            dlg.close();
        }
        catch (ex)
        {
            alert("A nasty error occurred");
        }
    }

    function onUseLayerSetChange(e)
    {
        if (!currentDoc.activeLayer.layers) return;
        
        numberOfLayers = e.target.value ? currentDoc.activeLayer.layers.length : currentDoc.layers.length;
        
        calculateColRowVals();
        
        dlg.panel.rows.text = rows;
        dlg.panel.columns.text = columns;
    }

    function createWindow()
    {
        dlg = new Window('dialog', 'Spritesheet generator');

        dlg.panel = dlg.add('panel', undefined, undefined);
        
        dlg.panel.useLayerSet = dlg.panel.add('Checkbox', undefined, 'Use children of selected layer group (use if your layers are in a group that you have currently selected)');
        dlg.panel.useLayerSet.addEventListener('click', onUseLayerSetChange);
        
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
        numberOfLayers= currentDoc.layers.length;
        sheetName = currentDoc.name.split('.')[0];
        spriteWidth = currentDoc.width;
        spriteHeight = currentDoc.height;

        calculateColRowVals ();
        
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
