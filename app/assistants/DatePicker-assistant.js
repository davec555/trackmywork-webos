function DatePickerAssistant(sceneAssistantPI, headerPI, datePI, callbackPI) {
	
	Mojo.Log.info("DatePickerAssistant.constructor");
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	
	this.sceneAssistant = sceneAssistantPI;
	this.header         = headerPI;
	this.date           = datePI;
	this.callback       = callbackPI;
}


DatePickerAssistant.prototype.setup = function(widgetPI) {
	Mojo.Log.info("DatePickerAssistant.setup");

	/* this function is for setup tasks that have to happen when the scene is first created */
	this.widget = widgetPI
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	this.sceneAssistant.controller.get("header").update(this.header);
	
    this.sceneAssistant.controller.setupWidget("date",
        this.attributes = {
            label: 			"",
            modelProperty: 'time' 
        },
        this.model = {
            time: this.date
        });

	this.sceneAssistant.controller.setupWidget('selectDateBtn', 
		{}, 
		{
			buttonLabel: $L('Use selected date'),
			buttonClass: 'primary',
			disabled: false
		});

	/* add event handlers to listen to events from widgets */
	Mojo.Event.listen(this.sceneAssistant.controller.get('selectDateBtn'),
		Mojo.Event.tap, 
		this.cbSelectDateBtn.bind(this));
      
    if(myApp.isTouchPad())
    { 
        // this.controller.get("header").addClassName("touchpad-list");
        // this.controller.get("date").addClassName("touchpad-list");
        // this.controller.get("selectDateBtn").addClassName("touchpad-list"); 
    }
};


/* ===========================================================================
 * cbSelectDateBtn
 * ===========================================================================
 */
DatePickerAssistant.prototype.cbSelectDateBtn = function(event)
{
	Mojo.Log.info("DatePickerAssistant.cbSelectDateBtn");
	
	this.callback(this.date);
	this.widget.mojo.close();
};



DatePickerAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
