/*****************************************************************************
 * TrackMyWork - Help page
 * 
 * (c) 2009, 2010 by Klaus Reger <K.Reger@gmx.de>
 * 
 ****************************************************************************/

function HelpAssistant()
{
	this.versionStr = Mojo.appInfo.title + " " + 
		$L("V") + " " + 
		Mojo.appInfo.version;

}

HelpAssistant.prototype.setup = function()
{
	this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true}, {visible: false});
	this.controller.get('pageTitle').update(Mojo.appInfo.title);
	this.controller.get('appName').update($L("Version") + " " + Mojo.appInfo.version);
	this.controller.get('supportTitle').update($L("Support"));
	this.controller.get('seeAlsoTitle').update($L("More information"));
	this.controller.get('contribTitle').update($L("Thanks to ..."));
	this.controller.get('copyright').update($L("© Copyright 2009-2011 by Klaus Reger"));
	
	this.supportModel = 
	{
		items: []
	};
	
	this.seeAlsoModel = 
	{
		items: []
	};
	
	this.contribModel = 
	{
		items: []
	};
	
	var message = "";
	var url = 'http://reger-clan.de/';
		
	if(Mojo.Locale.getCurrentLocale().match("de.*"))
	{
		url = url + 'de/WebOS-TrackMyWork-Wochenuebersicht.html';
	}
	else
	{
		url = url + 'en/WebOS-TrackMyWork-WeeklyOverview.html';
	}
			
	this.supportModel.items.push({
		text: $L('Help'),
		detail: url,
		Class: 'img_web',
		type: 'web'
	});

	this.seeAlsoModel.items.push({
		text: $L('Homepage'),
		detail: tmwGL.homeUrl,
		Class: 'img_web',
		type: 'web'
		
	});

	
    this.supportModel.items.push({
        text: $L('FAQ'),
        detail: "HelpFAQ",
        Class: 'img_scene',
        type: 'scene'
    });

	this.supportModel.items.push({
		text: $L('Changelog'),
		detail: "Changelog",
		Class: 'img_scene',
		type: 'scene'
	});

	// FIXME: Direkt-Aufruf
	this.seeAlsoModel.items.push({
		text: $L('Video on YouTube'),
		detail: "http://www.youtube.com/watch?v=-VIadJsnNt8",
		Class: 'img_web',
		type: 'web'
		
	});

	this.supportModel.items.push({
		text: $L('Forum (English)'),
		detail: tmwGL.forumUrlEN,
		Class: 'img_web',
		type: 'web'
	});

	this.supportModel.items.push({
		text: $L('Forum (German)'),
        detail: tmwGL.forumUrlDE,
		Class: 'img_web',
		type: 'web'
	});

	this.supportModel.items.push({
		text: $L('Contact author'),
		detail: '',
		Class: 'img_email',
		type: 'email'
	});


	this.seeAlsoModel.items.push({
		text: (tmwGL.full? $L("Leave a review"): $L('Full version')),
		detail: tmwGL.appUrl,
		Class: 'img_app',
		type: 'appcat'
	});
	
	
	if (!tmwGL.beta) 
	{
		this.seeAlsoModel.items.push({
			text: $L('Latest beta (if available)'),
			detail: tmwGL.betaAppUrl,
			Class: 'img_app',
			type: 'appcat'
		});
	}

	if(!tmwGL.full)
	{
		this.seeAlsoModel.items.push({
			text: $L('Free version'),
     		text: (tmwGL.free? $L("Leave a review"): $L('Free version')),
			detail: tmwGL.freeAppUrl,
			Class: 'img_app',
			type: 'appcat'
		});		
	}

	this.contribModel.items.push({
		text: $L('Design by ART-ifact'),
		detail: 'http://www.art-ifact.de',
		Class: 'img_web',
		type: 'web'
	});
	
	this.controller.setupWidget
	(
		'supportList', 
		{
			itemTemplate: "Help/rowTemplate",
			swipeToDelete: false,
			reorderable: false
		},
		this.supportModel
	);
	
	this.controller.listen('supportList', 
		Mojo.Event.listTap, 
		this.listTapHandler.bindAsEventListener(this));

	this.controller.setupWidget
	(
		'seeAlsoList', 
		{
			itemTemplate: "Help/rowTemplate",
			swipeToDelete: false,
			reorderable: false
		},
		this.seeAlsoModel
	);
	
	this.controller.listen('seeAlsoList', 
		Mojo.Event.listTap, 
		this.listTapHandler.bindAsEventListener(this));

	this.controller.setupWidget
	(
		'contribList', 
		{
			itemTemplate: "Help/rowTemplate",
			swipeToDelete: false,
			reorderable: false
		},
		this.contribModel
	);
	
		
	if(tmwGL.beta)
	{
		message = message + "" +
			$L("This Beta version expires at:") + "<br/><b>" + 
			Mojo.Format.formatDate(prefsGL.expirationDate, {
				date: 'long',
				countryCode: ''
			}) + "</b>";
	}
				
	this.controller.get('appInfo').update(message);
	
	this.controller.listen('contribList', 
		Mojo.Event.listTap, 
		this.listTapHandler.bindAsEventListener(this));

    myApp.addBackMenu(this);
}



/* ===========================================================================
 * handleCommand
 * ===========================================================================
 */
HelpAssistant.prototype.handleCommand = function(event) 
{
    Mojo.Log.info("HelpAssistant.handleCommand");
    //Mojo.Log.error("event: %j", event)

    if(event.type == Mojo.Event.command) 
    {
        switch(event.command)
        {   
            case 'go-back':
                this.controller.stageController.popScene(); 
                break;
            default:
                break;
        }
    }
}




HelpAssistant.prototype.listTapHandler = function(event)
{
	switch (event.item.type)
	{
		case 'web':
			this.controller.serviceRequest("palm://com.palm.applicationManager", 
			{
				method: "open",
				parameters: 
				{
					id: 'com.palm.app.browser',
					params: 
					{
						target: event.item.detail
					}
				}
			});
			break;
			
		case 'appcat':
            window.location = event.item.detail;
            /*
			this.controller.serviceRequest("palm://com.palm.applicationManager", 
			{
				method: "open",
				parameters: 
				{
					id: 'com.palm.app.findapps',
					params: 
					{
						target: event.item.detail
					}
				}
			});
			*/
			break;
			
		case 'email':
			this.controller.serviceRequest('palm://com.palm.applicationManager', 
			{
			    method:		'open',
				parameters: 
				{
					id: 	'com.palm.app.email',
					params: {
						summary: 	this.versionStr,
						text: 		"",
						recipients: [{
							value: "TrackMyWork@gmx.de",
							type: "email",
							role: 1,
							contactDisplay: "Klaus Reger"
						}]
					}
				}
			});			
			break;
			
		case 'scene':
			this.controller.stageController.pushScene(event.item.detail);
			break;
	}
}

HelpAssistant.prototype.activate = function(event) 
{
	
}

HelpAssistant.prototype.deactivate = function(event) 
{
	
}

HelpAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening('supportList', 
		Mojo.Event.listTap, 
		this.listTapHandler.bindAsEventListener(this));
	this.controller.stopListening('contribList', 
		Mojo.Event.listTap, 
		this.listTapHandler.bindAsEventListener(this));
}
