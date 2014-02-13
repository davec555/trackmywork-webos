/*****************************************************************************
 * TrackMyWork - Edit an entry
 * 
 * (c) 2009, 2010 by Klaus Reger <K.Reger@gmx.de>
 * 
 ****************************************************************************/


function TimeViewAssistant(itemPI, headerPI)
{
	Mojo.Log.info("TimeViewAssistant");
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */

    this.item = itemPI;
	 
	this.problem     = "";
	 
	if(headerPI != undefined)
	{
		this.header      = headerPI;
	}
	else
	{
		this.header = $L("Edit an entry");
	}
	
}

TimeViewAssistant.prototype.setup = function() {
	
	Mojo.Log.info("TimeViewAssistant.setup");

   	this.controller.window.PalmSystem.setWindowOrientation("up");

	this.startDay = this.controller.get('startDay');	
	this.endDay   = this.controller.get('endDay');

	var arrWeekdays = Mojo.Locale.getDayNames();
		
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
	
	this.controller.get('header').update(this.header);
	
	this.controller.get('title').update
	(
		arrWeekdays[this.item.startDate.getDay()] + ", " +
		Mojo.Format.formatDate(this.item.startDate, {
			date: 'long',
			countryCode: ''
		})
	);

	this.startDay.innerHTML = Mojo.Format.formatDate(this.item.startDate, 
	{
		date: 'long',
		countryCode: ''
	});

	this.controller.setupWidget('startTime', 
	{
		label:	$L('Start'),
		labelPlacement:	Mojo.Widget.labelPlacementRight,
		modelProperty:	'value',
		minuteInterval : prefsGL.minuteInterval
	},
	this.startTimeModel = {
		value : this.item.startDate
	});

	this.startPropertyChanged = this.startPropertyChanged.bindAsEventListener(this)
	Mojo.Event.listen(this.controller.get('startTime'),
		Mojo.Event.propertyChange,
		this.startPropertyChanged);
	
	// checked out entry
	if (this.item.inClass == "") {
		this.endDay.innerHTML = Mojo.Format.formatDate(this.item.endDate, 
		{
			date: 'long',
			countryCode: ''
		});

		this.controller.setupWidget('endTime', {
			label: $L('End'),
			labelPlacement: Mojo.Widget.labelPlacementRight,
			modelProperty: 'value',
			minuteInterval: prefsGL.minuteInterval
		}, 
		this.endTimeModel = {
			value: this.item.endDate
		});
		
		this.endPropertyChanged = this.endPropertyChanged.bindAsEventListener(this)
		Mojo.Event.listen(this.controller.get('endTime'), 
			Mojo.Event.propertyChange, 
			this.endPropertyChanged);
	}
	
	
	this.controller.setupWidget('saveBtn', 
	{}, 
	{
		buttonLabel: $L('Done'),
		buttonClass: 'primary',
		disabled: false
	});
	Mojo.Event.listen(this.controller.get('saveBtn'),
		Mojo.Event.tap, 
		this.cbSaveBtn.bind(this))
	
	this.controller.setupWidget('stdDayBtn', 
	{}, 
	{
		buttonLabel: $L('Use standard day'),
		buttonClass: 'secondary',
	    disabled: false
	});
	Mojo.Event.listen(this.controller.get('stdDayBtn'),
		Mojo.Event.tap, 
		this.cbStdDayBtn.bind(this))
	
	this.controller.setupWidget('note', 
	{	
		multiline:			true,
		focus:              true,
		modifierState: 		Mojo.Widget.capsLock,
		// maxLength: 			1000,
		limitResize:        false,
		enterSubmits:       false,
		requiresEnterKey: 	true,
		holdToEnable:		true
	},
	this.noteModel = {
		value:    this.item.note,
		disabled: false
	});
	this.controller.get('noteLabel').update($L("Note"));
	
	this.selectorChanged = this.selectorChanged.bindAsEventListener(this);

	this.categories = [];
	
	for (var i = 0; i < prefsGL.categoriesList.length; i++) 
	{
		var category = prefsGL.categoriesList[i];

		this.categories.push({
			label: category.name,
			value: category.id
		});
	};

	this.controller.setupWidget('category', 
	{
		label: 			$L('Category'),
		labelPlacement:	Mojo.Widget.labelPlacementRight,
		choices: 		this.categories, 
		modelProperty:	'currentCategory'
	}, 
	this.selectorsModel = 
	{
		currentCategory: this.item.categoryId
	});

	
	Mojo.Event.listen(this.controller.get('category'),
		Mojo.Event.propertyChange, 
		this.selectorChanged.bind(this));
	
    myApp.addBackMenu(this);
}




TimeViewAssistant.prototype.activate = function(event) {
    Mojo.Log.info("TimeViewAssistant.activate");
    
    
          
    if(myApp.isTouchPad())
    {
        this.controller.get("groupEdit").addClassName("touchpad-group");
        this.controller.get("saveBtn").addClassName("touchpad-btn");
        this.controller.get("stdDayBtn").addClassName("touchpad-btn");
    }
}




/* ===========================================================================
 * handleCommand
 * ===========================================================================
 */
TimeViewAssistant.prototype.handleCommand = function(event) 
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
					url = url + 'de/WebOS-TrackMyWork-EintragBearbeiten.html';
				}
				else
				{
					url = url + 'en/WebOS-TrackMyWork-EditEntry.html';
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



//displays the current state of various selectors
TimeViewAssistant.prototype.selectorChanged = function(event) 
{
	
	this.item.categoryId = this.selectorsModel.currentCategory;
}



TimeViewAssistant.prototype.startPropertyChanged = function(event)
{
	Mojo.Log.info("TimeViewAssistant.startPropertyChanged: ");
	
	this.setStartDate(this.item.startDate.getHours(), 
	                  this.item.startDate.getMinutes());
					  
	this.setEndDate(this.item.endDate.getHours(), 
	                this.item.endDate.getMinutes());

}


TimeViewAssistant.prototype.endPropertyChanged = function(event)
{
	Mojo.Log.info("TimeViewAssistant.endPropertyChanged");

	this.setEndDate(this.item.endDate.getHours(), 
	                this.item.endDate.getMinutes());

}


TimeViewAssistant.prototype.setStartDate = function(hrPI, minPI)
{	
	Mojo.Log.info("TimeViewAssistant.setStartDate");
	this.item.startDate.setHours(hrPI);
	this.item.startDate.setMinutes(minPI);
	
	this.controller.modelChanged(this.startTimeModel, this);	
}
	


TimeViewAssistant.prototype.setEndDate = function(hrPI, minPI)
{	
	Mojo.Log.info("TimeViewAssistant.setEndDate");
	
	// Get the day from start time
	this.item.endDate = new Date(this.item.startDate);
	
	this.item.endDate.setHours(hrPI);
	this.item.endDate.setMinutes(minPI);

    // End is on next day, when night shift is activated	
	if(this.item.endDate < this.item.startDate &&
	   prefsGL.nightShift == true)
	{
		// Tomorrow, but the same time
		var tmpDate = new Date(this.item.endDate.getTime() + MSECS_PER_DAY);
		this.item.endDate = tmpDate;
	}

	this.endDay.innerHTML = Mojo.Format.formatDate(this.item.endDate, {
		date: 'long',
		countryCode: ''
	})

	// NOTE: Because not only the data but also the variable has changed we
	// have to reassign the complete widget
	this.endTimeModel.value = this.item.endDate;
	this.controller.setupWidget(this.controller.get('endTime'), this.endTimeModel);
	this.controller.modelChanged(this.endTimeModel, this);	
}
	

TimeViewAssistant.prototype.cbSaveBtn = function(event){
	Mojo.Log.info("TimeViewAssistant.cbSaveButton");

	this.item.note = this.noteModel.value;

	Mojo.Log.info("StartDate:" + this.item.startDate);
	Mojo.Log.info("EndDate:" + this.item.endDate);
	
	this.problem = tmwGL.db.checkTimes
		(this.item.id,
		 this.item.startDate,
		 this.item.endDate);
	
	if(this.problem == "")
	{
		var endDate = this.item.endDate;
		
		// Currently not checked out
		if(this.item.inClass != "")
		{
			endDate = null;	
		}
		
	    tmwGL.db.save(this.item.id,
					  this.item.startDate,
					  endDate,
					  this.item.note, 
					  this.item.categoryId); 

		this.controller.stageController.popScene();  
	}
	else
	{
		this.controller.showAlertDialog(
		{
			title:		$L("Problem"),
			message:	this.problem,
			choices:	[{label:$L('Ok'), value:"refresh"}]				    
		});
	}
}


TimeViewAssistant.prototype.cbStdDayBtn = function(event){
	Mojo.Log.info("TimeViewAssistant.cbStdDayButton");

	this.setStartDate(prefsGL.standardDayBegin.getHours(), 
	   				  prefsGL.standardDayBegin.getMinutes());
					  
	this.setEndDate(prefsGL.standardDayEnd.getHours(),
					prefsGL.standardDayEnd.getMinutes());
}



TimeViewAssistant.prototype.deactivate = function(event) {
	Mojo.Log.info("TimeViewAssistant.deactivate");
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

TimeViewAssistant.prototype.cleanup = function(event) {
	Mojo.Log.info("TimeViewAssistant.cleanup");
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */

	Mojo.Event.stopListening(this.controller.get('saveBtn'),
		Mojo.Event.tap, 
		this.cbSaveBtn.bind(this))

	Mojo.Event.stopListening(this.controller.get('startTime'),
		Mojo.Event.propertyChange,
		this.startPropertyChanged);
	
	Mojo.Eent.stopListening(this.controller.get('endTime'),
		Mojo.Event.propertyChange,
		this.endPropertyChanged);
	
	Mojo.Event.stopListening(this.controller.get('stdDayBtn'),
		Mojo.Event.tap, 
		this.cbStdDayBtn.bind(this));
		
	
	Mojo.Event.stopListening(this.controller.get('category'),
		Mojo.Event.propertyChange, 
		this.selectorChanged.bind(this));
}
