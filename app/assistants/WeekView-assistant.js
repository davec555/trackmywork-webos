/*****************************************************************************
 * TrackMyWork - Weekly overview
 * 
 * (c) 2009, 2010 by Klaus Reger <K.Reger@gmx.de>
 * 
 ****************************************************************************/

function WeekViewAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	Mojo.Log.info("WeekViewAssistant.constructor");
}
 
 
/* ===========================================================================
 * setup
 * ===========================================================================
 */
WeekViewAssistant.prototype.setup = function () 
{
	Mojo.Log.info("WeekViewAssistant.setup");
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	
 	this.viewMenuModel = 
	{
		items: 
		[{},
         {
			items:
			[	
                {
                    label: $L('Back'), 
                    icon:'back', 
                    command:'back'
                },
                {
                    label: $L('Today'), 
                    // width: 80, // really set at orientationChanged
                    command:'thisWeek'
                },
                {
                    label: $L('Go to ...'), 
                    // width: 80, // really set at orientationChanged
                    command:'selectDate'
                },
                {
                    label: $L('Forward'), 
                    icon:'forward', 
                    command:'fwd'
                }
        	]
		},
        {}]
	};
	
	this.categoriesMenuItems = [];
	this.categoriesMenuModel = 
	{
		items: this.categoriesMenuItems
	};
	
	this.controller.setupWidget('categories-menu', undefined, this.categoriesMenuModel);	

		
	this.commandMenuModel =
	{
		items:
		[
            {},
            {
    		 	toggleCmd:tmwGL.inOut, 
    	 		items:
    			[
                    {
                        // width:  65, 
                        icon:   'img-out', 
                        command:'out'
                    },        
                    {
                        // width:  65, 
                        icon:   'img-in', 
                        command:'in'
                    }
    			]
    		},
    		{
    			label: $("Category"),
    			// width: 100, // really set at orientationChanged
    			submenu:'categories-menu'
		    },
            {}
        ]
    };		
	
	this.appMenuModel = {
		visible: true,
		items: [
			Mojo.Menu.editItem,
			{ label: $L("Preferences ..."), command: 'do-prefs' },
    		{ label: $L("Export / Import ..."), command: 'export' },
	   		{ label: $L("Statistics ..."), command: 'statistics' },
	   		{ label: $L("Help ..."), command: 'do-help' }
		]
	};
				
	this.controller.setupWidget(Mojo.Menu.appMenu, 
		{omitDefaultItems: true}, this.appMenuModel);
	this.controller.setupWidget(Mojo.Menu.viewMenu, 
        this.vmAttributes = {
            menuClass: 'no-fade'
        }, 
        this.viewMenuModel);
	this.controller.setupWidget(Mojo.Menu.commandMenu, 
        this.cmAttributes = {
            menuClass: 'no-fade'
        }, 
        this.commandMenuModel);
	this.controller.modelChanged(this.commandMenuModel, this);
		
	// Set up a few models so we can test setting the widget model:
	this.listModel = 
	{
		listTitle: "",
        items: []
	};
		
	// this.setupList(tmwGL.dateStart);
	
 	// Set up the attributes & model for the List widget:
	this.controller.setupWidget
		('listWeek', 
 	     {itemTemplate:'WeekView/WeekView-listitem', 
		  listTemplate:'WeekView/WeekView-listcontainer'},
		  this.listModel);
		
	/* add event handlers to listen to events from widgets */		
    Mojo.Event.listen(this.controller.get('listWeek'),
                      Mojo.Event.flick, 
                      this.handleFlick.bind(this));
        
	this.handleListWeekEntry = this.handleListWeekEntry.bind(this);
	Mojo.Event.listen(this.controller.get('listWeek'),
					  Mojo.Event.listTap, 
					  this.handleListWeekEntry);

	this.setupListHandler = this.setupList.bind(this);
	this.orientationChanged(PalmSystem.screenOrientation);
	
	if (tmwGL.beta) {

		var thanksMessage = "<p><b>"+ 
		                    $L("Thank you very much for testing this application!") + 
							"</b></p>";

		// Beta version has been expired
		if(prefsGL.expirationDate < new Date())
		{
			var message = thanksMessage + 
			    "Please upgrade to the "+
				"<a href='"+tmwGL.appUrl+"'>full version</a> "+
				"or to the <a href='"+tmwGL.betaAppUrl+"'>newest Beta</a> "+
				"version (if available).";
				
			if(Mojo.Locale.getCurrentLocale().match("de.*"))
			{
				message = thanksMessage + 
				    "Bitte auf die "+
					"<a href='"+tmwGL.appUrl+"'>Vollversion</a> "+
					"oder die <a href='"+tmwGL.betaAppUrl+"'>neueste Beta-Version</a> "+
					"(wenn vorhanden) aktualisieren.";
			}
			
			this.controller.showAlertDialog({
				title: $L("Information"),
				allowHTMLMessage: true,
				message: $L("This Beta version is expired since ") + "<br/><b>" +
					Mojo.Format.formatDate(prefsGL.expirationDate, {
						date: 'long',
						countryCode: ''
					}) +
					"</b>.<br/>" + 
					message,
				choices: [{
					label: $L('Ok'),
					value: "refresh",
					type: 'affirmative'
				},
				{
					label: $L('Export Your Data'),
					value: "export",
					type: ''
				}],
				onChoose: function(value) {
					if(value == 'export')
					{
						this.controller.stageController.swapScene('Export');  
					}
					else
					{
						this.controller.window.close();
					}
				}
			});
		}
		// un-expired beta version
		else
		{
			var message = thanksMessage + 
			    "You can also update to the "+
				"<a href='"+tmwGL.appUrl+"'>full version</a>";
				
			if(Mojo.Locale.getCurrentLocale().match("de.*"))
			{
				message = thanksMessage + "Es ist eine Aktualisierung auf die "+
					"<a href='"+tmwGL.appUrl+"'>Vollversion</a> "+
					"möglich.";
			}
			
			var weekBeforeExpiration = new Date(prefsGL.expirationDate.getTime() - 86400000*7);
			var today = new Date();
			
			if(prefsGL.betaAccepted == undefined ||
			   prefsGL.betaAccepted != Mojo.appInfo.version ||
			   weekBeforeExpiration <= today)
			{
				this.controller.showAlertDialog({
					title: $L("Information"),
					allowHTMLMessage: true,
					message: $L("This Beta version expires at:") + "<br/><b>" + 
						Mojo.Format.formatDate(prefsGL.expirationDate, {
							date: 'long',
							countryCode: ''
						}) + ".</b><br/>" + message,
					choices: [{
						label: $L('Ok'),
						value: "refresh",
						type: 'affirmative'
					}],
					onChoose: function(value) {
						prefsGL.betaAccepted = Mojo.appInfo.version;
					}
				});	
			}
		}
	}
	
	if(prefsGL.changelogAccepted == undefined ||
	   prefsGL.changelogAccepted != Mojo.appInfo.version)
	{
		this.controller.stageController.pushScene('Changelog');  
	}
    
};




/* ===========================================================================
 * activate
 * ===========================================================================
 */
WeekViewAssistant.prototype.activate = function(event) 
{
	Mojo.Log.info("WeekViewAssistant.activate");

    if(myApp.isTouchPad())
    {
        this.controller.get("listWeek").addClassName("touchpad-list");
    }

    if(!prefsGL.lockRotate)
    {
    	// enable free orientation
       	this.controller.window.PalmSystem.setWindowOrientation("free");
    }
	
	this.setupList(tmwGL.dateStart);
	this.loadCategoryList();

	this.commandMenuModel.items[2].label = prefsGL.defaultCategoryName;			
	this.controller.modelChanged(this.commandMenuModel, this);
	
	this.interval = this.controller.window.setInterval
		(this.setupListHandler, 60000);
	tmwGL.db.getInOrOut(this.inOrOutCB.bind(this));
	tmwGL.db.getCategoryData(this.loadCategoryList());
};



WeekViewAssistant.prototype.loadCategoryList = function() 
{
	Mojo.Log.info("WeekViewAssistant.loadCategoryList");
	
	this.categoriesMenuItems = [];

	var filterIdList = prefsGL.categoriesFilter.split(",");

	if (prefsGL.categoriesList.length == 0) {
		this.categoriesMenuItems.push({
			"label": $L("Please add categories"),
			"command": ""
			});
	}
	else 
	{
		this.categoriesMenuItems.push({
			label: $L("Category filter ..."),
			command: "category-filter"
		});

		for (var i = 0; i < prefsGL.categoriesList.length; i++) {
			var category = prefsGL.categoriesList[i];
			var inFilter = false;
			
			for (var id = 0; id < filterIdList.length; id++) {

				if (category.id == filterIdList[id] ||
				prefsGL.categoriesFilter == "all") {
					inFilter = true;
				}
			}
			
			if(inFilter)
			{
				this.categoriesMenuItems.push({
					"label": category.name,
					"command": category.id,
					"icon": "checkmark" 
				});
			}
		};

		for (var i = 0; i < prefsGL.categoriesList.length; i++) {
			var category = prefsGL.categoriesList[i];
			var inFilter = false;
			
			for (var id = 0; id < filterIdList.length; id++) {

				if (category.id == filterIdList[id] ||
				prefsGL.categoriesFilter == "all") {
					inFilter = true;
				}
			}
			
			if(!inFilter)
			{
				this.categoriesMenuItems.push({
					"label": category.name,
					"command": category.id
				});
			}
		};
	}		
	
	this.categoriesMenuModel.items = this.categoriesMenuItems;
	this.controller.setupWidget('categories-menu', undefined, this.categoriesMenuModel);	
};


WeekViewAssistant.prototype.orientationChanged = function(orientation) 
{
	var deviceInfo = Mojo.Environment.DeviceInfo;		
	this.orientationClass = "";

	if(!prefsGL.lockRotate && (orientation == "left" ||  orientation == "right"))
	{
		this.orientationClass = "landscape";
		this.screenWidth = deviceInfo.screenHeight;
	}	
	else
	{
		this.screenWidth = deviceInfo.screenWidth;
	}

    Mojo.Log.info("@@@@@@@@@@@@@1 WIDTH: "+ this.screenWidth)
	
    // Touchpad:
    if(this.screenWidth === 1024 || this.screenWidth === 768)
    {
        this.screenWidth = this.screenWidth * 0.66;
    }
    // Pre3 Portrait:
    else if(this.screenWidth === 480)
    {
        this.screenWidth = 320;
    }
    // Pre3 Landscape
    else if(this.screenWidth === 800)
    {
        this.screenWidth = 480;
    }
    
	Mojo.Log.info("@@@@@@@@@@@@@2 WIDTH: "+ this.screenWidth)

	var width = (this.screenWidth - 120) / 2;

    this.viewMenuModel.items[1].items[1].width = width;
    this.viewMenuModel.items[1].items[2].width = width;
	
	this.commandMenuModel.items[2].width = this.screenWidth - 120;

    this.controller.modelChanged(this.viewMenuModel, this);
    this.controller.modelChanged(this.commandMenuModel, this);

	this.loadCategoryList();
	this.setupList(tmwGL.dateStart);
    
    if(tmwGL.prefs.acceptMetrix)
    {                 
        tmwGL.Metrix.checkBulletinBoard(this.controller, 10020);
    }

}




/* ===========================================================================
 * handleCommand
 * ===========================================================================
 */
WeekViewAssistant.prototype.handleCommand = function(event) 
{
	// back gesture moves to dashboard
    if(event.type == Mojo.Event.back && !tmwGL.free) 
    {
        event.stop();
        event.stopPropagation();
        
        var appController = Mojo.Controller.getAppController();
        var dashboardStageController = appController.getStageProxy("Dashboard");
         
        // Create or update dashboard
        if (!dashboardStageController) 
        {
            Mojo.Log.info("New Dashboard Stage");
            var pushDashboard = function(stageController)
            {
                stageController.pushScene("Dashboard");
            };
            appController.createStageWithCallback({
                name: "Dashboard",
                clickableWhenLocked: true,
                lightweight: true
            }, pushDashboard, "Dashboard");
        }
        else 
        {
            Mojo.Log.info("Existing Dashboard Stage");
            dashboardStageController.delegateToSceneAssistant("updateDashboard");
        }
    
        this.controller.window.close();
    }
	else if(event.type == Mojo.Event.command) 
	{
		switch(event.command)
		{
			case 'back':
				this.handleBackBtn();
				break;
			
			case 'thisWeek':
				this.handleThisWeekBtn();
				break;
			
			case 'selectDate':
				this.handleSelectDateBtn();
				break;
			
			case 'fwd':
				this.handleFwdBtn();
				break;
			
			case 'in':
				this.handleInBtn();
				break;
			
			case 'out':
				this.handleOutBtn();
				break;
			
			// these are built-in commands. we haven't enabled any of them, but
			// they are listed here as part of the boilerplate, to be enabled later if needed
			case 'do-prefs':
				this.controller.stageController.pushScene('Prefs');   
				break;	

			case 'category-filter':
				this.controller.stageController.pushScene('CategorySelect', 
					this.setFilterCB.bind(this),
					prefsGL.categoriesFilter);   
				break;	

			// these are built-in commands. we haven't enabled any of them, but
			// they are listed here as part of the boilerplate, to be enabled later if needed
			case 'do-help':
				this.controller.stageController.pushScene('Help'); 
				break;
				
			case 'export':
				this.controller.stageController.pushScene('Export');   
				this.loadCategoryList();
				break;	
			
			case 'statistics':
				if(this.featureAvailable($L("Statistics")))
				{
					this.controller.stageController.pushScene('Statistics');
				}
				break;	

			case 'palm-show-app-menu':
				break;
            // Used for selecting a new category    
			default:
				for (var i = 0; i < prefsGL.categoriesList.length; i++) 
				{
					var category = prefsGL.categoriesList[i];

					if(category.id == event.command)
					{
						this.selectCategory(category);
					}
					
					// Add or remove filter
					if("filter-"+category.id == event.command)
					{
						var filterIdList = prefsGL.categoriesFilter.split(",");
						var inFilter = false;
						for (var id = 0; id < filterIdList.length; id++) 
						{					
							if (category.id == filterIdList[id])
							{
								inFilter = true;
								filterIdList.splice(id, 1)
								break;
							}

							if (filterIdList[id] == "")
							{
								filterIdList.splice(id, 1)
							}
						}
						
						if(!inFilter)
						{
							filterIdList.push(category.id);
							filterIdList.sort();		
						}
						
						
						prefsGL.categoriesFilter = filterIdList.join(",");
						
						this.loadCategoryList();
						// Query Times	
						this.loadData(tmwGL.dateStartOfWeek);	
						tmwGL.prefs.putCookie();
					}
				};
				break;
		}
	}
}




/* ===========================================================================
 * Select a new category
 * ===========================================================================
 */
WeekViewAssistant.prototype.selectCategory = function(category)
{
    Mojo.Log.info("XXX --> WeekViewAssistant.selectCategory('"+category.name+"')");
 
    var checkedIn = (tmwGL.inOut == 'in');
 
    if (checkedIn) 
    {
        this.handleOutBtn();
    }
    
    prefsGL.defaultCategoryName = category.name;
    prefsGL.defaultCategoryId = category.id;
    
    this.commandMenuModel.items[2].label = category.name;
    this.controller.modelChanged(this.commandMenuModel, this);
    
    tmwGL.prefs.putCookie();
    
    if (checkedIn) 
    {
        this.handleInBtn();
    }
}

/* ===========================================================================
 * Check for full version
 * ===========================================================================
 */
WeekViewAssistant.prototype.featureAvailable = function(what){
	if (tmwGL.free) {
		
		if(what != "")
		{
			var message = 
				"The Feature '" + what + "' " + 
				"is available only in the <a href='"+tmwGL.appUrl+"'>full version</a>.";
	
			if(Mojo.Locale.getCurrentLocale().match("de.*"))
			{
				message = 
					"Die Funktion '" + what + "' " + 
					"ist nur in der <a href='"+tmwGL.appUrl+"'>Vollversion</a> integriert.";
			}
			
			this.controller.showAlertDialog({
				title: $L("Information"),
				allowHTMLMessage: true,
				message: message,
				choices: [{
					label: $L('Ok'),
					value: "refresh",
					type: 'affirmative'
				}]
			});	
		}
		
		return false;
	}
	else {
		return true;
	}
}




/* ===========================================================================
 * setupList
 * ===========================================================================
 */
WeekViewAssistant.prototype.setupList = function(dateStartPI)
{
	Mojo.Log.info("WeekViewAssistant.setupList");

    // this.controller.get('areaInfo').update(new Date());

    // This is the default
    if(dateStartPI == undefined)
	{
		dateStartPI = tmwGL.dateStart;
	}

    tmwGL.dateStart     = dateStartPI;
    var weekStart = prefsGL.startOfWeekDay;
	
    var myWeekList = [];
    var todayInd = 0;

	// getDay: 0 = sunday ...
	var weekdayInd = dateStartPI.getDay() - weekStart;

	// Get one week back on same day as weekday
	if(weekdayInd < 0)
	{
		weekdayInd += 7;
	}
	
    tmwGL.dateStartOfWeek = new Date(tmwGL.dateStart.getTime() - 
						     		(weekdayInd * MSECS_PER_DAY)); 						
	
	// Query Times	
	this.loadData(tmwGL.dateStartOfWeek);
	
	this.loadCategoryList();
}




/* ===========================================================================
 * loadData
 * ===========================================================================
 */
WeekViewAssistant.prototype.loadData = function(dateStart)
{
	Mojo.Log.info("WeekViewAssistant.loadData:" + dateStart);
	
	var dateEnd = new Date(dateStart.getTime() + MSECS_PER_DAY * 7);
	var weekNumber = getWeekNumber(dateStart);
    
	dateStartStr = dateToYYYYMMDD(dateStart, '-');
	dateEndStr = dateToYYYYMMDD(dateEnd, '-');
	
	this.listModel.items = [];
	
	//update the list widget
	this.listModel.listTitle = $L("Overview for week") + " " +
        weekNumber + "  (" + 
		Mojo.Format.formatDate(dateStart, {
			date: 'short',
			countryCode: ''
		}) + ")";		

    tmwGL.db.getWeekData(dateStart, 
		this.weekDataCB.bind(this));

}




/* ===========================================================================
 * weekDataCB
 * ===========================================================================
 */
WeekViewAssistant.prototype.weekDataCB = function(dateStartPI, result)
{
	Mojo.Log.info("WeekViewAssistant.weekDataCB");

    this.listModel.items = [];

	var arrWeekdays = Mojo.Locale.getDayNames();
	var i;
	
	var currDate = dateStartPI;
	var data = {};

	// pre initialize array
    for (i=0; i<7; i++)
	{
		var dateAsStr = dateToYYYYMMDD(currDate, '-');

		data[dateAsStr] = {
			"date":       (arrWeekdays[currDate.getDay()].substr(0, 2) + 
						 " " + currDate.getDate()),
			"minDate":    currDate,
			"startTime":  "00:00",
			"endTime":    "00:00",
			"result":     "0:00"
		};
		
		// add one day
		currDate = new Date(currDate.getTime() + 86400000);
	}

	// Line for summary
	data['SUM'] = {
			"date":       $L('Sum'),
			"minDate":    null,
			"startTime":  "-",
			"endTime":    "-",
			"result":     "0:00"
	};
	
	sumDuration = 0;

	for (var i = 0; i < result.rows.length; i++) {
		var row = result.rows.item(i);

		var date = row['d_date'];
		var minTime = new Date(row['i_minUnixtime'] * 1000);
		var maxTime = new Date(row['i_maxUnixtime'] * 1000);
		// var dateAsStr = dateToYYYYMMDD(minTime, '-');
		var dateAsStr = row['d_date'];;
		var durationInSec = row['i_duration'];
		
		var breakDurationInSec = 
			prefsGL.breakDurationInHours * 3600 + 
			prefsGL.breakDurationInMinutes * 60;
		
		// We have to subtract auto-break-time
		if(prefsGL.breakCalculate &&
		   durationInSec > (prefsGL.breakAfterHours * 60 + prefsGL.breakAfterMinutes) * 60)
		{
			durationInSec -= breakDurationInSec;
		}
		
		if(durationInSec < 0)
		{
			durationInSec = 0;
		}
		
		sumDuration += durationInSec;
		
		data[dateAsStr].minDate = minTime;
		
		data[dateAsStr].startTime = Mojo.Format.formatDate(minTime, {
			"time": 'short',
			"countryCode": ''
		});
			
		data[dateAsStr].endTime = Mojo.Format.formatDate(maxTime, {
			"time": 'short',
			"countryCode": ''
		});

		data[dateAsStr].result = durationToHHMM(durationInSec);
		data[dateAsStr].categoryName = row['v_projectName'];
	}

	data['SUM'].result = durationToHHMM(sumDuration);

	var today = dateToYYYYMMDD(new Date(), '-');
	
	var ampm = "";
	
	if(Mojo.Format.using12HrTime() && this.orientationClass == "")
	{
		ampm = "ampm";
	}
	
	// Draw array to screen
	for (var ind in data)
	{
		var rowClass = "";
		var inClass = "";
		
		if(ind == today)
		{
			rowClass = "today";
			if(tmwGL.inOut == 'in')
			{
				inClass = "in";
			}
		}
		
		var categoryName = data[ind]['categoryName'];		
		if(categoryName !== undefined)
		{
			categoryName = categoryName.replace(/\n/g, " ");
			if(categoryName.length > 35)
			{
				categoryName = categoryName.substr(0, 32) + "...";
			}
		}

		this.listModel.items.push({
			"date":         	ind,
			"minDate":			data[ind].minDate,
			"dateStr": 			data[ind].date,
			"startTime": 		data[ind]['startTime'],
			"endTime": 			data[ind]['endTime'],
			"result": 			data[ind]['result'],
			"categoryName":  	categoryName,
			"rowClass": 		rowClass,
			"inClass":      	inClass,
			"ampmClass":		ampm,
			"orientationClass": this.orientationClass
		});
	}

	this.controller.modelChanged(this.listModel, this);	
};




/* ===========================================================================
 * inOrOutCB
 * ===========================================================================
 */
WeekViewAssistant.prototype.inOrOutCB = function()
{
	Mojo.Log.info("WeekViewAssistant.inOrOutCB: " + tmwGL.inOut);

	this.commandMenuModel.items[1].toggleCmd = tmwGL.inOut;
	this.controller.modelChanged(this.commandMenuModel, this);	
}



/* ===========================================================================
 * setFilterCB
 * ===========================================================================
 */
WeekViewAssistant.prototype.setFilterCB = function(categoryList)
{
	Mojo.Log.info("WeekViewAssistant.setFilterCB: " + categoryList);
	
	prefsGL.categoriesFilter = categoryList;
	this.loadCategoryList();
	
	// Query Times	
	this.loadData(tmwGL.dateStartOfWeek);	
	tmwGL.prefs.putCookie();
}

WeekViewAssistant.prototype.handleFlick = function(event) 
{
    Mojo.Log.info("WeekViewAssistant.event");
    if (event.velocity.x > 0) {
        this.handleFwdBtn();
    }
    else 
    {
        this.handleBackBtn();
    }
}

/* ===========================================================================
 * handleBackBtn
 * ===========================================================================
 */
WeekViewAssistant.prototype.handleBackBtn = function()
{
    Mojo.Log.info("WeekViewAssistant.handleBackButton");
	this.setupList(new Date(tmwGL.dateStart.getTime() - (7*86400000)));
};



/* ===========================================================================
 * handleFwdButton
 * ===========================================================================
 */
WeekViewAssistant.prototype.handleFwdBtn = function()
{
    Mojo.Log.info("WeekViewAssistant.handleFwdButton");
	this.setupList(new Date(tmwGL.dateStart.getTime() + (7*86400000)));
}


/* ===========================================================================
 * handleThisWeekBtn
 * ===========================================================================
 */
WeekViewAssistant.prototype.handleThisWeekBtn = function()
{
	this.setupList(new Date());
};

/* ===========================================================================
 * handleThisWeekBtn
 * ===========================================================================
 */
WeekViewAssistant.prototype.cbSelectDate = function(date)
{
	this.setupList(date);
};

/* ===========================================================================
 * handleSelectDateBtn
 * ===========================================================================
 */
WeekViewAssistant.prototype.handleSelectDateBtn = function()
{
	var date = new Date();
	
	// this.controller.stageController.pushScene('DatePicker');   
	// return;

	this.controller.showDialog({
		template: 'DatePicker/DatePicker-scene',
		assistant: new DatePickerAssistant
			(this, $L("Please select date"), 
			 date, this.cbSelectDate.bind(this))
	});

};


/* ===========================================================================
 * handleinBtn
 * ===========================================================================
 */
WeekViewAssistant.prototype.handleInBtn = function()
{
	if(tmwGL.inOut == 'out')
	{
		tmwGL.db.checkIn();
	}
	
	this.setupList(new Date());
};


/* ===========================================================================
 * handleOutBtn
 * ===========================================================================
 */
WeekViewAssistant.prototype.handleOutBtn = function()
{
	if(tmwGL.inOut == 'in')
	{
		tmwGL.db.checkOut(this.checkOutCB.bind(this));
	}

	this.setupList(new Date());
};

/* ===========================================================================
 * handleOutBtn
 * ===========================================================================
 */
WeekViewAssistant.prototype.checkOutCB = function(id, startTime, endTime, row)
{
	Mojo.Log.info("WeekViewAssistant.checkOutCB");
	
	var now = new Date();
	
	if((now.getDate()     != endTime.getDate()  ||
	    now.getMonth()    != endTime.getMonth() ||
	    now.getFullYear() != endTime.getFullYear()) &&
		prefsGL.nightShift == false)
	{
		var item = {
			'id':           id,
			"startDate":	startTime,
			"endDate":		endTime,
			"startTime": 	Mojo.Format.formatDate(startTime, {
				time: 'short',
				countryCode: ''
			}),
			"endTime": 		Mojo.Format.formatDate(endTime, {
				time: 'short',
				countryCode: ''
			}),
			"info":			"",
			"result": 		"",
			"categoryName":	row['v_projectName'],
			"categoryId":    row['i_tmw_projects_id'],
			"note":         row['v_note'],
			"rowClass": 	"",
			"inClass":      ""
		};

		this.controller.stageController.pushScene
			('TimeView', item, $L('Complete a check in in past'));   
	
	}

};


/* ===========================================================================
 * handlelistWeekEntry
 * ===========================================================================
 */
WeekViewAssistant.prototype.handleListWeekEntry = function(event)
{
	Mojo.Log.info("WeekViewAssistant.handleListWeekEntry");
	
	var date = event.item.minDate;
    Mojo.Log.info("Clicked on " + date);
	
	// Ignore sum line
    if (date != null) {
		this.controller.stageController.pushScene('DayView', date);
	}
	else {
		if (this.featureAvailable($L(""))) 
        {
            // First of month
			var startDate = new Date(tmwGL.dateStartOfWeek);
            var year = 1900 + startDate.getYear();
            var month = startDate.getMonth();
            var day = 1;
			startDate.setDate(day);
			startDate.setHours(0, 0, 0);
			
            if(month == 11)
            { 
                month = 0;
                year ++;
            }
            else
            {
                month ++;
            }
            
			// add 1 month - 1 millisec
			var endDate = new Date(year, month, day, 0, 0, 0);
			endDate = new Date(endDate.getTime() - 1);
            
			this.controller.stageController.pushScene
                ('Statistics', startDate, endDate, prefsGL.categoriesFilter, 'week');
		}
	}
};



/* ===========================================================================
 * deactivate
 * ===========================================================================
 */
WeekViewAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */

	Mojo.Log.info("WeekViewAssistant.deactivate");
	  	  
	clearInterval(this.interval);
		
};


/* ===========================================================================
 * cleanup
 * ===========================================================================
 */
WeekViewAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */

	Mojo.Log.info("WeekViewAssistant.cleanup");
	
	Mojo.Event.stopListening(this.controller.get('listWeek'),
		Mojo.Event.tap, 
		this.handleListWeekEntry);
					  
	tmwGL.prefs.putCookie();
};



