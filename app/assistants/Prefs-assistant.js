/*****************************************************************************
 * TrackMyWork - Preferences
 * 
 * (c) 2009, 2010 by Klaus Reger <K.Reger@gmx.de>
 * 
 ****************************************************************************/


function PrefsAssistant() 
{
	Mojo.Log.info("PrefsAssistant");
	
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */

    this.showHelp = false;
    
    this.descrList = 
    [
        "stdTimeDescr",
        "breakCalculateDescr",
        "breakAfterDescr",
        "breakDurationDescr",
        "autoCheckInOutDescr",
        "ringtoneDescr",
        "ringtoneTitleDescr",
        "vibrateDescr",
        "nightShiftDescr",
        "startOfWeekdayDescr",
        "minuteIntervalDescr",
        "acceptMetrixDescr",
        "lockRotateDescr",
        "categoryDescr"
    ];
   
}



PrefsAssistant.prototype.setup = function() 
{
	Mojo.Log.info("PrefsAssistant.setup");

   	this.controller.window.PalmSystem.setWindowOrientation("up");

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

	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
    // --- Start and end-time -----------------------------------------
	this.controller.get('header').update($L("Preferences"));
	this.controller.get('stdTimeTitle').update($L("Standard day"));
	this.controller.get('nightShiftTitle').update($L("Midnight shift"));
	this.controller.get('othersTitle').update($L("Others"));
	this.controller.get('breakTitle').update($L("Daily break"));
	this.controller.get('autoCheckInOutTitle').update($L("Check in/out by notification"));
    this.controller.get('ringtoneLabel').update($L("Ringtone"));    
    this.controller.get('vibrateLabel').update($L("Vibrate"));
    this.controller.get("ringtoneTitleValue").
        update(prefsGL.soundName == ""? 
               $L("Please select"): prefsGL.soundName);

	this.controller.setupWidget('startStdTime', 
	{
		label:			$L('Start'),
		labelPlacement:	Mojo.Widget.labelPlacementRight,
		modelProperty:	'value',
		minuteInterval : prefsGL.minuteInterval
	},
	this.startTimeModel= {
		value : prefsGL.standardDayBegin
	});

	this.controller.setupWidget('endStdTime', 
	{
		label:			$L('End'),
		labelPlacement:	Mojo.Widget.labelPlacementRight,
		modelProperty:	'value',
		minuteInterval : prefsGL.minuteInterval
	},
	this.endTimeModel = {
		value : prefsGL.standardDayEnd
	});
    
	// --- nightShift --------------------------------------------
	this.controller.setupWidget("nightShift",
    {
		labelPlacement:	Mojo.Widget.labelPlacementLeft
    },
    this.nightShiftModel = {
    	value: prefsGL.nightShift,
        disabled: false
    });
	this.controller.get('nightShiftLabel').update($L("Carry time"));
	

	// --- Minute interval --------------------------------------
	this.minuteIntervalList = [];
	var minutesList = [1, 2, 5, 10, 15, 20, 30, 60];
	
	for (var i = 0; i < minutesList.length; i ++) 
	{
		this.minuteIntervalList.push({
			'label': ""+minutesList[i]+" "+ $L("Min."),
			'value': minutesList[i]
		});
	};

	this.controller.setupWidget('minuteInterval', 
	{
		label: 			$L('Interval'),
		labelPlacement:	Mojo.Widget.labelPlacementRight,
		choices: 		this.minuteIntervalList 
	}, 
	this.selectorsModel = 
	{
		value: prefsGL.minuteInterval
	});
	
	if (!tmwGL.free) 
	{
		// --- breakCalculate --------------------------------------------
		this.controller.setupWidget("breakCalculate",
	    {
			labelPlacement:	Mojo.Widget.labelPlacementRight
	    },
	    this.breakCalculateModel = {
	    	value: prefsGL.breakCalculate,
	        disabled: false
	    });
		this.controller.get('breakCalculateLabel').update($L("Break calculation"));		
	
		// --- Break duration --------------------------------------
		this.controller.setupWidget("breakDurationInHours", this.attributes = {
			label: $L('Duration in hours'),
			labelPlacement: Mojo.Widget.labelPlacementRight,
			min: 0,
			max: 24
		}, this.breakDurationInHoursModel = {
			value: prefsGL.breakDurationInHours
		});

		this.controller.setupWidget("breakDurationInMinutes", this.attributes = {
			label: $L('Duration in minutes'),
			labelPlacement: Mojo.Widget.labelPlacementRight,
			min: 0,
			max: 59
		}, this.breakDurationInMinutesModel = {
			value: prefsGL.breakDurationInMinutes
		});
		
		this.controller.setupWidget("breakAfterHours", this.attributes = {
			label: $L('After ... hours'),
			labelPlacement: Mojo.Widget.labelPlacementRight,
			min: 0,
			max: 24
		}, this.breakAfterHoursModel = {
			value: prefsGL.breakAfterHours
		});

		this.controller.setupWidget("breakAfterMinutes", this.attributes = {
			label: $L('After ... minutes'),
			labelPlacement: Mojo.Widget.labelPlacementRight,
			min: 0,
			max: 59
		}, this.breakAfterMinutesModel = {
			value: prefsGL.breakAfterMinutes
		});
	
		// --- autoCheckInOutMode -------------------------------------
		this.controller.setupWidget('autoCheckInOutMode', 
		{
			label: 			$L('Mode'),
			labelPlacement:	Mojo.Widget.labelPlacementRight,
			choices: 		
			[{
				'label': $L("Never"),
				'value': 'NONE'
			},
			{
				'label': $L("Manually"),
				'value': 'MAN'
			} /* ,
			{
				'label': $L("Automatically"),
				'value': 'AUTO'
			} */
			]
		}, 
		this.selectorsModel = 
		{
			value: prefsGL.autoCheckInOutMode
		});
        
        this.controller.setupWidget("ringtoneToggle",
        {
            labelPlacement: Mojo.Widget.labelPlacementLeft
        },
        this.ringtoneModel = {
            value: prefsGL.sound,
            disabled: false
        });
       
        this.controller.setupWidget("vibrateToggle",
        {
            labelPlacement: Mojo.Widget.labelPlacementLeft
        },
        this.vibrateModel = {
            value: prefsGL.vibrate,
            disabled: false
        });

        this.setHelp();
        this.switchHelp(this.showHelp);
   

        /* add event handlers to listen to events from widgets */
        this.ringtoneChangedCB = 
            this.ringtoneChangedCB.bindAsEventListener(this);
        Mojo.Event.listen(this.controller.get('ringtoneTitle'),
            Mojo.Event.tap, 
            this.ringtoneChangedCB.bind(this));

		this.breakCalculateChangedCB = this.breakCalculateChangedCB.bindAsEventListener(this)
		Mojo.Event.listen(this.controller.get('breakCalculate'),
			Mojo.Event.propertyChange,
			this.breakCalculateChangedCB.bind(this));

		this.breakDurationInHoursPropertyChanged = this.breakDurationInHoursPropertyChanged.bindAsEventListener(this)
		Mojo.Event.listen(this.controller.get('breakDurationInHours'),
						  Mojo.Event.propertyChange,
						  this.breakDurationInHoursPropertyChanged.bind(this));
	
		this.breakDurationInMinutesPropertyChanged = this.breakDurationInMinutesPropertyChanged.bindAsEventListener(this)
		Mojo.Event.listen(this.controller.get('breakDurationInMinutes'),
						  Mojo.Event.propertyChange,
						  this.breakDurationInMinutesPropertyChanged.bind(this));		
	
		this.breakAfterHoursPropertyChanged = this.breakAfterHoursPropertyChanged.bindAsEventListener(this)
		Mojo.Event.listen(this.controller.get('breakAfterHours'),
						  Mojo.Event.propertyChange,
						  this.breakAfterHoursPropertyChanged.bind(this));			

		this.breakAfterMinutesPropertyChanged = this.breakAfterMinutesPropertyChanged.bindAsEventListener(this)
		Mojo.Event.listen(this.controller.get('breakAfterMinutes'),
						  Mojo.Event.propertyChange,
						  this.breakAfterMinutesPropertyChanged.bind(this));			
	}
	else
	{
		// this.controller.get('autoCheckInOutGrp').innerHTML = "";
		// this.controller.get('breakGrp').innerHTML = "";

		var message =
			" are available only in the <a href='" + tmwGL.appUrl+"'>full version</a>.";
		this.controller.get('breakInFullVersion').innerHTML = 
			"Automatic calculated breaks" + message;
		this.controller.get('autoCheckInOutInFullVersion').innerHTML = 
			"Check in/out notifications" + message;
		
		if(Mojo.Locale.getCurrentLocale().match("de.*"))
		{
			message = " sind nur in der <a href='" + tmwGL.appUrl+"'>Vollversion</a> integriert.";
			this.controller.get('breakInFullVersion').innerHTML = 
				"Automatisch berechnete Pausen" + message;
			this.controller.get('autoCheckInOutInFullVersion').innerHTML = 
				"Benachrichtigungen für Ein- und Ausbuchungen" + message;
		}
	}

    // --- metrixAccept --------------------------------------------
    this.controller.setupWidget("acceptMetrix",
    {
        labelPlacement: Mojo.Widget.labelPlacementLeft
    },
    this.acceptMetrixModel = {
        value: prefsGL.acceptMetrix,
        disabled: false
    });
    this.controller.get('acceptMetrixLabel').update
        ($L("Update notifications for TrackMyWork"));

    // --- lockRotate --------------------------------------------
    this.controller.setupWidget("lockRotate",
    {
        labelPlacement: Mojo.Widget.labelPlacementLeft
    },
    this.lockRotateModel = {
        value: prefsGL.lockRotate,
        disabled: false
    });
    this.controller.get('lockRotateLabel').update
        ($L("Lock rotation"));


	// FIXME: nach Veränderung der Einstellungen neue Timer eintragen

	// --- startOfWeekDay --------------------------------------
	this.weekdayList = [];
	var dayNameList = [
		$L("Sunday"),
		$L("Monday"),
		$L("Tuesday"),
		$L("Wednesday"),
		$L("Thursday"),
		$L("Friday"),
		$L("Saturday")
	];
	
	for (var i = 0; i < dayNameList.length; i ++) 
	{
		var label = dayNameList[i];
		
		this.weekdayList.push({
			'label': label,
			'value': i
		});
	};
	
	this.controller.setupWidget('startOfWeekDay', 
	{
		label: 			$L('Week start'),
		labelPlacement:	Mojo.Widget.labelPlacementRight,
		choices: 		this.weekdayList
	}, 
	this.selectorsModel = 
	{
		value: prefsGL.startOfWeekDay
	});

	// --- categories list --------------------------------------
	this.categoriesListModel = 
	{
		listTitle: $L("Categories"),
        items: []
	};

	this.controller.setupWidget
		('listCategories', 
 	     {
		 	itemTemplate:			'Prefs/Categories-listitem', 
		  	listTemplate:			'Prefs/Categories-listcontainer',
			preventDeleteProperty: 	'noDelete',
          	addItemLabel: 			$L('Add ...'),
          	swipeToDelete: 			true
		 },
	  	 this.categoriesListModel);
    
    myApp.addBackMenu(this);

	/* add event handlers to listen to events from widgets */
	this.startPropertyChanged = this.startPropertyChanged.bindAsEventListener(this)
	Mojo.Event.listen(this.controller.get('startStdTime'),
					  Mojo.Event.propertyChange,
					  this.startPropertyChanged.bind(this));
	
	this.endPropertyChanged = this.endPropertyChanged.bindAsEventListener(this)
	Mojo.Event.listen(this.controller.get('endStdTime'),
					  Mojo.Event.propertyChange,
					  this.endPropertyChanged.bind(this));

	this.nightShiftChangedCB = this.nightShiftChangedCB.bindAsEventListener(this)
	Mojo.Event.listen(this.controller.get('nightShift'),
		Mojo.Event.propertyChange,
		this.nightShiftChangedCB.bind(this));

    this.acceptMetrixChangedCB = this.acceptMetrixChangedCB.bindAsEventListener(this)
    Mojo.Event.listen(this.controller.get('acceptMetrix'),
        Mojo.Event.propertyChange,
        this.acceptMetrixChangedCB.bind(this));

    this.LockRotateChangedCB = this.lockRotateChangedCB.bindAsEventListener(this)
    Mojo.Event.listen(this.controller.get('lockRotate'),
        Mojo.Event.propertyChange,
        this.lockRotateChangedCB.bind(this));

    this.autoCheckInOutModeChangedCB = this.autoCheckInOutModeChangedCB.bindAsEventListener(this)
    Mojo.Event.listen(this.controller.get('autoCheckInOutMode'),
        Mojo.Event.propertyChange,
        this.autoCheckInOutModeChangedCB.bind(this));

    this.vibrateChangedCB = this.vibrateChangedCB.bindAsEventListener(this)
    Mojo.Event.listen(this.controller.get('vibrateToggle'),
        Mojo.Event.propertyChange,
        this.vibrateChangedCB.bind(this));
    
    this.ringtoneToggleCB = this.ringtoneToggleCB.bindAsEventListener(this)
    Mojo.Event.listen(this.controller.get('ringtoneToggle'),
        Mojo.Event.propertyChange,
        this.ringtoneToggleCB.bind(this));
    
    this.helpToggleCB = this.helpToggleCB.bindAsEventListener(this)
    Mojo.Event.listen(this.controller.get('btnHelp'),
        Mojo.Event.tap,
        this.helpToggleCB.bind(this));

	this.startOfWeekDayChangedCB = this.startOfWeekDayChangedCB.bindAsEventListener(this)
	Mojo.Event.listen(this.controller.get('startOfWeekDay'),
		Mojo.Event.propertyChange, 
		this.startOfWeekDayChangedCB.bind(this));
	
	this.minuteIntevalChangedCB = this.minuteIntervalChangedCB.bindAsEventListener(this)
	Mojo.Event.listen(this.controller.get('minuteInterval'),
		Mojo.Event.propertyChange, 
		this.minuteIntervalChangedCB.bind(this));
	
	this.handleTapCategoryEntry = this.handleTapCategoryEntry.bind(this);
	Mojo.Event.listen(this.controller.get('listCategories'),
					  Mojo.Event.listTap, 
					  this.handleTapCategoryEntry);

	this.handleAddCategoryEntry = this.handleAddCategoryEntry.bind(this);
	Mojo.Event.listen(this.controller.get('listCategories'),
					  Mojo.Event.listAdd, 
					  this.handleAddCategoryEntry);
				
	this.handleDeleteCategoryEntry = this.handleDeleteCategoryEntry.bind(this);
	Mojo.Event.listen(this.controller.get('listCategories'),
					  Mojo.Event.listDelete, 
					  this.handleDeleteCategoryEntry);

	/* add event handlers to listen to events from widgets */
	this.updateTimeout();
}




/* ===========================================================================
 * Switch help text on or off
 * ===========================================================================
 */
PrefsAssistant.prototype.switchHelp = function(togglePI)
{
    Mojo.Log.info("PrefsAssistant.switchHelp(" + togglePI + ")");
    
    var style = togglePI ? "block" : "none";
    
    for (var i = 0; i < this.descrList.length; i++) 
    {
        this.controller.get(this.descrList[i]).style.display = style;
    }
    
    this.controller.get("btnHelp").style.backgroundImage = 
        togglePI? "url(images/help-in.png)": "url(images/help-out.png)";
    
}

/* ===========================================================================
 * set help text
 * ===========================================================================
 */
PrefsAssistant.prototype.setHelp = function()  
{
    Mojo.Log.info("PrefsAssistant.setHelp()");

    var descrTextMap = {
        "stdTimeDescr": 
           $L("The standard working time for this day.") + " " +
           $L("It is used, when a record is entered manually.") + " ",
        "breakCalculateDescr":  "<br/>" + 
           $L("Automatic calculation of break time (but break is not logged)."),
        "breakAfterDescr": 
           $L(""),
        "breakDurationDescr": 
           $L(""),
        "autoCheckInOutDescr": 
           $L("Generate notifications on begin and end for working time and breaks."),
        "ringtoneDescr": "<br/><br/>" + 
           $L("Sound, when a notification is issued."),
        "ringtoneTitleDescr":  "<br/><br/>" + 
           $L("Tone, which gets played on notifications."),
        "vibrateDescr":  "<br/><br/>" + 
           $L("Vibrate, when a notification is issued"),
        "nightShiftDescr":  "<br/><br/>" + 
           $L("Night-shift mode: Lets start workingtime on one day and end it on the next day."),
        "startOfWeekdayDescr": 
           $L("The weekday that is displayed first in the weekview."),
        "minuteIntervalDescr": 
           $L("Minute interval for manually entering the start- or endtime."),
        "acceptMetrixDescr": "<br/>" +  
           $L("Get notifications for new versions."),
        "lockRotateDescr": "<br/>" +  
           $L("When locked, the display will not be rotated in landscape mode."),
        "categoryDescr": "" +  
           $L("Categories for working times:") + " " +
           $L("Used categories are displayed in grey and can not be deleted.") + " " +
           $L("Unused categories are displayed in black, and can be deleted with a swipe gesture.")
    }
    
    if(prefsGL.breakCalculate == true)
    {
       descrTextMap["breakAfterDescr"] +=
           $L("After this time, an automatic calculated break is inserted. ");
       descrTextMap["breakDurationDescr"] +=
           $L("The duration of the calculated break. ");
    }
    
    if(prefsGL.autoCheckInOutMode != 'NONE')
    {
        descrTextMap["stdTimeDescr"] += 
          $L("Also the time, where begin and end notifications are emitted.");
        descrTextMap["breakAfterDescr"] += 
          $L("A notification is emitted for start and end of a break.");
    }
    
    
    for(var i=0; i < this.descrList.length; i++) 
    {
        this.controller.get(this.descrList[i]).
            update(descrTextMap[this.descrList[i]]);
    }
}



/* ===========================================================================
 * handleCommand
 * ===========================================================================
 */
PrefsAssistant.prototype.handleCommand = function(event) 
{
	if(event.type == Mojo.Event.command) 
	{
		switch(event.command)
		{
			// these are built-in commands. we haven't enabled any of them, but
			// they are listed here as part of the boilerplate, to be enabled later if needed
			case 'do-help':
				var url = 'http://reger-clan.de/';
				
				if(Mojo.Locale.getCurrentLocale().match("de.*"))
				{
					url = url + 'de/WebOS-TrackMyWork-Einstellungen.html';
				}
				else
				{
					url = url + 'en/WebOS-TrackMyWork-Preferences.html';
				}
				
				this.controller.serviceRequest('palm://com.palm.applicationManager', 
				{ 
					method:	'open',
					parameters: { target: url}
				});
				break;	
			case 'go-back':
                this.controller.stageController.popScene();
                break;
			default:
				//Mojo.Controller.errorDialog("Got command " + event.command);
			break;
		}
	}
}




PrefsAssistant.prototype.activate = function(event) 
{
	Mojo.Log.info("PrefsAssistant.activate");
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	  
  	tmwGL.db.getCategoryData(
		this.loadCategoriesList.bind(this));
        
    this.toggleRingtone(prefsGL.sound);
        
    if(myApp.isTouchPad())
    {    
        
        var groupList = [
            "stdTimeGrp",
            "breakGrp",
            "autoCheckInOutGrp",
            "nightShiftGrp",
            "othersGrp",
            "categoriesGrp"
        ];
        
        for (var i = 0; i < groupList.length; i++) 
        {
            this.controller.get(groupList[i]).addClassName("touchpad-group");
        } 
        
        this.controller.get("listCategories").addClassName("touchpad-list");
    }

}



PrefsAssistant.prototype.deactivate = function(event) 
{
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	  
}



PrefsAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	Mojo.Event.stopListening(this.controller.get('startStdTime'),
		Mojo.Event.propertyChange, 
		this.startPropertyChanged);

	Mojo.Event.stopListening(this.controller.get('endStdTime'),
		Mojo.Event.propertyChange,
		this.endPropertyChanged);
		
	Mojo.Event.stopListening(this.controller.get('breakDurationInHours'),
		  Mojo.Event.propertyChange,
		  this.breakDurationInHoursPropertyChanged.bind(this));

	Mojo.Event.stopListening(this.controller.get('breakDurationInMinutes'),
		  Mojo.Event.propertyChange,
		  this.breakDurationInMinutesPropertyChanged.bind(this));		

	Mojo.Event.stopListening(this.controller.get('breakAfterHours'),
		  Mojo.Event.propertyChange,
		  this.breakAfterHoursPropertyChanged.bind(this));

	Mojo.Event.stopListening(this.controller.get('nightShift'),
		Mojo.Event.propertyChange,
		this.nightShiftChangedCB);

    Mojo.Event.stopListening(this.controller.get('autoCheckInOutMode'),
        Mojo.Event.propertyChange,
        this.autoCheckInOutModeChangedCB);

    Mojo.Event.stopListening(this.controller.get('vibrateToggle'),
        Mojo.Event.propertyChange,
        this.vibrateChangedCB);

    Mojo.Event.stopListening(this.controller.get('ringtoneToggle'),
        Mojo.Event.propertyChange,
        this.ringtoneToggleCB);

	Mojo.Event.stopListening(this.controller.get('startOfWeekDay'),
		Mojo.Event.propertyChange, 
		this.startOfWeekDayChangedCB);

	Mojo.Event.stopListening(this.controller.get('minuteInterval'),
		Mojo.Event.propertyChange, 
		this.minuteIntervalChangedCB.bind(this));
	
	Mojo.Event.stopListening(this.controller.get('listCategories'),
	  	Mojo.Event.listTap, 
		this.handleTapCategoryEntry);
				
	Mojo.Event.stopListening(this.controller.get('listCategories'),
		Mojo.Event.listAdd, 
		this.handleAddCategoryEntry);
				
	Mojo.Event.stopListening(this.controller.get('listCategories'),
		 Mojo.Event.listDelete, 
		 this.handleDeleteCategoryEntry);
}



PrefsAssistant.prototype.startOfWeekDayChangedCB = function(event)
{
	Mojo.Log.info("PrefsAssistant.startOfWeekDayChanged"+
		Object.toJSON(event));
		
	prefsGL.startOfWeekDay = event.value;
}



PrefsAssistant.prototype.minuteIntervalChangedCB = function(event)
{
	Mojo.Log.info("PrefsAssistant.minuteIntervalChanged"+
		Object.toJSON(event));
		
	prefsGL.minuteInterval = event.value * 1;
}


PrefsAssistant.prototype.nightShiftChangedCB = function(event)
{
    /* log the text field value when the value changes */
    Mojo.Log.info("PrefsAssistant.nightShiftChangedCB:"+
        Object.toJSON(event));

    prefsGL.nightShift = event.value;
}

PrefsAssistant.prototype.acceptMetrixChangedCB = function(event)
{
    /* log the text field value when the value changes */
    Mojo.Log.info("PrefsAssistant.acceptMetrixChangedCB:"+
        Object.toJSON(event));

    prefsGL.acceptMetrix = event.value;
}

PrefsAssistant.prototype.lockRotateChangedCB = function(event)
{
    /* log the text field value when the value changes */
    Mojo.Log.info("PrefsAssistant.lockRotateChangedCB:"+
        Object.toJSON(event));

    prefsGL.lockRotate = event.value;
}

PrefsAssistant.prototype.breakCalculateChangedCB = function(event)
{
	/* log the text field value when the value changes */
	Mojo.Log.info("PrefsAssistant.breakCalculateChangedCB:"+
		Object.toJSON(event));

	prefsGL.breakCalculate = event.value;
    
    this.setHelp();
}



PrefsAssistant.prototype.autoCheckInOutModeChangedCB = function(event)
{
    /* log the text field value when the value changes */
    Mojo.Log.info("PrefsAssistant.autoCheckInOutModeChangedCB:"+
        Object.toJSON(event));

    prefsGL.autoCheckInOutMode  = event.value;
    this.updateTimeout();
}


PrefsAssistant.prototype.vibrateChangedCB = function(event)
{
    /* log the text field value when the value changes */
    Mojo.Log.info("PrefsAssistant.vibrateChangedCB:"+
        Object.toJSON(event));

    prefsGL.vibrate  = event.value;
}



PrefsAssistant.prototype.helpToggleCB = function(event) {
    Mojo.Log.info("PrefsAssistant.helpToggleCB()");

    this.showHelp = !this.showHelp;
    
    this.switchHelp(this.showHelp);
}


PrefsAssistant.prototype.ringtoneToggleCB = function(event) {
    Mojo.Log.info("PrefsAssistant.ringtoneToggleCB()");

    prefsGL.sound = event.value;

    this.toggleRingtone(event.value);
}


PrefsAssistant.prototype.toggleRingtone = function(ringtone) {
    Mojo.Log.info("PrefsAssistant.toggleRingtone()");

    this.controller.get('ringtoneTitle').style.display = 
        ringtone? "block": "none";
}

PrefsAssistant.prototype.ringtoneChangedCB = function(event) {
    Mojo.Log.info("PrefsAssistant.ringtoneChangedCB()");

    var fileParams = 
    {
        actionType: "attach",
        defaultKind: "ringtone",
        kinds: ["ringtone"],
        actionName: $L("Done"),
        onSelect: this.handleRingtoneCB.bind(this)
    }

    Mojo.FilePicker.pickFile(fileParams, this.controller.stageController)
}


PrefsAssistant.prototype.handleRingtoneCB = function(event) 
{
    Mojo.Log.info("PrefsAssistant.handleRingtoneCB()"+Object.toJSON(event));

    prefsGL.soundFilename = event.fullPath;
    prefsGL.soundName     = event.name;
    this.controller.get("ringtoneTitleValue").
        update(prefsGL.soundName);
}



/* ===========================================================================
 * loadCategoriesList
 * ===========================================================================
 */
PrefsAssistant.prototype.loadCategoriesList = function()
{
	Mojo.Log.info("CategoryViewAssistant.loadCategoriesList");
	
	// Mojo.Log.info("Result:" + Object.toJSON(result.rows));
    var categoriesListItems = [];

	for (var i = 0; i < prefsGL.categoriesList.length; i++) 
	{
		var category = prefsGL.categoriesList[i];

		var item = {
			'id':	category.id,
			'name':	category.name			
		}

		if(category.count > 0 ||
		   prefsGL.categoriesList.length == 1 ||
		   category.id == prefsGL.defaultCategoryId)
		{
			item.noDelete = true;
			item.noDeleteClass = "noDelete"; // optical highlight
		}

		categoriesListItems.push(item);
			
	}

	this.categoriesListModel.items = categoriesListItems;
	this.controller.modelChanged(this.categoriesListModel, this);	
};





PrefsAssistant.prototype.breakDurationInHoursPropertyChanged = function(event)
{
	Mojo.Log.info("PrefsAssistant.breakDurationInHoursPropertyChanged");
	
	prefsGL.breakDurationInHours = event.value;
	this.updateTimeout();
}



PrefsAssistant.prototype.breakDurationInMinutesPropertyChanged = function(event)
{
	Mojo.Log.info("PrefsAssistant.breakDurationInMinutesPropertyChanged");
	/* log the text field value when the value changes */
	
	prefsGL.breakDurationInMinutes = event.value;
	this.updateTimeout();
}



PrefsAssistant.prototype.breakAfterHoursPropertyChanged = function(event)
{
	Mojo.Log.info("PrefsAssistant.breakAfterHoursPropertyChanged");
	/* log the text field value when the value changes */
	
	prefsGL.breakAfterHours = event.value;
	
	this.updateTimeout();
}



PrefsAssistant.prototype.breakAfterMinutesPropertyChanged = function(event)
{
	Mojo.Log.info("PrefsAssistant.breakAfterMinutesPropertyChanged");
	/* log the text field value when the value changes */
	
	prefsGL.breakAfterMinutes = event.value;
	this.updateTimeout();
}




PrefsAssistant.prototype.startPropertyChanged = function(event)
{
	/* log the text field value when the value changes */
	var checkStartDate = prefsGL.standardDayBegin;
	
	checkStartDate.setHours(event.value.getHours());
	checkStartDate.setMinutes(event.value.getMinutes());
	
	if(checkStartDate <= prefsGL.standardDayEnd)
	{
		prefsGL.standardDayBegin = checkStartDate;
		this.updateTimeout();
	}
	else
	{
		this.controller.showAlertDialog(
		{
			title:		$L("Problem"),
			message:	$L("Standard start time must be before end time"),
			choices:	[{label:$L('Ok'), value:"refresh"}]				    
		});		
	
		this.startDate = prefsGL.standardDayBegin;
		this.startTimeModel.value = this.startDate;
		this.controller.modelChanged(this.startTimeModel, this);	
	}		
}


PrefsAssistant.prototype.endPropertyChanged = function(event)
{
	Mojo.Log.info("PrefsAssistant.endPropertyChanged");
	var checkEndDate = prefsGL.standardDayEnd;
	
	checkEndDate.setHours(event.value.getHours());
	checkEndDate.setMinutes(event.value.getMinutes());
	
	if(checkEndDate >= prefsGL.standardDayBegin)
	{
		prefsGL.standardDayEnd = checkEndDate;
		this.updateTimeout();
	}
	else
	{
		this.controller.showAlertDialog(
		{
			title:		$L("Problem"),
			message:	$L("Standard end time must be after start time"),
			choices:	[{label:$L('Ok'), value:"refresh"}]				    
		});	
		
		this.endDate = prefsGL.standardDayEnd;
		this.endTimeModel.value = this.endDate;
		this.controller.modelChanged(this.endTimeModel, this);	
	
	}	
}


PrefsAssistant.prototype.updateTimeout = function()
{
	if (prefsGL.autoCheckInOutMode != "NONE") 
	{
		timeoutStart();
		this.controller.get('nextCall').innerHTML = "<br/>" + 
			$L("Next notification") + ": <b>" + Mojo.Format.formatDate(tmwGL.nextCall, {
					date: 'short',
					time: 'short',
					countryCode: ''
				}) + "</b>"; 
        this.controller.get('ringtone').style.display="block";
        this.controller.get('vibrate').style.display="block";
	}
	else 
	{
		timeoutClear();
        this.controller.get('nextCall').style.display="none";
        this.controller.get('ringtone').style.display="none";
        this.controller.get('vibrate').style.display="none";
        
	}

    this.setHelp();

}

/* ===========================================================================
 * handleTapCategoryEntry
 * ===========================================================================
 */
PrefsAssistant.prototype.handleTapCategoryEntry = function(event)
{
	Mojo.Log.info("PrefsAssistant.handleTapCategoryEntry");
	
	Mojo.Log.info("Clicked on " + Object.toJSON(event.item));
    
	this.controller.stageController.pushScene('CategoryView', event.item);   
};



/* ===========================================================================
 * handleDeleteDayEntry
 * ===========================================================================
 */
PrefsAssistant.prototype.handleDeleteCategoryEntry = function(event)
{
	Mojo.Log.info("PrefsAssistant.handleDeleteDayEntry");
	
	var dateStr = event.item.date;
    Mojo.Log.info("Clicked on " + Object.toJSON(event.item));
	
	tmwGL.db.removeCategory(event.item.id, this.deleteCB.bind(this));
	tmwGL.db.getCategoryData();
    	
};


/* ===========================================================================
 * deleteCallback
 * ===========================================================================
 */
PrefsAssistant.prototype.deleteCB = function(event)
{
	Mojo.Log.info("PrefsAssistant.deleteCB");
};

	

/* ===========================================================================
 * handleAddDayEntry
 * ===========================================================================
 */
PrefsAssistant.prototype.handleAddCategoryEntry = function(event)
{
	Mojo.Log.info("PrefsAssistant.handleAddDayEntry");
	
	item = {
			'id':       0,
			"name":		"",
			"type":		"private"
	};
	
	this.controller.stageController.pushScene('CategoryView', item);   	
};
