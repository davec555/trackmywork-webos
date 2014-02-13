/*****************************************************************************
 * TrackMyWork - Dashboard assistant
 * 
 * (c) 2009, 2011 by Klaus Reger <K.Reger@gmx.de>
 * 
 ****************************************************************************/

function DashboardAssistant() {

}

DashboardAssistant.prototype.setup = function() {
    Mojo.Log.info("DashboardAssistant.setup");
	/* setup widgets here */
	
	this.displayDashboard(this.title, this.message, this.count);
    this.switchHandler = this.launchMain.bindAsEventListener(this);
   
	/* add event handlers to listen to events from widgets */
    this.controller.listen("dashboard-icon", Mojo.Event.tap, 
        this.switchHandler);
    this.controller.listen("dashboard-checkinout", 
        Mojo.Event.tap, this.inOutHandler.bind(this));
	
    this.stageDocument = this.controller.stageController.document;
    this.activateStageHandler = this.activateStage.bindAsEventListener(this);
    
	Mojo.Event.listen(this.stageDocument, Mojo.Event.stageActivate,
        this.activateStageHandler);
     
	this.deactivateStageHandler = this.deactivateStage.bindAsEventListener(this);
    Mojo.Event.listen(this.stageDocument, Mojo.Event.stageDeactivate,
        this.deactivateStageHandler);	
};



DashboardAssistant.prototype.activate = function(event) {
    Mojo.Log.info("DashboardAssistant.activate");

	tmwGL.db.getInOrOut(this.inOrOutCB.bind(this));
	timeoutStart();
};

DashboardAssistant.prototype.deactivate = function(event) {
    Mojo.Log.info("DashboardAssistant.deactivate");
};

DashboardAssistant.prototype.cleanup = function(event) {
    Mojo.Log.info("DashboardAssistant.cleanup");
	  
    // Release event listeners
    Mojo.Event.stopListening(this.stageDocument, Mojo.Event.stageActivate,
        this.activateStageHandler);
    Mojo.Event.stopListening(this.stageDocument, Mojo.Event.stageDeactivate,
        this.deactivateStageHandler);
		
	timeoutStart();
};


DashboardAssistant.prototype.activateStage = function() {
    Mojo.Log.info("DashboardAssistant.activateStage");

	tmwGL.db.getInOrOut(this.inOrOutCB.bind(this));

    var appController = Mojo.Controller.getAppController();
	this.stageController = appController.getStageController('WeekView');
	
	if (this.stageController)
	{
		// close stage
		this.stageController.window.close();
		this.stageController.deactivate();
	} 
};



DashboardAssistant.prototype.setMessage = function(line1, line2) {
    Mojo.Log.info("DashboardAssistant.prototype.setMessage");
        
    this.controller.get('dashboard-text').innerHTML = 
        line1 + "<br/>" + line2;
        };


DashboardAssistant.prototype.deactivateStage = function() {
    Mojo.Log.info("Dashboard stage Deactivation");
};

// Update scene contents, using render to insert the object into an HTML template 
DashboardAssistant.prototype.displayDashboard = function(title, message, count) {
    Mojo.Log.info("DashboardAssistant.displayDashboard");
    var info = {title: title, message: message, count: count};
    var renderedInfo = Mojo.View.render({object: info, template: "Dashboard/item-info"});
    var infoElement = this.controller.get("dashboardinfo");
    infoElement.update(renderedInfo);
};

DashboardAssistant.prototype.launchMain = function() {
    Mojo.Log.info("DashboardAssistant.launchMain");
    var appController = Mojo.Controller.getAppController();
    appController.assistant.handleLaunch();
    this.controller.window.close();
	
	this.stageController = appController.getStageController('WeekView');
		
	if (this.stageController)
	{
		// app window is open, give it focus
		this.stageController.activate();
	} 
	else
	{		
		// otherwise create the app window
		appController.createStageWithCallback(
			{name:                'WeekView',  
             clickableWhenLocked: true,
		     lightweight:         true}, 
			 this.pushTheScene.bind(this));		
	}
};



/* ===========================================================================
 * inOrOutCB
 * ===========================================================================
 */
DashboardAssistant.prototype.inOrOutCB = function()
{
	Mojo.Log.info("DashboardAssistant.inOrOutCB: " + tmwGL.inOut);

    this.controller.get('dashboard-checkinout').className =
        "dashboard-icon dashboard-img-" + (tmwGL.inOut === "in"? "out": "in");

    tmwGL.db.getDashboardMessage(this.setMessage.bind(this));
}



/* ===========================================================================
 * pushTheScene --- jump to first scene
 * ===========================================================================
 */
DashboardAssistant.prototype.pushTheScene = function(stageController) 
{
	Mojo.Log.info("DashboardAssistant.pushTheScene");
	stageController.pushScene('WeekView');
};




/* ===========================================================================
 * handleCommand
 * ===========================================================================
 */
DashboardAssistant.prototype.handleCommand = function(event) 
{
	// this.controller = Mojo.Controller.stageController.activeScene();
	
    Mojo.Log.info("handleCommand("+ event.command + ")");
	
	if(event.type == Mojo.Event.command) 
	{
		switch(event.command)
		{
		}
	}
};



/* ===========================================================================
 * handleinBtn
 * ===========================================================================
 */
DashboardAssistant.prototype.inOutHandler = function()
{
    Mojo.Log.info("DashboardAssistant.inOutHandler");

    switch(tmwGL.inOut)
    {
        case 'out':
            this.handleInBtn();
            break;
        
        case 'in':
            this.handleOutBtn();
            break;
    }
};



/* ===========================================================================
 * handleinBtn
 * ===========================================================================
 */
DashboardAssistant.prototype.handleInBtn = function()
{
	Mojo.Log.info("DashboardAssistant.handleInBtn");
	if(tmwGL.inOut == 'out')
	{
		tmwGL.db.checkIn();
        this.inOrOutCB();
	}
};


/* ===========================================================================
 * handleOutBtn
 * ===========================================================================
 */
DashboardAssistant.prototype.handleOutBtn = function()
{
	Mojo.Log.info("DashboardAssistant.handleOutBtn");
	if(tmwGL.inOut == 'in')
	{
		tmwGL.db.checkOut();
        this.inOrOutCB();
	}
};


