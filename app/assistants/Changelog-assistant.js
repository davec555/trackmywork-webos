/*****************************************************************************
 * TrackMyWork - Daily overview
 * 
 * (c) 2009-2011 by Klaus Reger <K.Reger@gmx.de>
 * 
 ****************************************************************************/



function ChangelogAssistant(okMessage) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
       that needs the scene controller should be done in the setup function below. */  
	
	if(okMessage !== undefined)
	{
		this.okMessage = okMessage;
	}
	else
	{
		this.okMessage = $L("Ok");
	}
	
	var vollversion = "<a href='"+tmwGL.appUrl+"'>Vollversion</a>";
	var fullversion = "<a href='"+tmwGL.appUrl+"'>full version</a>";
	
	this.changelog_de =
    {
        '1.0.30': 
        [
            'Präsentations-Modus für alle unterstützten Geräte ('+vollversion+')'
        ],
        '1.0.29': 
        [
            'Rotation der Anzeige kann deaktiviert werden'
        ],
        '1.0.28': 
        [
            'Design-Anpassungen für Pre³'
        ],
        '1.0.27': 
        [
            'HD-Version für das HP Touchpad'
        ],
       '1.0.26':
        [
            'Korrekturen für das HP-Touchpad'
        ],
        '1.0.25':
        [
            'Verbesserte Benutzerführung beim Import und Export',
            'Leise-Schalter wird nun respektiert ('+vollversion+')'
        ],
        '1.0.24':
        [
            'Notizen in Statistik-Mail ('+vollversion+')'
        ],
        '1.0.23':
        [
            'Bugfix: Listeneintrag bei wird Berührung nun korrekt gezeichnet',
            'Bugfix: Korrekter Import, wenn die Bemerkung ein Komma enthält',
            'FAQ erweitert'
        ],
        '1.0.22':
        [
            'Hilfstexte für die Einstellungen'
        ],
        '1.0.21':
        [
            'Bugfix: Einstellungen funktionieren wieder komplett'
        ],
        '1.0.20':
        [
            'Kategorie-Auswahl für die Statistiken ('+vollversion+')',
            'Anzeige der KW in der Wochenübersicht',
            'Benachrichtigung für Updates'
        ],
        '1.0.19':
        [
            'Kategorie-Auswahl: Design-Verbesserungen',
            'Kategorie-Auswahl beim Export von Daten',
            'Kategorie-Auswahl beim Löschen von Daten'
        ],
        '1.0.18':
        [
            'Berechnung der Summe in der Tagesübersicht',
            'Ton und Vibration bei Erinnerungen ('+vollversion+')'
        ],
        '1.0.17':
        [
            'Anpassungen für WebOS 2.0',
            'Ein-/Auchbuchen auch möglich, wenn das Telefon gesperrt ist ('+vollversion+')'
        ],
        '1.0.16':
        [
            'Versenden der Statistik als Mail ('+vollversion+')',
            'Bugfix: Unvollständige Daten nach Wiederherstellung '+
            'des Gerätes werden nun toleriert',
            'Bugfix: Korrekte Berechnung des Monatsendes für Auswahl der Statistik'
        ],
        '1.0.15':
        [
            'Beim Kategorie-Wechsel automatische Aus- und Einbuchung, '+
            'wenn aktuell eingebucht ist',
            'Ein-/Ausbuchen auch aus der Tagesansicht möglich'
        ],
        '1.0.14':
        [
            'Neue Symbole für Ein-/Ausbuchen'
        ],
        '1.0.13':
        [
            'Informationen im Dashboard anzeigen ('+vollversion+')',
            'Zurück-Geste verkleinert ins Dashboard ('+vollversion+')',
            'Datums-Label in Grafik sprachabhängig ('+vollversion+')',
            'Ein-/Ausbuchen als Symbol angezeigt',
            'Flick-Geste (links oder rechts) blättert wochenweise',
            'FAQ Hilfsseite'
        ],
        '1.0.12':
        [
            'BUGFIX: Kategorie-Filter aktiviert'
        ],
		'1.0.11':
		[
			'Neuer Kategorie-Filter'
		],
		'1.0.10':
		[
			'Benachrichtigungs-Funktionen ('+vollversion+')',
			'Liste der Änderungen nun über Hilfs-Seite erreichbar',
			'Kategorie-Wähler verbessert'
		],
		'1.0.9':
		[
			'Neues Icon und Design',
			'Hilfe-Seite neu gestaltet'
		],
		'1.0.8':
		[
			'Direkt-Sprung zu Datum möglich'
		],
		'1.0.7':
		[
			'Automatisch eingerechnete Pausen ('+vollversion+')',
			'Diese Liste der Änderungen'
		],
		'1.0.6':
		[
			'Verbesserungen im Layout',
			'Nachtschichten können nachträglich erfasst und geändert werden',
			'Notizen können länger als 30 Zeichen sein'
		],
		'1.0.5': 
		[
			'Hilfs-Seiten hinzugefügt',
			'Bugfix: Noch nicht ausgecheckte Einträge werden korrekt importiert'
		]
	}

	this.changelog_en =
	{
        '1.0.30': 
        [
            'Exhibition mode for all supported devices ('+fullversion+')'
        ],
        '1.0.29': 
        [
            'Display rotation can be disabled now'
        ],
        '1.0.28': 
        [
            'Design-Improvements for Pre³'
        ],
        '1.0.27': 
        [
            'HD-Version for the HP Touchpad'
        ],
        '1.0.26':
        [
            'Fixes for the HP-Touchpad'
        ],
        '1.0.25':
        [
            'Handling of import and export improved',
            'Ringer switch gets respected now ('+fullversion+')'
        ],
        '1.0.24':
        [
            'Notes in statistic-mail ('+fullversion+')'
        ],
         '1.0.23':
        [
            'Bugfix: Draw tapped list entry correct',
            'Bugfix: Import-Problem fixed, when note contains a comma',
            'FAQ extended'
        ],
        '1.0.22':
        [
            'Help for the preferences'
        ],
        '1.0.21':
        [
            'Bugfix: Preferences work again fully'
        ],
        '1.0.20':
        [
            'Category selection for statistics ('+fullversion+')',
            'Display week number in weekly overview',
            'Notification for updates'
        ],
        '1.0.19':
        [
            'Category selection: design improvements',
            'Category selection for exporting data',
            'Category selection for deleting data'
        ],
        '1.0.18':
        [
            'Calculate sum of worked time in the day-view',
            'Ringtone an vibration for notifications ('+fullversion+')'
        ],
        '1.0.17':
        [
            'WebOS 2.0 ready',
            'Check in-/out also possible, when phone is locked ('+fullversion+')'
            // 'Calculate sum of worked time in the day-view'
        ],
        '1.0.16':
        [
            'Send statistics as mail ('+fullversion+')',
            'Bugfix: Incomplete data tolerated, when device was restored before',
            'Bugfix: Correct calculation of month-end in statistic drop-down'
        ],
        '1.0.15':
        [
            'Automatically check out and in, when checked in, '+
            'and category was changed',
            'Check in/out also from day view'
        ],
        '1.0.14':
        [
            'New symbols for check in-/out'
        ],
       '1.0.13':
        [
            'Show information on dashboard ('+fullversion+')',
            'Back gesture moves app to Dashboard ('+fullversion+')',
            'Date label in statistics formatted depending on locale ('+fullversion+')',
            'Check in-/out displayed as symbol',
            'Flick-gesture (left or right) goes to last or next week',
            'FAQ help page'
        ],
        '1.0.12':
        [
            'BUGFIX: Category-filter activated'
        ],
		'1.0.11':
		[
			'New category filter'
		],
		'1.0.10':
		[
			'Dashboard for notifications ('+fullversion+')',
			'Changelog available via Help-page',
			'Improvements on category selector'
		],
		'1.0.9':
		[
			'New Icon and Design',
			'New help page'
		],
		'1.0.8':
		[
			'Directly jump to a date'
		],
		'1.0.7':
		[
			'Automatic calculated breaks ('+fullversion+')',
			'This changelog'
		],
		'1.0.6':
		[
			'Layout improvements',
			'Midnight shift entries can be entered or altered later',
			'Note can be longer then 30 chars'
		],
		'1.0.5': 
		[
			'Help pages added',
			'Bugfix: Entries that were not checked out get imported correctly'
		]
	}

}

ChangelogAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	this.controller.get('header').update($L("Changelog"));
	
	this.commandMenuModel =
	{
		items:
		[
            {},
			{label: this.okMessage, width: 320, command:'select'},
            {}
		]
	};		

	this.controller.setupWidget(Mojo.Menu.commandMenu, 
		undefined, this.commandMenuModel);
	this.controller.modelChanged(this.commandMenuModel, this);

	
	var lang = "en";
	var changelogHtml = "";
	var changelog = null;
	var reviewUrl = "<a href='"+tmwGL.appUrl+"'>"+$L("review")+"</a>";
    
    if(tmwGL.beta)
    {
        reviewUrl = "<a href='"+tmwGL.betaAppUrl+"'>"+$L("review")+"</a>";            
    }
        
    if(tmwGL.free)
    {
        reviewUrl = "<a href='"+tmwGL.freeAppUrl+"'>"+$L("review")+"</a>";
    }

	if(Mojo.Locale.getCurrentLocale().match("de.*"))
    {
		lang = "de";
		changelog = this.changelog_de;
        changelogHtml =
             "Hoffentlich arbeiten Sie gerne mit dieser Anwendung. Wenn ja, " + 
             "dann würde mich sehr freuen, wenn Sie eine positive <b>" +
             reviewUrl + "</b> abgeben würden, falls Sie das noch nicht getan haben. " +
             "<br/>Das wäre für die weitere Entwicklung eine schöne Unterstützung.<br/>" + 
             "<br><b>Vielen Dank!</b>";            
	}
	else
	{
        changelogHtml =
             "I hope, you like this app. When you do so, " + 
             "I would enyoy very much a positive <b>" +
             reviewUrl + "</b>, if you haven't done already. " +
             "<br/>This would be a great motivation for further development.<br/>" + 
             "<br><b>Thanks alot!</b>";            
		changelog = this.changelog_en;
	}
			
    changelogHtml = changelogHtml + "<br/><br/><hr/>";
            
	for (var version in changelog)
	{
		changelogHtml = changelogHtml + "<b>"+$L("Version") + " " + version+"</b><ul>";
		
		var changesList = changelog.version;
		
		for(var i=0; i<changelog[version].length; i++)
		{
			changelogHtml = changelogHtml + "<li>"+changelog[version][i]+"</li>";
		}

		changelogHtml = changelogHtml + "</ul>";		
	}
	
	this.controller.get('changelog').innerHTML = changelogHtml;
	
	
	/* add event handlers to listen to events from widgets */
};

ChangelogAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};




/* ===========================================================================
 * handleCommand
 * ===========================================================================
 */
ChangelogAssistant.prototype.handleCommand = function(event)
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
}


ChangelogAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

ChangelogAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	  
	
};
