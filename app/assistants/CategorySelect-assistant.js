function CategorySelectAssistant(callbackPI, selectedCategoriesListPI) {
	Mojo.Log.info("CategorySelectAssistant: -'%s'", selectedCategoriesListPI);
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */

	this.callback = callbackPI;
	this.selectedCategoriesList = selectedCategoriesListPI.split(',');
}

CategorySelectAssistant.prototype.setup = function() {
	/* setup widgets here */
	
	// --- categories list --------------------------------------
	this.categoriesListModel = 
	{
		listTitle: $L("Categories"),
        items: []
	};

	this.controller.setupWidget
		('listCategories', 
 	     {
		 	itemTemplate:			'CategorySelect/Categories-listitem', 
		  	listTemplate:			'CategorySelect/Categories-listcontainer',
			preventDeleteProperty: 	'noDelete',
          	swipeToDelete: 			false
		 },
	  	 this.categoriesListModel);

	this.controller.setupWidget('checkbox',
		this.cbattributes = {
			property: 'value',
			trueValue: 'ON',
			falseValue: 'OFF'
		},
		this.cbmodel = {
			value: 'ON',
			disabled: false
		});

    if(myApp.isTouchPad())
    {
        this.commandMenuModel = {
            items: [{
                label: $L('Back'),
                icon: 'back',
                command: 'go-back'
            }, {
            }, {
                items: [{
                    label: $L("Select all"),
                    command: 'select-all'
                }, {
                    label: $L("Select none"),
                    command: 'select-none'
                }, {
                    label: $L("Toggle all"),
                    command: 'toggle'
                }]
            }, {
                label: $L("Edit categories"),
                command: 'edit'
            }, {}]
        };
    }   
    else
    {
         this.commandMenuModel = {
             items: [{
                 items: [{
                     label: $L("All"),
                     command: 'select-all'
                 }, {
                     label: $L("None"),
                     command: 'select-none'
                 }, {
                     label: $L("Toggle"),
                     command: 'toggle'
                 }]
             }, {
                 label: $L("Edit"),
                 command: 'edit'
             }]
         };
	};		
		
	this.controller.setupWidget(Mojo.Menu.commandMenu, 
		undefined, this.commandMenuModel);
}


CategorySelectAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	  
  	tmwGL.db.getCategoryData(
		this.loadCategoriesList.bind(this));
};



/* ===========================================================================
 * loadCategoriesList
 * ===========================================================================
 */
CategorySelectAssistant.prototype.loadCategoriesList = function()
{
	Mojo.Log.info("CategorySelectAssistant.loadCategoriesList");
	
	// Mojo.Log.info("Result:" + Object.toJSON(result.rows));
    var categoriesListItems = [];

	for (var i = 0; i < prefsGL.categoriesList.length; i++) 
	{
		var category = prefsGL.categoriesList[i];

		var toggle = 'OFF';

		for (var catIndex = 0; 
			 catIndex < this.selectedCategoriesList.length; 
			 catIndex++)
		{
			if(category.id == this.selectedCategoriesList[catIndex])
			{
				toggle = 'ON';
				break;
			}
		}

		var item = {
			'id':		category.id,
			'name':		category.name,
			'value': 	toggle			
		}

		categoriesListItems.push(item);			
	}

	this.categoriesListModel.items = categoriesListItems;
	this.controller.modelChanged(this.categoriesListModel, this);	
};




/* ===========================================================================
 * handleTapCategoryEntry
 * ===========================================================================
 */
CategorySelectAssistant.prototype.handleTapCategoryEntry = function(event)
{
	Mojo.Log.info("CategorySelectAssistant.handleTapCategoryEntry");
	
	Mojo.Log.info("Clicked on " + Object.toJSON(event.item));
};


/* ===========================================================================
 * handleCommand
 * ===========================================================================
 */
CategorySelectAssistant.prototype.handleCommand = function(event) 
{
	Mojo.Log.info("CategorySelectAssistant.handleCommand:" + event.command);
	// this.controller = Mojo.Controller.stageController.activeScene();
	
	if(event.type == Mojo.Event.command) 
	{
		switch(event.command)
		{
			case 'select-all':
				for (var i = 0; i < this.categoriesListModel.items.length; i++) 
				{
					this.categoriesListModel.items[i].value = 'ON';
				}
				break;
			
			case 'select-none':
				for (var i = 0; i < this.categoriesListModel.items.length; i++) 
				{
					this.categoriesListModel.items[i].value = 'OFF';
				}
				break;
			
            case 'toggle':
                for (var i = 0; i < this.categoriesListModel.items.length; i++) 
                {
                    this.categoriesListModel.items[i].value =
                        this.categoriesListModel.items[i].value == 'ON'? 'OFF': 'ON';
                }
                break;
            case 'edit':
                this.controller.stageController.pushScene('Prefs');   
                break;
            case 'go-back':
                this.controller.stageController.popScene();
                break;
		}

		// this.categoriesListModel.items = this.categoriesListModel;		
		this.controller.modelChanged(this.categoriesListModel, this);	
	}
}


CategorySelectAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	var idList = [];
	var nameList = [];
     
 	for (var i = 0; i < this.categoriesListModel.items.length; i++) 
	{
		if(this.categoriesListModel.items[i].value == 'ON')
		{
			idList.push(this.categoriesListModel.items[i].id);
            nameList.push(this.categoriesListModel.items[i].id);        
		}
	}

	this.callback(idList.join(","), nameList.join(", "));
};

CategorySelectAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
