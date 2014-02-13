/*****************************************************************************
 * TrackMyWork - Export / Import / Cleanup
 * 
 * (c) 2009, 2010 by Klaus Reger <K.Reger@gmx.de>
 * 
 ****************************************************************************/


function ExportAssistant() 
{
    Mojo.Log.info("ExportAssistant.activate");  
	  
	this.result     = "";
	this.separator  = ",";
	this.useUTC     = true;
    this.showHelp   = false;
    this.exportType = "clipboard";
    this.importType = "clipboard";
    
    // Select all categories
    var allCategoriesList = [];
    for (var i = 0; i < prefsGL.categoriesList.length; i++) {
        var category = prefsGL.categoriesList[i];
        
        allCategoriesList.push(category.id)
    }
    
    this.categoryIdFilter = allCategoriesList.join(",");

	var tmpDate = new Date();
	this.startDate = new Date(2000,0,1);
	this.endDate = new Date(tmpDate.getFullYear()+1, 0, 1); // now
	
}

ExportAssistant.prototype.setup = function() {
    Mojo.Log.info("ExportAssistant.setup");  
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
		
	this.appMenuModel = {
		visible: true,
		items: [
			Mojo.Menu.editItem,
	   		{ 	
				label: $L("Help ..."), 
				command: 'do-help' 
			}
		]
	};
	this.controller.setupWidget(Mojo.Menu.appMenu, 
		{omitDefaultItems: true}, this.appMenuModel);

	/* setup widgets here */
	
	/* update the app info using values from our app */
	this.controller.get("header").update($L("Export / Import"));
	this.controller.get("optionsGeneralTitle").update($L("General options"));
	this.controller.get("optionsExportTitle").update($L("Export"));
	this.controller.get("optionsImportTitle").update($L("Import"));
	this.controller.get("cleanupTitle").update($L("Clear data"));
	
    this.controller.setupWidget("startDate",
        this.attributes = {
            label: 			$L('Start date'),
			labelPlacement:	Mojo.Widget.labelPlacementLeft,
            modelProperty: 'time' 
        },
        this.model = {
            time: this.startDate
        });
		
    this.controller.setupWidget("endDate",
        this.attributes = {
            label: 			$L('End date'),
			labelPlacement:	Mojo.Widget.labelPlacementLeft,
            modelProperty: 'time' 
        },
        this.model = {
            time: this.endDate
        });
			
	this.controller.setupWidget("pofTextField",
        this.pofAttributes = {
            hintText: 		$L("Paste data from clipboard here ..."),
            multiline: 		true,
			textCase:		Mojo.Widget.steModeLowerCase,
			preventResize:	true,
            enterSubmits: 	false,
            autoFocus:		true
         },
         this.pofModel = {
             value: "",
             disabled: false
         }
    ); 
	            
     this.controller.setupWidget("exportType",
        this.attributes = {
            choices: [
                {label: $L("Clipboard"), value: "clipboard"},
                {label: $L("Mail"),      value: "mail"}
            ]
        },
        this.exportTypeModel = {
            value: this.exportType,
            disabled: false
        }
    ); 

	this.controller.setupWidget('exportBtn', 
	{
		type:		 Mojo.Widget.activityButton}, 
	{
		buttonLabel: $L('Export data'),
		buttonClass: 'primary',
		disabled: false
	});  
    
    this.controller.setupWidget("importType",
        this.attributes = {
            choices: [
                {label: $L("Clipboard"), value: "clipboard"},
                {label: $L("File"),      value: "file"}
            ]
        },
        this.importTypeModel = {
            value: this.importType,
            disabled: false
        }
    ); 
       
    this.controller.setupWidget("importHelp",
        this.attributes = {
            modelProperty: 'open',
            unstyled: false
        },
        this.model = {
            open: false
        }
    );
     
    this.controller.setupWidget("importClipboard",
        this.attributes = {
            modelProperty: 'open',
            unstyled: false
        },
        this.model = {
            open: true
        }
    );

	this.controller.setupWidget('importBtn', 
	{
		type:		 Mojo.Widget.activityButton
	}, 
	{
		buttonLabel: $L('Import data'),
		buttonClass: 'primary',
		disabled: 	 false
	});
	
	this.controller.setupWidget('cleanupAllBtn', 
	{}, 
	{
		buttonLabel: $L('Clear ALL data'),
		buttonClass: 'negative',
		disabled: false
	});
	
	this.controller.setupWidget('cleanupBtn', 
	{}, 
	{
		buttonLabel: $L('Clear selected data'),
		buttonClass: 'negative',
		disabled: false
	});
	
	
	// --- timezone --------------------------------------------
	this.controller.setupWidget("timezone",
    {
	    trueLabel: $L("UTC"),
        falseLabel: $L("Local") 
    },
    this.useUTCModel = {
    	value: this.useUTC,
        disabled: false
    });
	
	this.controller.get('timezoneLabel').update($L("Timezone"));

    this.controller.get('categoriesLabel').update($L("Categories"));
    this.cbSetCategoriesFilter(this.categoryIdFilter);

	/* add event handlers to listen to events from widgets */
    
    Mojo.Event.listen(this.controller.get('btnHelp'),
                      Mojo.Event.tap,
                      this.cbHelpToggle.bind(this));

	Mojo.Event.listen(this.controller.get('timezone'),
		              Mojo.Event.propertyChange, 
		              this.cbTimezone.bind(this))

	Mojo.Event.listen(this.controller.get('startDate'),
					  Mojo.Event.propertyChange, 
					  this.handleStartDate.bind(this));

	Mojo.Event.listen(this.controller.get('endDate'),
					  Mojo.Event.propertyChange, 
					  this.handleEndDate.bind(this));

    Mojo.Event.listen(this.controller.get('categories'),
                      Mojo.Event.tap, 
                      this.cbTapCategories.bind(this));

    Mojo.Event.listen(this.controller.get('exportType'),
                      Mojo.Event.propertyChange, 
                      this.cbExportTypeChanged.bind(this))
   
	Mojo.Event.listen(this.controller.get('exportBtn'),
                	  Mojo.Event.tap, 
                	  this.cbExportBtn.bind(this))
        
    Mojo.Event.listen(this.controller.get('importType'),
                      Mojo.Event.propertyChange, 
                      this.cbImportTypeChanged.bind(this));

    Mojo.Event.listen(this.controller.get('importBtn'),
                      Mojo.Event.tap, 
                      this.cbImportBtn.bind(this))

	Mojo.Event.listen(this.controller.get('cleanupBtn'),
                	  Mojo.Event.tap, 
                	  this.cbCleanupBtn.bind(this))

	Mojo.Event.listen(this.controller.get('cleanupAllBtn'),
                	  Mojo.Event.tap, 
                	  this.cbCleanupAllBtn.bind(this))
                                            
    myApp.addBackMenu(this);
};



ExportAssistant.prototype.activate = function(event) 
{
    Mojo.Log.info("ExportAssistant.activate");  
      
    this.projectsDump = "";
    this.timesDump = "";  

    this.controller.modelChanged(this.importTypeModel, this);
    this.controller.modelChanged(this.exportTypeModel, this);

    if(myApp.isTouchPad())
    {    
        
        var groupList = [
            "groupOptionsGeneral",
            "groupOptionsExport",
            "groupOptionsImport",
            "groupCleanup"
        ];
        
        for (var i = 0; i < groupList.length; i++) 
        {
            this.controller.get(groupList[i]).addClassName("touchpad-group");
        } 
    }
};

/* ===========================================================================
 * handleCommand
 * ===========================================================================
 */
ExportAssistant.prototype.handleCommand = function(event) 
{
	if(event.type == Mojo.Event.command) 
	{
		switch(event.command)
		{
			// these are built-in commands. we haven't enabled any of them, but
			// they are listed here as part of the boilerplate, to be enabled later if needed
            case 'go-back':
                this.controller.stageController.popScene();
                break;
            case 'do-help':
				var url = 'http://reger-clan.de/';
				
				if(Mojo.Locale.getCurrentLocale().match("de.*"))
				{
					url = url + 'de/WebOS-TrackMyWork-ExportImport.html';
				}
				else
				{
					url = url + 'en/WebOS-TrackMyWork-ExportImport.html';
				}
				
				this.controller.serviceRequest('palm://com.palm.applicationManager', 
				{ 
					method:	'open',
					parameters: { target: url}
				});
				break;	
			
			default:
				//Mojo.Controller.errorDialog("Got command " + event.command);
			break;
		}
	}
}




ExportAssistant.prototype.cbExportBtn = function(event){
    Mojo.Log.info("TimeViewAssistant.cbExportBtn");

    this.doExportProjects = this.doExportProjects.bind(this);
    this.doExportProjects(this.cbExportProjectsDone.bind(this));

    this.doExportTimes = this.doExportTimes.bind(this);
    this.doExportTimes(this.cbExportTimesDone.bind(this));
}


ExportAssistant.prototype.cbExportTypeChanged = function(event) {
    Mojo.Log.info("ExportAssistant.cbExportTypeChanged()");

    this.exportType = event.value;

}


ExportAssistant.prototype.exportClipboard = function(event){
	Mojo.Log.info("TimeViewAssistant.exportClipboard");

	this.doExportProjects = this.doExportProjects.bind(this);
	this.doExportProjects(this.cbExportProjectsDone.bind(this));

	this.doExportTimes = this.doExportTimes.bind(this);
	this.doExportTimes(this.cbExportTimesDone.bind(this));
}



ExportAssistant.prototype.exportMail = function(event){
	Mojo.Log.info("TimeViewAssistant.exportMail");

	this.doExportProjects = this.doExportProjects.bind(this);
	this.doExportProjects(this.cbExportProjectsDone.bind(this));

	this.doExportTimes = this.doExportTimes.bind(this);
	this.doExportTimes(this.cbExportTimesDone.bind(this));
}



/* ===========================================================================
 * handleStartDate
 * ===========================================================================
 */
ExportAssistant.prototype.handleStartDate = function(event)
{
    Mojo.Log.info("ExportAssistant.handleStartDate");
    this.startDate = event.value;
};


/* ===========================================================================
 * handle tapping of categories
 * ===========================================================================
 */
ExportAssistant.prototype.cbTapCategories = function(event)
{
    Mojo.Log.info("ExportAssistant.cbTapCategories");
    
    this.controller.stageController.pushScene('CategorySelect', 
                this.cbSetCategoriesFilter.bind(this),
                this.categoryIdFilter);   
    
};



/* ===========================================================================
 * setFilterCB
 * ===========================================================================
 */
ExportAssistant.prototype.cbSetCategoriesFilter = function(idListPI)
{
    Mojo.Log.info("ExportAssistant.cbSetCategoriesFilter: " + idListPI);
        
    this.categoryIdFilter = idListPI;
    this.controller.get('categories').update(getCategoryNames(idListPI));
};




/* ===========================================================================
 * handleEndDate
 * ===========================================================================
 */
ExportAssistant.prototype.handleEndDate = function(event)
{
	Mojo.Log.info("ExportAssistant.handleEndDate");
	this.endDate = event.value;
};




ExportAssistant.prototype.cbImportBtn = function()
{
    Mojo.Log.info("ExportAssistant.cbImportBtn");
    
    if(this.importType === "clipboard")
    {
        this.importClipboard();
    }
    else    
    {
        var fileParams = 
        {
            actionType: "attach",
            kind: 'file', 
            extensions: ['csv'],
            actionName: $L("Done"),
            onSelect: this.cbHandleFilePicker.bind(this)
        }
    
        Mojo.FilePicker.pickFile(fileParams, this.controller.stageController);
    }
}


ExportAssistant.prototype.cbHandleFilePicker = function(event) {
    Mojo.Log.info("ExportAssistant.cbHandelFilePicker()"+Object.toJSON(event));
    
    this.importFile(event.fullPath).bind(this);
    this.controller.stageController.popScene();
}


ExportAssistant.prototype.importClipboard = function() 
{
    Mojo.Log.info("ExportAssistant.importClipboard");
    
    this.doImport(this.pofModel.value, this.useUTC, this.startDate, this.endDate);
    this.pofModel.value = "";
    this.controller.modelChanged(this.pofModel, this);
    
    this.cbDone("").bind(this);
};



ExportAssistant.prototype.importFile = function(file) 
{
    Mojo.Log.info("ExportAssistant.importFile");

    Mojo.Log.info("Importing data from: ", file);
    var tmp = new Ajax.Request(file, {
        method: 'get',
        parameters: '',
        evalJSON: false,
        evalJS: false,
        onSuccess: function(transport) {
            if (transport.status < 200 || transport.status > 299) {
                this.controller.get('importFileBtn').mojo.deactivate();
                this.cbDone($L("Error importing file: ") + file);
            } else {
                this.doImport(transport.responseText, this.useUTC, this.startDate, this.endDate);
                this.cbDone("").bind(this);
            }
        }.bind(this),
        onFailure: function(transport) {
            this.controller.get('importFileBtn').mojo.deactivate();
            this.cbDone($L("Error importing file: ") + file + " ("+
                transport.responseText + ")");
        }.bind(this)
    });
    
    this.controller.stageController.popScene();  
};


ExportAssistant.prototype.cbHelpToggle = function(event) {
    Mojo.Log.info("ExportAssistant.cbHelpToggle()");

    this.showHelp = !this.showHelp;
    
    this.switchHelp(this.showHelp);
}


/* ===========================================================================
 * Set help
 * ===========================================================================
 */
ExportAssistant.prototype.setHelp = function()
{
    Mojo.Log.info("ExportAssistant.setHelp()");
    
    var text = "";
    
    if(Mojo.Locale.getCurrentLocale().match("de.*"))
    {
        text = 
            "" + 
            "" + 
            "";
    }
    else
    {
        text = 
            "" + 
            "" + 
            "";
    }
    
    this.controller.get('importHelpContent').update(text);   
}

/* ===========================================================================
 * Switch help text on or off
 * ===========================================================================
 */
ExportAssistant.prototype.switchHelp = function(togglePI)
{
    Mojo.Log.info("ExportAssistant.switchHelp(" + togglePI + ")");
        
    this.controller.get('importHelp').mojo.setOpenState(togglePI);
  
    this.controller.get("btnHelp").style.backgroundImage = 
        togglePI? "url(images/help-in.png)": "url(images/help-out.png)";
    
}


ExportAssistant.prototype.cbImportTypeChanged = function(event) {
    Mojo.Log.info("ExportAssistant.importTypeChangedCB()");

    this.toggleImportType(event.value);

}



ExportAssistant.prototype.toggleImportType = function(importType) {
    Mojo.Log.info("ExportAssistant.toggleImportType()");

    this.importType = importType;

    if(importType === "clipboard")
    { 
       this.controller.get('importClipboard').mojo.setOpenState(true);
    }
    else
    { 
       this.controller.get('importClipboard').mojo.setOpenState(false);
    }
}



ExportAssistant.prototype.cbHandleFilePicker = function(event) {
    Mojo.Log.info("ExportAssistant.cbHandleFilePicker()"+Object.toJSON(event));
    
    this.importFile(event.fullPath);
}




ExportAssistant.prototype.cbCleanupAllBtn = function() 
{
	Mojo.Log.info("TimeViewAssistant.cbCleanupBtn");
			
	this.controller.showAlertDialog(
	{
	    title: $L("WARNING"),
	    message: $L("Do you really want to <B>permanently erase all</B> of your data?"),
		allowHTMLMessage: true,
		choices:[
			{label:$L('No'), value:"no", type:'affirmative'},
			{label:$L('Yes'), value:"yes", type:'negative'}
		],
		onChoose: function(value) {
			if(value == "yes")
			{
				tmwGL.db.db.transaction(function (tx) 
				{ 		
					var sqlCmd = ("DELETE FROM tmw_times;");
					
					tx.executeSql(sqlCmd, [], 
					function(tx, result){
						Mojo.Log.info("DELETE tmw_times: " + result);
					}, 
					function(tx, error){
						Mojo.Log.error("DELETE tmw_times: " + error.message);
					});
			
					sqlCmd = ("DELETE FROM tmw_projects WHERE i_tmw_projects_id != 1;");
					
					tx.executeSql(sqlCmd, [], 
					function(tx, result){
						Mojo.Log.info("DELETE tmw_projects: " + result);
					}, 
					function(tx, error){
						Mojo.Log.error("DELETE tmw_projects: " + error.message);
					});
				});	
				
				tmwGL.db.saveCategory(-1, 'TrackMyWork', null);
				
				prefsGL.defaultCategoryName = "TrackMyWork";
				defaultCategoryId           = "1";
				categoriesFilter            = "1";
	
				this.controller.showAlertDialog({
	    			onChoose: function(value) {},
	    			title: $L("Database cleaned up"),
					allowHTMLMessage: true,
	    			message: $L("<B>All data have been deleted now.</B>") +  "<br/>" +
						$L("Please note, that you have to set up your categories manually now."),
	    			choices:[{label:$L("OK"), value:""}]});
			}
		}.bind(this)	    
    });				
};


ExportAssistant.prototype.cbCleanupBtn = function() 
{
	Mojo.Log.info("TimeViewAssistant.cbCleanupBtn");
	
	var startDateStr = Mojo.Format.formatDate(this.startDate, {
		date: 'short',
		countryCode: ''
	});
	var endDateStr = Mojo.Format.formatDate(this.endDate, {
		date: 'short',
		countryCode: ''
	});

    var categoryIdFilter = this.categoryIdFilter;
    var category = getCategoryNames(this.categoryIdFilter);
    Mojo.Log.info("category=" + category);
    
	var msg = $L("Do you want to <B>permanently erase</B> your data between #{start} and #{end} (excluding) for #{category}?")
		.interpolate({"start":    startDateStr,
					  "end":      endDateStr,
                      "category": category});		
	
	this.controller.showAlertDialog(
	{
	    title: $L("WARNING"),
	    message: $L(msg),
		allowHTMLMessage: true,
		choices:[
			{label:$L('No'), value:"no", type:'affirmative'},
			{label:$L('Yes'), value:"yes", type:'negative'}
		],
		onChoose: function(value) {
			if(value == "yes")
			{
				var dateStartStr = dateToYYYYMMDD(this.startDate, '-');
				var dateEndStr   = dateToYYYYMMDD(this.endDate, '-');
                var categoryIdFilter = this.categoryIdFilter;
				var useUTC = this.useUTC? "": ", 'localtime'";	
                var category = getCategoryNames(this.categoryIdFilter);
		
				tmwGL.db.db.transaction(function (tx) 
				{ 		
					var sqlCmd = ("DELETE FROM tmw_times " +
								 " WHERE DATETIME(t_start"+useUTC+") BETWEEN '" + 
								 dateStartStr + "'" + " AND '" + dateEndStr + "'" + 
                                 " AND i_tmw_projects_id IN ("+categoryIdFilter+")");

					tx.executeSql(sqlCmd, [], 
					function(tx, result){
						Mojo.Log.info(sqlCmd + ": " + result);
					}, 
					function(tx, error){
						Mojo.Log.error("DELETE tmw_times: " + error.message);
					});
				});	
				
	  			var msg = $L("All data between #{start} and #{end} for #{category} have been deleted now.")
					.interpolate({"start":    startDateStr,
								  "end":      endDateStr,
                                  "category": category});
	
				this.controller.showAlertDialog({
	    			onChoose: function(value) {},
	    			title: $L("Database cleaned up"),
					allowHTMLMessage: true,
	    			message: "<B>"+msg+"</B><BR/>",
	    			choices:[{label:$L("OK"), value:""}]
				});
			}
		}.bind(this)
    });				
};



escapeData = function(data)
{
    // Mojo.Log.info("TimeViewAssistant.doExportProjects");
    // currently empty   
    return data;
}

unEscapeData = function(data)
{
    // Mojo.Log.info("TimeViewAssistant.doExportProjects");
    // currently empty
    return data;
}


csv2db = function(value, useUtcPI)
{
	result = value;

	// remove ''
	if(value.substr(0,1) == "'" &&
	   value.substr(value.length-1,1) == "'")
	{
		result = value.substring(1, value.length-1)
	}
	
	if(result.match(/^....-..-.. ..:..:..$/))
	{
		var d = result.split(/[- :]/)
		Mojo.Log.info(result)
		result = new Date(0);
		
		if(useUtcPI == true)
		{
			result.setUTCFullYear(d[0]);
			result.setUTCMonth(d[1]-1);
			result.setUTCDate(d[2]);
			result.setUTCHours(d[3], d[4], d[5]);
		}
		else
		{
			result.setFullYear(d[0]);
			result.setMonth(d[1]-1);
			result.setDate(d[2]);
			result.setHours(d[3], d[4], d[5]);		
		}
	}
	else if(result == "")
	{
		result = null;
	}
	
	return result;
}



ExportAssistant.prototype.doImport = function(content, useUtcPI, startDate, endDate)
{
	Mojo.Log.info("TimeViewAssistant.doImport");	
	tmwGL.db.db.transaction(function (tx) 
	{ 	
		var linesArr = content.split("\n");
		var useUTC = useUtcPI? "": ", 'localtime'";		 

		for (var line = 0; line < linesArr.length; line++) {
			Mojo.Log.info(linesArr[line]);
			
			var recIn = linesArr[line].split(",");
            var rec = new Array();
            
            // ',' => '
            var recInd = 0;
            var concatField = false;
            for (var recInInd = 0; recInInd < recIn.length; recInInd++)      
            {
                var value = recIn[recInInd];
                
                if(value === undefined)
                { 
                    value = ""; 
                }
                
                if(concatField)
                { 
                    rec[recInd] += "," + value;
                }
                else
                {
                    rec[recInd] = value;
                }

                // Starts with a "'" or only "'" and not in concat mode
                if((value.substr(0,1) == "'" &&   
                   value.substr(value.length-1,1) != "'") ||
                   (value == "'" && concatField == false))
                {
                    concatField = true;
                }
                // Ends with a "'" or only "'" and in concat mode
                else if((value.substr(0,1) != "'" &&   
                         value.substr(value.length-1,1) == "'") ||
                        (value == "'" && concatField == true))
                {
                    recInd ++;
                    concatField = false;
                }
                else if(value.length > 0 && concatField == false)
                {
                    recInd ++;
                }
            }
            
			// Category
			if (rec[0] == "'C'") {
					
				for (var fld = 0; fld < rec.length; fld++) {
					rec[fld] = csv2db(rec[fld], useUtcPI);
				}
				
				var categoriesID = rec[1];
				var name         = rec[2];
				
				var sqlCmd = ("INSERT INTO tmw_projects " +
				"       (i_tmw_projects_id," +
				"        v_name" +
				"       )" +
				"VALUES (" +
				"        ?," +
				"        ?" +
				'       );' +
				'GO;');
				
				tx.executeSql(sqlCmd, [categoriesID, name], 
				function(tx, result){
					Mojo.Log.info("INSERT: " + result);
				}, 
				function(tx, error){
					Mojo.Log.error("INSERT: " + error.message);
				});
			}
			
			// Time
			if (rec[0] == "'T'") {

				for (var fld = 0; fld < rec.length; fld++) {
					rec[fld] = csv2db(rec[fld], useUtcPI);
				}
				
				var categoriesID = rec[1];
				var start        = rec[2];
				var end          = rec[3];
				var note         = rec[4];
				
				var sqlCmd = ("INSERT INTO tmw_times " +
				"       (t_Start, " +
				"        t_End, " +
				"        i_tmw_projects_id," +
				"        v_note" +
				"       )" +
				"VALUES" +
				"       (datetime(?, 'unixepoch')," +
				"        datetime(?, 'unixepoch')," +
				"        ?," +
				"        ?" +
				'       );' +
				'GO;');		

				if(start != null && 
				   end != null &&
				   start >= startDate &&
				   start <= endDate) 
				{

					tx.executeSql(sqlCmd, [start.getTime() / 1000, 
					              end == 'NULL'? null: (end.getTime() / 1000), 
								  categoriesID, note], 
					function(tx, result){
						Mojo.Log.info("INSERT: " + result);
					}, 
					function(tx, error){
						Mojo.Log.error("INSERT: " + error.message);
					});			
				}
			}
		}	
	});		
    
	tmwGL.db.getCategoryData(null);  
}




ExportAssistant.prototype.cbTimezone = function(event){
	Mojo.Log.info("TimeViewAssistant.cbTimezone");
	
	this.useUTC = event.value;
}


ExportAssistant.prototype.doExportProjects = function(callback){
	Mojo.Log.info("TimeViewAssistant.doExportProjects");

	var dump = "";
	var separator = this.separator;		 
	var categoryIdFilter = this.categoryIdFilter;
    
	tmwGL.db.db.transaction(function(tx)
	{	

		var sql =
			("SELECT p.i_tmw_projects_id,"+
			 "       p.v_name" +
			 "  FROM tmw_projects p" + 
             " WHERE p.i_tmw_projects_id IN ("+categoryIdFilter+")" +
			 " ORDER BY 1;");
		Mojo.Log.info("SELECT: %j", sql); 

  	  	tx.executeSql(sql, 
	    	 [], 	
			 function(tx, result)
			 {
			 	Mojo.Log.info("Result:" + Object.toJSON(result.rows));
				
				dump = $L("'Type'") + separator +
					$L("'CategoryId'") + separator +
					$L("'Name'") + "\n";

			 	
				for (var i = 0; i < result.rows.length; i++) {
					var row = result.rows.item(i);
				
					dump = dump +
						"'C'" + separator +
						escapeData(row['i_tmw_projects_id']) + separator + 
						"'" + escapeData(row['v_name']) + "'" +
						"\n";
				}
				
				callback(dump);
			 },
			 function(tx, error)
			 {
				Mojo.Log.error(error.message);
			 }.bind(this)
		);
	});		
}



ExportAssistant.prototype.doExportTimes = function(callback)
{
	Mojo.Log.info("TimeViewAssistant.doExportTimes");

	var dump = "";
	var separator = this.separator;
	var useUTC = this.useUTC? "": ", 'localtime'";	
		 
	// convert to string
	var startDateStr = dateToYYYYMMDD(this.startDate, '-');
	var endDateStr   = dateToYYYYMMDD(this.endDate, '-');
    var categoryIdFilter = this.categoryIdFilter;
    
	tmwGL.db.db.transaction(function(tx)
	{			
		var sql =
			("SELECT t.i_tmw_projects_id,"+
			 "       DATETIME(t.t_Start"+useUTC+") AS t_Start,"+
			 "       DATETIME(t.t_End"+useUTC+")   AS t_End," +
			 "       t.v_note" +
			 "  FROM tmw_times t" + 
			 " WHERE DATETIME(t.t_start"+useUTC+") >= '" + startDateStr + "'" +
			 "   AND DATETIME(t.t_start"+useUTC+") <  '" + endDateStr + "'" +
             "   AND t.i_tmw_projects_id IN (" + categoryIdFilter + ")" +
			 " ORDER BY 2;");
		Mojo.Log.info("SELECT: %j", sql); 

  	  	tx.executeSql(sql, 
	    	 [], 	
			 function(tx, result)
			 {
			 	Mojo.Log.info("Result:" + Object.toJSON(result.rows));
				dump = $L("'Type'") + separator +
					$L("'CategoryId'") + separator +
					$L("'Start'") + separator +
					$L("'End'") + separator +
					$L("'Note'") + "\n";
					
				for (var i = 0; i < result.rows.length; i++) {
					var row = result.rows.item(i);
					
					var tEnd  = row['t_End'];
					var vNote = row['v_note'];
				
					tEnd = (tEnd === null? "NULL": "'" + tEnd + "'");
					vNote = (vNote === null? "''": "'" + vNote + "'");
				
					dump = dump +
						"'T'" + separator +
						escapeData(row['i_tmw_projects_id']) + separator + 
						"'" + escapeData(row['t_Start']) + "'" + separator + 
						escapeData(tEnd) + separator + 
						escapeData(vNote) + 
						"\n";
				}
				
				callback(dump);
			 },
			 function(tx, error)
			 {
				Mojo.Log.error(error.message);
			 }.bind(this)
		);
	});		
}


ExportAssistant.prototype.cbExportTimesDone = function(dump){
	Mojo.Log.info("TimeViewAssistant.cbExportTimesDone");
	this.timesDump = dump;
	this.cbExportDone();
	
}

ExportAssistant.prototype.cbExportProjectsDone = function(dump){
	Mojo.Log.info("TimeViewAssistant.cbExportProjectsDone");

	this.projectsDump = dump;
	this.cbExportDone();

}

ExportAssistant.prototype.cbExportDone = function(dump){
	Mojo.Log.info("TimeViewAssistant.cbExportDone");

    if(this.projectsDump == "" ||
	   this.timesDump == "")
	{
		return;  	
  	}
	
	if(this.exportType == "clipboard")
	{
		
		this.controller.get('exportBtn').mojo.deactivate();
	
		try 
		{
			this.controller.stageController.setClipboard(this.projectsDump + this.timesDump);

			this.controller.showAlertDialog({
	    		onChoose: function(value) {},
	    		title: $L("Database Exported"),
	    		message: $L("Data was exported to the clipboard"),
	    		choices:[{label:$L("OK"), value:""}]
	    	});
		}
		catch(e) {
			Mojo.Controller.errorDialog(e.name + $L(" error copying to clipboard: ") +
				e.message, this.controller.window);
			return;
		}	
	} 
	else if(this.exportType == "mail")
	{
		
		var text = this.projectsDump + this.timesDump;
		text = text.replace(/\n/g, "<BR/>");
		
		this.controller.get('exportBtn').mojo.deactivate();
	
		this.controller.serviceRequest('palm://com.palm.applicationManager', 
		{
		    method:		'open',
			parameters: 
			{
				id: 	'com.palm.app.email',
				params: {
					summary: 	$L("TrackMyWork - Data dump"),
					text: 		text
				}
			}
		});			
	}
}



ExportAssistant.prototype.cbDone = function(message){
	Mojo.Log.info("TimeViewAssistant.cbDone");	
	
	if (message === "") {
		this.controller.stageController.popScene();
	}
	else {
	
		this.controller.showAlertDialog({
			onChoose: function(value){
			},
			title: $L("Problem"),
			message: message,
			choices: [{
				label: $L("OK"),
				value: ""
			}]
		});
	}
}

ExportAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
 	tmwGL.db.getCategoryData(null);
	
		/* add event handlers to listen to events from widgets */
	Mojo.Event.stopListening(this.controller.get('exportBtn'),
		Mojo.Event.tap, 
		this.cbExportBtn)

	Mojo.Event.stopListening(this.controller.get('timezone'),
		Mojo.Event.propertyChange, 
		this.cbTimezone)

	Mojo.Event.stopListening(this.controller.get('importBtn'),
		Mojo.Event.tap, 
		this.cbImportBtn)

	Mojo.Event.stopListening(this.controller.get('cleanupBtn'),
		Mojo.Event.tap, 
		this.cbCleanupBtn)
};

ExportAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
