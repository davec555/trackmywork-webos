function HelpFAQAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

HelpFAQAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	  
    this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true}, {visible: false});
    this.controller.get('pageTitle').update
        ("&nbsp;&nbsp;&nbsp;<span style='font-weight:bold'>TrackMyWork</span>");
  
    this.commandMenuModel =
    {
        items:
        [
            {},
            {label: $L("Ok"), width: 320, command:'select'},
            {}
        ]
    };      
    
    /* add event handlers to listen to events from widgets */
    this.controller.setupWidget(Mojo.Menu.commandMenu, 
        undefined, this.commandMenuModel);
    this.controller.modelChanged(this.commandMenuModel, this);
	/* add event handlers to listen to events from widgets */
};

HelpFAQAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};



/* ===========================================================================
 * handleCommand
 * ===========================================================================
 */
HelpFAQAssistant.prototype.handleCommand = function(event)
{
    // this.controller = Mojo.Controller.stageController.activeScene();
    
    if (event.type == Mojo.Event.command) 
    {
        switch (event.command)
        {
            case 'select':
                this.controller.stageController.popScene();
                break;
        }
    }
};


HelpFAQAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

HelpFAQAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
