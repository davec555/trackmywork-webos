/*****************************************************************************
 * TrackMyWork - Daily overview
 * 
 * (c) 2009, 2010 by Klaus Reger <K.Reger@gmx.de>
 * 
 ****************************************************************************/


function DayViewAssistant(dateFromPusher) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */

	Mojo.Log.info("DayViewAssistant:" + dateFromPusher);
	this.date = dateFromPusher;
}
 
 
 
 
/* ===========================================================================
 * setup
 * ===========================================================================
 */
DayViewAssistant.prototype.setup = function () 
{
	Mojo.Log.info("DayViewAssistant.setup");
	/* this function is for setup tasks that have to happen when the scene is first created */
Mojo.Log.info(1);	
    this.appMenuModel = {
        items: []
    };
    	      
    // this.commandMenuModel.items = new Array();
Mojo.Log.info(2);

    if (myApp.isTouchPad()) 
    {
        this.commandMenuModel = {
            items: [{
                icon: "back",
                command: "go-back"
            }, 
            {}, 
            {
                items: [{
                    width: 60,
                    icon: 'img-out',
                    command: 'out'
                }, {
                    width: 60,
                    icon: 'img-in',
                    command: 'in'
                }]
            },
            {}]
        };
    }
    else
    {
        this.commandMenuModel = 
        {
            items: [
            {
                items: [{
                    width: 60,
                    icon: 'img-out',
                    command: 'out'
                }, {
                    width: 60,
                    icon: 'img-in',
                    command: 'in'
                }]
            }]
        };
    }    
        
        
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
    this.controller.setupWidget(Mojo.Menu.commandMenu, 
        this.cmAttributes = {
            menuClass: 'no-fade'
        }, this.commandMenuModel);

   	this.controller.window.PalmSystem.setWindowOrientation("up");

	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
				
	// Set up a few models so we can test setting the widget model:
	this.listModel = 
	{
		listTitle: "",
        items: []
	};
		
	// this.setupList(tmwGL.dateStart);
	
 	// Set up the attributes & model for the List widget:
	this.controller.setupWidget
		('listDay', {
			itemTemplate:'DayView/DayView-listitem', 
		  	listTemplate:'DayView/DayView-listcontainer',
            addItemLabel: $L('Add ...'),
            swipeToDelete: true
		 },
		 this.listModel);
		

	/* add event handlers to listen to events from widgets */
	this.handleListDayEntry = this.handleListDayEntry.bind(this);
	Mojo.Event.listen(this.controller.get('listDay'),
					  Mojo.Event.listTap, 
					  this.handleListDayEntry);
					  
	this.handleAddDayEntry = this.handleAddDayEntry.bind(this);
	Mojo.Event.listen(this.controller.get('listDay'),
					  Mojo.Event.listAdd, 
					  this.handleAddDayEntry.bind(this));
					  
	this.handleDeleteDayEntry = this.handleDeleteDayEntry.bind(this);
	Mojo.Event.listen(this.controller.get('listDay'),
					  Mojo.Event.listDelete, 
					  this.handleDeleteDayEntry);

    var todayWidth = 200;

    if(myApp.isTouchPad())
    {   
        var deviceInfo = Mojo.Environment.DeviceInfo;       
        todayWidth = deviceInfo.screenWidth * 0.55;
    }
   
 	this.viewMenuModel = 
	{ 
		items: 
		[
			{
				items:
				[
                    {},
					{
						label: $L('Back'), 
						icon:'back', 
						command:'back-day'
					},
			 		{
						label: $L('Today'), 
						width: todayWidth, 
						command:'thisDay'
					},
			 		{
						label: $L('Forward'), 
						icon:'forward', 
						command:'fwd-day'
					},
                    {}
				]
			}
		]
	};
		
	this.controller.setupWidget(Mojo.Menu.viewMenu, 
        this.cmAttributes = {
            menuClass: 'no-fade'
        }, 
        this.viewMenuModel);
   
};


/* ===========================================================================
 * ativate
 * ===========================================================================
 */
DayViewAssistant.prototype.activate = function(event) 
{
    Mojo.Log.info("DayViewAssistant.activate");

    this.setupList(this.date); 
        
    if(myApp.isTouchPad())
    {
        this.controller.get("listDay").addClassName("touchpad-list");
    }

    tmwGL.db.getInOrOut(this.inOrOutCB.bind(this));
};



/* ===========================================================================
 * setupList
 * ===========================================================================
 */
DayViewAssistant.prototype.setupList = function(datePI)
{
	Mojo.Log.info("DayViewAssistant.setupList");

    // this.controller.get('areaInfo').update(new Date());

    var myDayList = [];
		
	this.listModel.items = [];
	
	var arrWeekdays = Mojo.Locale.getDayNames();
	
	//update the list widget
	this.listModel.listTitle = $L("Day overview for ") +
		arrWeekdays[datePI.getDay()].substr(0, 2) + ", " +
		Mojo.Format.formatDate(datePI, {
			date: 'short',
			countryCode: ''
		});		

	tmwGL.db.getDayData(datePI, 
		this.DayDataCB.bind(this));
}


/* ===========================================================================
 * inOrOutCB
 * ===========================================================================
 */
DayViewAssistant.prototype.inOrOutCB = function()
{
    Mojo.Log.info("DayViewAssistant.inOrOutCB: " + tmwGL.inOut);
    
    ind = (myApp.isTouchPad()? 2: 0);
    this.commandMenuModel.items[ind].toggleCmd = tmwGL.inOut;
    this.controller.modelChanged(this.commandMenuModel, this);  
}



/* ===========================================================================
 * DayDataCB
 * ===========================================================================
 */
DayViewAssistant.prototype.DayDataCB = function(dateStartPI, result)
{
	Mojo.Log.info("DayViewAssistant.DayDataCB");
	Mojo.Log.info("Result:" + Object.toJSON(result.rows));
    Mojo.Log.info("Result:" + Object.toJSON(result.rows.item[0]));

    this.listModel.items = [];
	var sumDuration = 0;
	for (var i = 0; i < result.rows.length; i++) {
		var row = result.rows.item(i);
		
		Mojo.Log.info("row = " + Object.toJSON(row));
		// Mojo.Log.info("arrWeekdays = " + Object.toJSON(arrWeekdays));
		var ind  = row.i_tmw_times_id;
		var minTime = new Date(row['i_startUnixtime'] * 1000);
		var maxTime = new Date(row['i_endUnixtime'] * 1000);
		
		// var dateStr = arrWeekdays[minTime.getDay()].substr(0, 2) + " " + minTime.getDate();
		
		var durationInSec = ((maxTime.getTime() - minTime.getTime()) / 1000);
		var durationInMin = parseInt(durationInSec / 60, 10);
		var durationInHr = parseInt(durationInMin / 60, 10);
		
        
        sumDuration += durationInSec;
        
		//	Mojo.Log.info("sec: " + durationInSec + " min: " + durationInMin + " hr: " + durationInHr);
			
		var rowClass = "";
		var inClass = "";
		
		if(row.t_end == null)
		{
			inClass = "in";
		}
		var info = row['v_projectName'];
		
		if(row['v_note'] != null && row['v_note'] != "")
		{
			info = info + " / " + row['v_note'];
		}
		
		info = info.replace(/\n/g, " ");
		if(info.length > 50)
		{
			info = info.substr(0, 45) + "...";
		}
		
		this.listModel.items.push({
			'id':           ind,
			"startDate":	minTime,
			"endDate":		maxTime,
			"startTime": 	Mojo.Format.formatDate(minTime, {
				time: 'short',
				countryCode: ''
			}),
			"endTime": 		Mojo.Format.formatDate(maxTime, {
				time: 'short',
				countryCode: ''
			}),
			"info":			info,
			"result": 		parseInt(durationInHr) + ":" + 
				((durationInMin%60) < 10? "0": "") + (durationInMin % 60),
			"categoryName":	row['v_projectName'],
			"categoryId":    row['i_tmw_projects_id'],
			"note":         row['v_note'],
			"rowClass": 	rowClass,
			"inClass":      inClass
		});
			
	}

    // Summary for this day
    this.listModel.items.push({
        'id':           0,
        "startDate":    "",
        "endDate":      "",
        "startTime":    $L('Sum'),
        "endTime":      "-",
        "info":         "",
        "result":       durationToHHMM(sumDuration),
        "categoryName": "",
        "categoryId":   "",
        "note":         "",
        "rowClass":     rowClass,
        "inClass":      inClass
    });
		
	var today = dateToYYYYMMDD(new Date(), '-');
	
	this.controller.modelChanged(this.listModel, this);	
};


/* ===========================================================================
 * handleCommand
 * ===========================================================================
 */
DayViewAssistant.prototype.handleCommand = function(event) 
{
	if(event.type == Mojo.Event.command) 
    {
        Mojo.Log.info("event.command="+event.command);
		switch(event.command)
		{
            case 'go-back':
                this.controller.stageController.popScene();
                break;
			case 'back-day':
				this.handleBackBtn();
				break;
			case 'thisDay':
				this.handleThisDayBtn();
				break;
			case 'fwd-day':
				this.handleFwdBtn();
				break;
			// these are built-in commands. we haven't enabled any of them, but
			// they are listed here as part of the boilerplate, to be enabled later if needed
			case 'do-help':
				var url = 'http://reger-clan.de/';
				
				if(Mojo.Locale.getCurrentLocale().match("de.*"))
				{
					url = url + 'de/WebOS-TrackMyWork-Tagesuebersicht.html';
				}
				else
				{
					url = url + 'en/WebOS-TrackMyWork-DailyOverview.html';
				}
				
				this.controller.serviceRequest('palm://com.palm.applicationManager', 
				{ 
					method:	'open',
					parameters: { target: url}
				});
				break;	
            
            case 'in':
                if(tmwGL.inOut == 'out')
                {
                    tmwGL.db.checkIn();
                }
                
                this.setupList(new Date());
                break;
            
            case 'out':
                if(tmwGL.inOut == 'in')
                {
                    tmwGL.db.checkOut();
                }
            
                this.setupList(new Date());
                break;
			
			default:
				//Mojo.Controller.errorDialog("Got command " + event.command);
			break;
		}
	}
}




/* ===========================================================================
 * handleBackBtn
 * ===========================================================================
 */
DayViewAssistant.prototype.handleBackBtn = function()
{
	this.date = new Date(this.date.getTime() - (86400000));
	this.setupList(this.date);
};



/* ===========================================================================
 * handleFwdButton
 * ===========================================================================
 */
DayViewAssistant.prototype.handleFwdBtn = function()
{
	this.date = new Date(this.date.getTime() + (86400000));
	this.setupList(this.date);
}


/* ===========================================================================
 * handleThisWeekBtn
 * ===========================================================================
 */
DayViewAssistant.prototype.handleThisDayBtn = function()
{
	this.date = new Date();
	this.setupList(this.date);
};

/* ===========================================================================
 * handlelistDayEntry
 * ===========================================================================
 */
DayViewAssistant.prototype.handleListDayEntry = function(event)
{
	Mojo.Log.info("DayViewAssistant.handleListDayEntry");
	
	var dateStr = event.item.date;
    Mojo.Log.info("Clicked on " + Object.toJSON(event.item));

    if(event.item.id != 0)
    {
    	this.controller.stageController.pushScene
            ('TimeView', event.item);   
    }
   
    this.setupList(this.date);
};


/* ===========================================================================
 * handleDeleteDayEntry
 * ===========================================================================
 */
DayViewAssistant.prototype.handleDeleteDayEntry = function(event)
{
	Mojo.Log.info("DayViewAssistant.handleDeleteDayEntry");
	
	var id = event.item.id;
    Mojo.Log.info("Swiped on " + Object.toJSON(event.item));
    
    /*
    // FIXME: undefined
    Mojo.Log.info("List model: " + Object.toJSON(this.listModel));
	
    for (var i = 0; i < this.listModel.items.length; i++) 
    {
        var row = this.listModel.items[i];
        Mojo.Log.info("id = " + row.id);
    }
    */

	tmwGL.db.remove(id);
    
	// when deleting open entry, check out also
	if(event.item.inClass == "in")
	{
		tmwGL.inOut = 'out';
	}    	
        
    this.setupList(this.date);

};



/* ===========================================================================
 * handleAddDayEntry
 * ===========================================================================
 */
DayViewAssistant.prototype.handleAddDayEntry = function(event)
{
	Mojo.Log.info("DayViewAssistant.handleAddDayEntry");
	var start = new Date(this.date);
	var end   = new Date(this.date);
	
	start.setHours(prefsGL.standardDayBegin.getHours(), 
		prefsGL.standardDayBegin.getMinutes(),
		0, 0);
	
	end.setHours(prefsGL.standardDayEnd.getHours(), 
		prefsGL.standardDayEnd.getMinutes(),
		0, 0);
	
	item = {
			'id':           0,
			"startDate":	start,
			"endDate":		end,
			"startTime": 	Mojo.Format.formatDate(start, {
				time: 'short',
				countryCode: ''
			}),
			"endTime": 		Mojo.Format.formatDate(end, {
				time: 'short',
				countryCode: ''
			}),
			"result": 		"0:00",
			"categoryName":	prefsGL.defaultCategoryName,
			"categoryId":    prefsGL.defaultCategoryId,
			"note":         "",
			"rowClass": 	"",
			"inClass":      ""
		};
	
    this.controller.stageController.pushScene('TimeView', item);   
    
};


/* ===========================================================================
 * deactivate
 * ===========================================================================
 */
DayViewAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};


/* ===========================================================================
 * cleanup
 * ===========================================================================
 */
DayViewAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	  
	Mojo.Event.stopListening(this.controller.get('listDay'),
		Mojo.Event.listTap, 
		 this.handleListDayEntry);
					  
	this.handleListDayEntry = this.handleAddDayEntry.bind(this);
	Mojo.Event.stopListening(this.controller.get('listDay'),
		Mojo.Event.listAdd, 
		this.handleAddDayEntry.bind(this));
					  
	this.handleListDayEntry = this.handleDeleteDayEntry.bind(this);
	Mojo.Event.stopListening(this.controller.get('listDay'),
		Mojo.Event.listDelete, 
		this.handleDeleteDayEntry);

};
