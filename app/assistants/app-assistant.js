/*****************************************************************************
 * TrackMyWork - App assistant
 * 
 * (c) 2009, 2010 by Klaus Reger <K.Reger@gmx.de>
 * 
 ****************************************************************************/


var tmwGL = 
{
	startOfWeek: 		'',
	dateStart:   		new Date(),
	dateStartOfWeek:  	null,
	nextCall:			null,
	betaAppUrl: "http://developer.palm.com/appredirect/?packageid=de.reger-clan.track-my-work-beta",
	freeAppUrl: "http://developer.palm.com/appredirect/?packageid=de.reger-clan.track-my-work-free",
	appUrl: 	"http://developer.palm.com/appredirect/?packageid=de.reger-clan.track-my-work",
	forumUrlDE:	"http://www.nexave.de/forum/37842-app-trackmywork.html",
    forumUrlEN: "http://forums.precentral.net/showthread.php?p=2237825",
	homeUrl:	$L("http://klausreger.wordpress.com/2011/04/20/webos-software/"),
	beta:		Mojo.appInfo.title.match("Beta"),
	free:	    Mojo.appInfo.title.match("Free"),
	full:       !Mojo.appInfo.title.match("Beta") && !Mojo.appInfo.title.match("Free")
};

SECS_PER_DAY  = 60*60*24;
MSECS_PER_DAY = SECS_PER_DAY * 1000;


/* ===========================================================================
 * Constructor
 * ===========================================================================
 */
function AppAssistant(controller) 
{
	Mojo.Log.info("AppAssistant");
	this.appController = controller;
}



/* ===========================================================================
 * setup
 * ===========================================================================
 */
AppAssistant.prototype.setup = function() 
{
	Mojo.Log.info("AppAssistant.setup");
	
	tmwGL.prefs = new tmwPrefs();
	tmwGL.db = new tmwDatabase(this.setup1.bind(this));	
	
	tmwGL.dateStart = startOfDay(tmwGL.dateStart);

	tmwGL.Metrix = new Metrix(); //Instantiate Metrix Library
	
	if(prefsGL.acceptMetrix)
	{                 
        tmwGL.Metrix.postDeviceData();  
	}
};


AppAssistant.prototype.setup1 = function() 
{
	Mojo.Log.info("AppAssistant.setup1");
	tmwGL.db.getCategoryData(this.categoryDataCB.bind(this));
};



var myApp = {};



myApp.isTouchPad = function()
{
    Mojo.Log.info("myApp.isTouchpad");
    
    var result = false;
    
    if(Mojo.Environment.DeviceInfo.modelNameAscii.indexOf("ouch")>-1) 
    {
        result = true;
    }

    if(Mojo.Environment.DeviceInfo.screenWidth==1024)
    { 
        result = true; 
    }

    if(Mojo.Environment.DeviceInfo.screenHeight==1024)
    { 
        result = true; 
    }

    return result;
};



myApp.isPre3 = function()
{
    Mojo.Log.info("myApp.isPre3");
    
    var result = false;

    if(Mojo.Environment.DeviceInfo.screenHeight == 800)
    { 
        result = true; 
    }

    if(Mojo.Environment.DeviceInfo.width == 480)
    { 
        result = true; 
    }

    return result;
};


myApp.addBackMenu = function(thisPI)
{
    Mojo.Log.info("myApp.addBackMenu");

    if(myApp.isTouchPad())
    {
        thisPI.controller.setupWidget(Mojo.Menu.commandMenu,
            thisPI.attributes = {
                spacerHeight: 0,
                menuClass: 'no-fade'
            },
            thisPI.commandMenuModel = {        
                visible: true,
                items: [
                    { icon: "back", command: "go-back"}
                ]
            }
        );   
    }
}


/* ===========================================================================
 * deactivate
 * ===========================================================================
 */
AppAssistant.prototype.deactivate = function() 
{
	Mojo.Log.info("AppAssistant.deactivate");
};



/* ===========================================================================
 * handleLaunch
 * ===========================================================================
 */
AppAssistant.prototype.handleLaunch = function(param) 
{
	// This function is required for a light-weight application to be
	// able to open a window of its own. It is not required if the app
	// is always launched from another application cross-app.
	Mojo.Log.info("AppAssistant.handleLaunch: " + param);
	
	this.launchParam = param;
	
	tmwGL.db.getCategoryData(this.categoryDataCB.bind(this));
};


/* ===========================================================================
 * handleLaunch
 * ===========================================================================
 */
AppAssistant.prototype.myHandleLaunch = function() 
{
	// This function is required for a light-weight application to be
	// able to open a window of its own. It is not required if the app
	// is always launched from another application cross-app.
	Mojo.Log.info("AppAssistant.myHandleLaunch");
	
	var param = this.launchParam;
	var appController = Mojo.Controller.getAppController();
	  
	// launch the touchstone theme
	if (param && param.dockMode && !tmwGL.free)
	{ 
	    Mojo.Log.info("DOCK MODE ===================================")
	    this.launchDockMode();
	    return;
	}
	
	// called by timer
	if (param !== undefined && param.wakeupCall !== undefined) 
	{
		var stageController = appController.getStageController("WeekView");
		var dashboardStageController = appController.getStageProxy("Dashboard");
	   
        Mojo.Controller.getAppController().playSoundNotification
            ("notifications", prefsGL.soundFilename);

        if(prefsGL.vibrate)
        {
            Mojo.Controller.getAppController().playSoundNotification(
                "vibrate",
                "notifications",
                2000);
        }                    

		// App already running
		if (stageController !== undefined)
		{
			this.openChildWindow(this.appController);
			timeoutStart();
		}
		else
		{	
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
		}
	}
	// called manually
	else
	{
		// Start timer
		this.openChildWindow(this.appController);
			
		if (prefsGL.autoCheckInOutMode != "NONE") 
		{
			timeoutStart();
		}
		else 
		{
			timeoutClear();
		}	
	}
};



/* ===========================================================================
 * openChildWindow
 * ===========================================================================
 */
AppAssistant.prototype.openChildWindow = function() 
{
    Mojo.Log.info("AppAssistant.openChildWindow");

    this.stageController = this.appController.getStageController('WeekView');
        
    if (this.stageController)
    {
        // app window is open, give it focus
        this.stageController.activate();
    } 
    else
    {
        // otherwise create the app window
        this.appController.createStageWithCallback(
            {
                name:       'WeekView', 
                lightweight: true   
            }, 
            this.pushTheScene.bind(this));      
    }
};



AppAssistant.prototype.launchDockMode = function(sceneParams) {
    var dockStage = this.controller.getStageController('DockMode');
    if (dockStage) {
        dockStage.window.focus();
    } else {
        var f = function(stageController) {
            stageController.pushScene('DockMode', {dockmode:true});
        }.bind(this);
        this.controller.createStageWithCallback({name: 'DockMode', lightweight: true}, f, "dockMode");  
    }
};


/* ===========================================================================
 * pushTheScene --- jump to first scene
 * ===========================================================================
 */
AppAssistant.prototype.pushTheScene = function(stageController) 
{
	Mojo.Log.info("AppAssistant.pushTheScene");
	stageController.pushScene('WeekView');
};




/* ===========================================================================
 * categoryDataCB
 * ===========================================================================
 */
AppAssistant.prototype.categoryDataCB = function(result)
{
	Mojo.Log.info("Appssistant.categoryDataCB");
	this.myHandleLaunch();
};




