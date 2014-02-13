/*****************************************************************************
 * TrackMyWork - Edit categories
 * 
 * (c) 2009, 2010 by Klaus Reger <K.Reger@gmx.de>
 * 
 ****************************************************************************/

function CategoryViewAssistant(item) 
{
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	  
	  this.id = item.id;
	  this.name = item.name;
}

CategoryViewAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */

   	this.controller.window.PalmSystem.setWindowOrientation("up");
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */		
	this.controller.get('header').update($L("Category details"));
	this.controller.get('descLabel').update($L('Name'));
	// this.controller.get('title').update($L('Enter data'));
	
	this.controller.setupWidget('desc', 
	{
		hintText: 			'',
		textFieldName:		'desc', 
		modelProperty:		'description', 
		multiline:			false,
		disabledProperty: 	'disabled',
		focus: 				false, 
		modifierState: 		Mojo.Widget.capsLock,
		limitResize: 		false, 
		holdToEnable:  		false, 
		focusMode:			Mojo.Widget.focusSelectMode,
		changeOnKeyPress: 	true,
		textReplacement: 	false,
		maxLength: 			30,
		requiresEnterKey: 	false
	},
	this.descModel = {
		'description' : this.name,
		disabled: false
	});
		
		
	this.controller.setupWidget('saveBtn', 
	{}, 
	{
		buttonLabel: $L('Done'),
		buttonClass: 'primary',
		disabled: false
	});

	/* add event handlers to listen to events from widgets */
	Mojo.Event.listen(this.controller.get('saveBtn'),
		Mojo.Event.tap, 
		this.cbSaveBtn.bind(this))
		

    myApp.addBackMenu(this);

}




CategoryViewAssistant.prototype.cbSaveBtn = function(event){
	Mojo.Log.info("CategoryViewAssistant.cbSaveButton");
	
	this.name = this.descModel.description;
	
	tmwGL.db.saveCategory(this.id, this.name);
	
	this.controller.stageController.popScene();  
}


CategoryViewAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	
}



/* ===========================================================================
 * handleCommand
 * ===========================================================================
 */
CategoryViewAssistant.prototype.handleCommand = function(event) 
{
    Mojo.Log.info("CategoryViewAssistant.handleCommand:" + event.command);
    
    if(event.type == Mojo.Event.command) 
    {
        switch(event.command)
        {
            case 'go-back':
                this.controller.stageController.popScene();
                break;
        }
    }
}


CategoryViewAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

CategoryViewAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	  
 	Mojo.Event.stopListening(this.controller.get('saveBtn'),
		Mojo.Event.tap, 
		this.cbSaveBtn.bind(this))
}
