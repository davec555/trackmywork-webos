/*****************************************************************************
 * TrackMyWork - Statistics
 * 
 * (c) 2009, 2010 by Klaus Reger <K.Reger@gmx.de>
 * 
 ****************************************************************************/


function StatisticsAssistant(startDatePI, endDatePI, 
                             categoriesFilterPI, 
                             intervalPI) 
{
	Mojo.Log.info("StatisticsAssistant");

	this.endDate = ((endDatePI == undefined)? new Date(): endDatePI);

	if(startDatePI == undefined)
	{ 
		// set to 1st jan of this year
		this.startDate = new Date(this.endDate)
		this.startDate.setHours(0,0,0,0);
		this.startDate.setMonth(0);
		this.startDate.setDate(1);
	}
	else
	{
		this.startDate = startDatePI;
	}
	
	this.interval = (intervalPI == undefined)? 'month': intervalPI;
    
	this.categoryIdFilter = (categoriesFilterPI == undefined)?
        prefsGL.categoriesFilter: categoriesFilterPI;

	Mojo.Log.info("StatisticAssistant: " + 
                  this.startDate + " - "+ this.endDate + ": "+ 
                  this.interval);
	
}

StatisticsAssistant.prototype.setup = function() {
	Mojo.Log.info("StatisticsAssistant.setup");
		
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
                    // label: $L("Draw graph"),
                    icon: "img-graph",
                    command: "draw-graph"
                },
                {
                    // label: $L("Send"),
                    icon: "send",
                    command: "send-mail"
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
                    // label: $L("Draw graph"),
                    icon: "img-graph",
                    command: "draw-graph"
                },
                {
                    // label: $L("Send"),
                    icon: "send",
                    command: "send-mail"
                }]
            }]
        };
    }    
        
    
    this.controller.setupWidget(Mojo.Menu.commandMenu,
        this.cmAttributes = {
            spacerHeight: 0,
            menuClass: 'no-fade'
        },
        this.commandMenuModel);
    
	this.controller.setupWidget(Mojo.Menu.appMenu, 
		{omitDefaultItems: true}, this.appMenuModel);
        
	/* setup widgets here */
	
	this.controller.get("title").update($L("Selection criteria"));
	
    this.controller.setupWidget("startDate",
        this.attributes = {
            label: 			$L('Start date'),
			labelPlacement:	Mojo.Widget.labelPlacementRight,
            modelProperty: 'time' 
        },
        this.model = {
            time: this.startDate
        });
		
    this.controller.setupWidget("endDate",
        this.attributes = {
            label: 			$L('End date'),
			labelPlacement:	Mojo.Widget.labelPlacementRight,
            modelProperty: 'time' 
        },
        this.model = {
            time: this.endDate
        });
				
	// Set up a few models so we can test setting the widget model:
	this.listModel = 
	{
		listTitle: "",
        items: []
	};
		
	// --- interval --------------------------------------
	this.intervals = {
        'single':   $L("Single entries"),
        'day':      $L("Daily"),
		'week': 	$L("Weekly"),
		'month':	$L("Monthly"),
		'year':		$L("Yearly")
	};
	
	this.intervalList = [];
	
	for (var i in this.intervals)
	{
		this.intervalList.push({
			'label':	this.intervals[i],
			'value':	i
		});
	};
	
	this.controller.setupWidget('interval', 
	{
		label: 			$L('Interval'),
		labelPlacement:	Mojo.Widget.labelPlacementRight,
		choices: 		this.intervalList 
	},
	this.selectorsModel = 
	{
		value: this.interval
	});
	
		
	// --- workdays --------------------------------------
	this.workdays = {
		5: 	$L("Mon - Fri"),
		6: 	$L("Mon - Sat"),
		7:	$L("Mon - Sun")
	};
	
	this.workdayList = [];
	
	for (var i in this.workdays)
	{
		this.workdayList.push({
			'label':	this.workdays[i],
			'value':	i
		});
	};
	
	this.controller.setupWidget('workdays', 
	{
		label: 			$L('Workdays'),
		labelPlacement:	Mojo.Widget.labelPlacementRight,
		choices: 		this.workdayList
	}, 
	this.selectorsModel = 
	{
		value: prefsGL.workdays
	});
	
	
    // --- categories --------------------------------------
    this.controller.setupWidget('categories', 
    {
        label:          $L('Categories'),
        labelPlacement: Mojo.Widget.labelPlacementRight,
        choices:        []
    }, 
    this.categoriesModel = 
    {
        value: ""
    });
    
    this.controller.get("categoriesLabel").
        update(getCategoryNames(this.categoryIdFilter));
		
 	// Set up the attributes & model for the List widget:
	this.controller.setupWidget
		('listStatistics', 
 	     {itemTemplate:'Statistics/Statistics-listitem', 
		  listTemplate:'Statistics/Statistics-listcontainer'},
		  this.listModel);

	/* add event handlers to listen to events from widgets */
	this.handleListStatistics = this.handleListStatistics.bind(this);
	Mojo.Event.listen(this.controller.get('listStatistics'),
					  Mojo.Event.listTap, 
					  this.handleListStatistics);

	Mojo.Event.listen(this.controller.get('startDate'),
					  Mojo.Event.propertyChange, 
					  this.handleStartDate.bind(this));

	Mojo.Event.listen(this.controller.get('endDate'),
					  Mojo.Event.propertyChange, 
					  this.handleEndDate.bind(this));

	Mojo.Event.listen(this.controller.get('interval'),
					  Mojo.Event.propertyChange, 
					  this.handleInterval.bind(this));

	Mojo.Event.listen(this.controller.get('workdays'),
					  Mojo.Event.propertyChange, 
					  this.handleWorkdays.bind(this));

    Mojo.Event.listen(this.controller.get('categories'),
                      Mojo.Event.tap, 
                      this.cbTapCategories.bind(this));
    Mojo.Event.listen(this.controller.get('categories_row'),
                      Mojo.Event.tap, 
                      this.cbTapCategories.bind(this));
};


StatisticsAssistant.prototype.activate = function(event) {
	Mojo.Log.info("StatisticsAssistant.activate");
	  
    if(myApp.isTouchPad())
    { 
        this.controller.get('groupSetup').addClassName("touchpad-group");   
        this.controller.get('listStatistics').addClassName("touchpad-list");     
    }
	this.loadData();
};


/* ===========================================================================
 * handleCommand
 * ===========================================================================
 */
StatisticsAssistant.prototype.handleCommand = function(event) 
{
	if(event.type == Mojo.Event.command) 
	{
		switch(event.command)
		{
            case 'draw-graph':
                this.cbStatGraphBtn();
                break;
                
            case 'send-mail':
                this.cbStatSendBtn();
                break;
            case 'go-back':
                this.controller.stageController.popScene();
                break;
			// these are built-in commands. we haven't enabled any of them, but
			// they are listed here as part of the boilerplate, to be enabled later if needed
			case 'do-help':
				var url = 'http://reger-clan.de/';
				
				if(Mojo.Locale.getCurrentLocale().match("de.*"))
				{
					url = url + 'de/WebOS-TrackMyWork-Statistik.html';
				}
				else
				{
					url = url + 'en/WebOS-TrackMyWork-Statistics.html';
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



/* ===========================================================================
 * handle tapping of categories
 * ===========================================================================
 */
StatisticsAssistant.prototype.cbTapCategories = function(event)
{
    Mojo.Log.info("StatisticAssistant.cbTapCategories");
    
    this.controller.stageController.pushScene('CategorySelect', 
                this.cbSetCategoriesFilter.bind(this),
                this.categoryIdFilter);   
    
};



/* ===========================================================================
 * setFilterCB
 * ===========================================================================
 */
StatisticsAssistant.prototype.cbSetCategoriesFilter = function(idListPI)
{
    Mojo.Log.info("StatisticAssistant.cbSetCategoriesFilter: " + idListPI);
        
    this.categoryIdFilter = idListPI;
    this.controller.get("categoriesLabel").
        update(getCategoryNames(this.categoryIdFilter));
};





/* ===========================================================================
 * handlelistStatistics
 * ===========================================================================
 */
StatisticsAssistant.prototype.handleListStatistics = function(event)
{
	Mojo.Log.info("StatisticsAssistant.handleListStatistics: ");
	
	var interval = 'single';
	
	if (this.interval == "year")
	{
		interval = "month";	
	}
	else if (this.interval == "month")
	{
		interval = "week";	
	}
    else if (this.interval == "week")
    {
        interval = "day";  
    }
	else 
	{
		interval = "single";	
	}

	var startDate = new Date(event.item.dateMin);
    
	// Calc start of next day
	var endDate = new Date(event.item.dateMax);
	
	if (this.interval == "day" || this.interval == "single") {
		if (event.item.dateStr != $L("Sum")) {
			this.controller.stageController.pushScene('DayView', startDate);
		}
	}
	else {
		this.controller.stageController.pushScene
            ('Statistics', startDate, endDate, this.categoryIdFilter, interval);
	}
	
};


/* ===========================================================================
 * handleStartDate
 * ===========================================================================
 */
StatisticsAssistant.prototype.handleStartDate = function(event)
{
	Mojo.Log.info("StatisticsAssistant.handleStartDate");
	this.startDate = event.value;
	this.loadData();
};


/* ===========================================================================
 * handleEndDate
 * ===========================================================================
 */
StatisticsAssistant.prototype.handleEndDate = function(event)
{
	Mojo.Log.info("StatisticsAssistant.handleEndDay");
	this.endDate = event.value;
	this.loadData();
};

/* ===========================================================================
 * handleInterval
 * ===========================================================================
 */
StatisticsAssistant.prototype.handleInterval = function(event)
{
	Mojo.Log.info("StatisticsAssistant.handleInterval"+Object.toJSON(event));
	this.interval = event.value;
	this.loadData();
};



/* ===========================================================================
 * handleWorkdays
 * ===========================================================================
 */
StatisticsAssistant.prototype.handleWorkdays = function(event)
{
	Mojo.Log.info("StatisticsAssistant.handleWorkdays"+Object.toJSON(event));
	prefsGL.workdays = event.value;
	this.loadData();
};




/* ===========================================================================
 * loadData
 * ===========================================================================
 */
StatisticsAssistant.prototype.getTitle = function(longFormat)
{
    Mojo.Log.info("StatisticsAssistant.getTitle:");
    var result = this.intervals[this.interval] +
	 	" " +
		Mojo.Format.formatDate(this.startDate, {
			date: 'short',
			countryCode: ''
		}) + " - " +
		Mojo.Format.formatDate(this.endDate, {
			date: 'short',
			countryCode: ''
		});		
        
    if(longFormat == true)
    {
        result = result + " " + 
            ((this.categoryIdFilter.split(",").length == 1)?
             $L("for category"):
             $L("for categories")) + ": " +
             getCategoryNames(this.categoryIdFilter); 
    }    
        
    return result;
}

/* ===========================================================================
 * loadData
 * ===========================================================================
 */
StatisticsAssistant.prototype.loadData = function()
{
	Mojo.Log.info("StatisticsAssistant.loadData:");
	
	this.listModel.items = [];
	
	//update the list widget
	this.listModel.listTitle = this.getTitle(false);

	tmwGL.db.getStatistics(this.startDate, 
		this.endDate, 
		this.interval, 
        this.categoryIdFilter,
		this.dataCB.bind(this));
}


/* ===========================================================================
 * Draw graphic
 * ===========================================================================
 */
StatisticsAssistant.prototype.cbStatGraphBtn = function()
{
	Mojo.Log.info("StatisticsAssistant.cbStatGraphButton");
	
	this.controller.stageController.pushScene
		('StatGraph', this.listModel.listTitle, this.listModel.items);   
}


/* ===========================================================================
 * Draw graphic
 * ===========================================================================
 */
StatisticsAssistant.prototype.cbStatSendBtn = function()
{
    Mojo.Log.info("StatisticsAssistant.cbStatSendButton");
    
    var title = this.getTitle(true);

    var text = "<b>" + title + "</b>" +
        '<style type="text/css">' +
        'td.d { border:0px solid gray; text-align: right; background-color:#EEEEEE; padding:4px; margin:10px; }' +
        'td.h { border:0px solid gray; font-weight:bold; text-align: center; background-color:#E0E0E0; padding:4px; margin:10px; }' +
        'td.f { border:0px solid gray; font-weight:bold; text-align: right; background-color:#E0E0E0; padding:4px; margin:10px; }' +
        '</style>';
        
    text = text + '<table style="border:1px solid black">';
        
    for (var i = 0; i < this.listModel.items.length; i++) 
    {
        var row = this.listModel.items[i];
        var cl = "d";
 
        // Make header and footer bold
        if(i == 0)
        {
            cl = "h";
        }
        
        if(i == this.listModel.items.length - 1)
        {
            cl = "f";
        }
        
        text = text + '<tr class="'+cl+'">';
        text = text + '<td class="'+cl+'">' + row.dateStr + '</td>';
        text = text + '<td class="'+cl+'">' + row.result + '</td>';
        text = text + '<td class="'+cl+'">' + row.days + '</td>';
        text = text + '<td class="'+cl+'">' + row.avgPerDay + '</td>';
        text = text + '<td class="'+cl+'">' + row.avgPerWeek + '</td>';
        text = text + '</tr>';
        
        Mojo.Log.info("Note: <" + row.note + ">")
        
        if(row.note != '' && row.note != undefined)
        {
            text = text + '<tr><td colspan="5">'+row.note+'</td></tr>';
        }
    }    

    text = text + '</table>';
        
    this.controller.serviceRequest('palm://com.palm.applicationManager', 
    {
        method:     'open',
        parameters: 
        {
            id:     'com.palm.app.email',
            params: {
                summary:    $L("TrackMyWork - " + title),
                text:       text
            }
        }
    });     

}



/* ===========================================================================
 * weekDataCB
 * ===========================================================================
 */
StatisticsAssistant.prototype.dataCB = function(dateStartPI, dateEndPI, interval, result)
{
	Mojo.Log.info("StatisticsAssistant.weekDataCB " + dateStartPI + " - "+ dateEndPI);

	var getWeek = function(unixtime)
	{
		return Math.floor(((unixtime / 86400) + 4 - prefsGL.startOfWeekDay ) / 7);
	}

    this.listModel.items = [];
    var data = new Array();
	
	this.listModel.items.push({
		'date':         	"",
		'dateStr': 			$L("Date"),
		"result": 			$L("Sum."),
		"days":				$L("D."),
		"avgPerDay":		$L("Avg Day"),
		"avgPerWeek":		$L("Avg Week"),
		"categoryName":  	"", // $L("category"),
		"orientationClass": this.orientationClass
	});	
	
	var writeData        = false;
	var sumUp            = false;
	var year             = 0;
	var month            = 0;
	var dayOfYear        = 0;
	var dayOfWeek     	 = 0;
	var cntDays     	 = 0;
	var dateMin          = null;
	var dateMax          = null;
	var durationInSec    = 0;
	var sumDurationInSec = 0;
	var allDurationInSec = 0;
	var allCntDays     	 = 0;
    var note             = "";
	var date             = null;
	
	for (var i = 0; i < result.rows.length; i++) {
		var row = result.rows.item(i);

		date          = new Date(row['i_unixtime'] * 1000);
		durationInSec = row['i_duration'];
		dateAsStr     = row['d_date'];
		year          = row['i_year'];
		month         = row['i_month'];
		dayOfYear     = row['i_day_of_year'];
        dayOfWeek     = row['i_day_of_week'];   
        note          = row['v_note'];   
		nrOfWeek      = getWeek(row['i_unixtime']);
Mojo.Log.info("NOTE:"+note);
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
		
		if(dateMin == null)
		{
			dateMin = new Date(row['i_unixtime'] * 1000);
		}
		
		// Last record?
		if(i == result.rows.length -1)
		{
			writeData = true;
		}
		else 
		{
			var nextRow = result.rows.item(i+1);
			
			if (this.interval == "year") {
				if (row['i_year'] != nextRow['i_year']) {
					writeData = true;
				}
			}
			else if (this.interval == "month") {
				if (row['i_year'] != nextRow['i_year'] ||
					row['i_month'] != nextRow['i_month']) {
					writeData = true;
				}
			}
			else if (this.interval == "week") 
			{
				if (getWeek(row['i_unixtime']) != 
				    getWeek(nextRow['i_unixtime'])) 
				{
					writeData = true;
				}
			}
			else {
				writeData = true;	
			}
		}
		
		sumDurationInSec += durationInSec;
		allDurationInSec += durationInSec;
		
		
		if ((dayOfWeek > 0 && dayOfWeek < 6 && prefsGL.workdays == 5) ||
			(dayOfWeek > 0 && dayOfWeek <= 6 && prefsGL.workdays == 6) ||
			(dayOfWeek >= 0 && dayOfWeek <= 6 && prefsGL.workdays == 7))
	  	{
			cntDays++;
			allCntDays++;
		}

		if (writeData) {
			// Set the time to end of day
			dateMax = new Date(row['i_unixtime'] * 1000);
			dateMax.setHours(23,59,59,999);
			
			this.addToList({
				'dateMin': dateMin,
				'dateMax': dateMax,
				'dateStr': Mojo.Format.formatDate(dateMin, {
					date: 'short',
					countryCode: ''
				}),
				"sumDurationInSec": sumDurationInSec,
				"cntDays": cntDays,
				"categoryName": "",
				"orientationClass": this.orientationClass,
                "note": note
			})
		
			cntDays          = 0;
			sumDurationInSec = 0;
			dateMin          = null;
			writeData        = false;
		}
	}

	this.addToList({
		'dateMin': 			dateStartPI,
		'dateMax': 			new Date(dateEndPI.getTime() - 86400000),
		'dateStr': 			$L("Sum"),
		"sumDurationInSec": allDurationInSec,
		"cntDays": 			allCntDays,
		"categoryName": 	"",
		"orientationClass": this.orientationClass
	})
	
	this.controller.modelChanged(this.listModel, this);	
};



/* ===========================================================================
 * addToList
 * ===========================================================================
 */
StatisticsAssistant.prototype.addToList = function(rec){
	Mojo.Log.info("StatisticsAssistant.addToList " + 
		rec.dateMin + "-" + rec.dateMax);
	
	var cntDays = rec.cntDays? rec.cntDays: 1;
	
	var avgPerDayStr  = "-";
	var avgPerWeekStr = "-";
	var cntDays       = "-";	
	
	if(rec.cntDays)
	{
		cntDays = rec.cntDays;
		var avgPerDay = rec.sumDurationInSec / cntDays;
		var avgPerWeek = avgPerDay * prefsGL.workdays;
		
		avgPerDayStr  = durationToHHMM(avgPerDay);
		avgPerWeekStr = durationToHHMM(avgPerWeek);
	}
	
	this.listModel.items.push({
		'dateMin': 			rec.dateMin,
		'dateMax': 			rec.dateMax,
		'dateStr': 			rec.dateStr,
		'durationInSec':	rec.sumDurationInSec,
		"result": 			durationToHHMM(rec.sumDurationInSec),
		"days": 			cntDays,
		"avgPerDay": 		avgPerDayStr,
		"avgPerWeek": 		avgPerWeekStr,
		"categoryName": 	rec.categoryName,
        "note":             rec.note,
		"orientationClass": this.orientationClass
	});
	
}


StatisticsAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

StatisticsAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	  
	Mojo.Event.stopListening(this.controller.get('listStatistics'),
						     Mojo.Event.listTap, 
					         this.handleListStatistics);

	Mojo.Event.stopListening(this.controller.get('startDate'),
		  				     Mojo.Event.propertyChange, 
					  	     this.handleStartDate.bind(this));

	Mojo.Event.stopListening(this.controller.get('endDate'),
					  		 Mojo.Event.propertyChange, 
					  		 this.handleEndDate.bind(this));

	Mojo.Event.stopListening(this.controller.get('interval'),
					  		 Mojo.Event.propertyChange, 
					  		 this.handleInterval.bind(this));

	Mojo.Event.stopListening(this.controller.get('workdays'),
					  		 Mojo.Event.propertyChange, 
					  		 this.handleWorkdays.bind(this));
	  
};
