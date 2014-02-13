/*****************************************************************************
 * TrackMyWork - Handle preferences
 * 
 * (c) 2009, 2010 by Klaus Reger <K.Reger@gmx.de>
 * 
 ****************************************************************************/



var prefsGL =
{	
	expirationDate:			new Date(2011, 11, 1, 0, 0, 0), // 1. Aug. 2011
	standardDayBegin:		new Date(1970, 0, 1, 9, 0, 0),
	standardDayEnd:			new Date(1970, 0, 1, 17, 0, 0),
	
	startOfWeekDay:			Mojo.Format.getFirstDayOfWeek(),
	minuteInterval:			5,
	
	breakDurationInHours:   0,
	breakDurationInMinutes: 30,
	breakAfterHours:        4,
	breakAfterMinutes:      0,
	breakCalculate:         false,
	
    categoriesList: 		[],
	defaultCategoryName:	"TrackMyWork",
	defaultCategoryId:   	1,
	categoriesFilter:     	"1",
	nightShift:				false,
    
	autoCheckInOutMode:     "NONE",
    sound:                  false,
    soundFilename:          "",
    soundName:              "",
    vibrate:                false,
    
    lockRotate:             false,
    acceptMetrix:           true
};


var tmwPrefs = Class.create(
{
	modelName:	'tmwPrefs',
	db:			null,
	cookie: 	new Mojo.Model.Cookie('prefs-1.0'),
	
	initialize: function()
	{

		if(this.cookie.get() == undefined)
		{
			this.putCookie();	
		}
		else
		{
			this.getCookie();
		}
	}
});



/* ===========================================================================
 * putCookie --- write preferences in cookie
 * ===========================================================================
 */
tmwPrefs.prototype.putCookie = function() 
{
	Mojo.Log.info("tmwPrefs.putCookie");

	var cookie = {
		standardDayBeginHr:		prefsGL.standardDayBegin.getHours(),
		standardDayBeginMin:	prefsGL.standardDayBegin.getMinutes(),
		standardDayEndHr:		prefsGL.standardDayEnd.getHours(),
		standardDayEndMin:		prefsGL.standardDayEnd.getMinutes(),
		
		startOfWeekDay:			prefsGL.startOfWeekDay,
		minuteInterval:			prefsGL.minuteInterval,
		workdays:    			prefsGL.workdays,
		
		defaultCategoryId:		prefsGL.defaultCategoryId,
		defaultCategoryName:	prefsGL.defaultCategoryName,
		
		breakDurationInHours:   prefsGL.breakDurationInHours,
		breakDurationInMinutes: prefsGL.breakDurationInMinutes,
		breakAfterHours:        prefsGL.breakAfterHours,
		breakAfterMinutes:      prefsGL.breakAfterMinutes,
		breakCalculate:         prefsGL.breakCalculate,
		
		categoriesFilter:		prefsGL.categoriesFilter,
		
		nightShift:				prefsGL.nightShift,
		autoCheckInOutMode:		prefsGL.autoCheckInOutMode,
        sound:                  prefsGL.sound,
        soundFilename:          prefsGL.soundFilename,
        soundName:              prefsGL.soundName,
        vibrate:                prefsGL.vibrate,

        lockRotate:             prefsGL.lockRotate,
        acceptMetrix:           prefsGL.acceptMetrix,
		
		inOut:					tmwGL.inOut,
		changelogAccepted:      Mojo.appInfo.version
	};
	
	if(prefsGL.betaAccepted == Mojo.appInfo.version)
	{
		cookie.betaAccepted = Mojo.appInfo.version;
	}

	if(prefsGL.changelogAccepted == Mojo.appInfo.version)
	{
		cookie.changelogAccepted = Mojo.appInfo.version;
	}

	this.cookie.put(cookie);	
	
	alert("Cookie:"+Object.toJSON(cookie))
}





/* ===========================================================================
 * getCookie --- read cookie in global preferences
 * ===========================================================================
 */
tmwPrefs.prototype.getCookie = function()
{	
	Mojo.Log.info("tmwPrefs.getCookie");
	
	prefsGL.standardDayBegin       = new Date(1970, 0, 1, 9, 0, 0);
	prefsGL.standardDayEnd         = new Date(1970, 0, 1, 17, 0, 0);
	prefsGL.startOfWeekDay         = Mojo.Format.getFirstDayOfWeek();
	prefsGL.defaultCategoryName    = "TrackMyWork";
	prefsGL.defaultCategoryId      = 1;
	prefsGL.categoriesFilter       = "1";
	prefsGL.nightShift             = false;
    prefsGL.minuteInterval         = 5;
	prefsGL.workdays               = 5;
	prefsGL.autoCheckInOutMode     = "NONE";
    prefsGL.sound                  = false;
    prefsGL.soundFilename          = "";
    prefsGL.soundName              = "";
    prefsGL.vibrate                = false;
    prefsGL.lockRotate             = false;
    prefsGL.acceptMetrix           = true;
	prefsGL.breakDurationInHours   = 0;
	prefsGL.breakDurationInMinutes = 0;
	prefsGL.breakAfterHours        = 4;
	prefsGL.breakAfterMinutes      = 0;
	prefsGL.breakCalculate         = false;
	prefsGL.changelogAccepted      = "";
	
	var tmpPrefs = this.cookie.get();
	alert("Cookie: " + Object.toJSON(tmpPrefs));
	
	// --- Migration of old values ---
	if(tmpPrefs.defaultCategoryName == undefined &&
	   tmpPrefs.defaultProjectName != undefined)
	{
		tmpPrefs.defaultCategoryId   = tmpPrefs.defaultProjectId;
		tmpPrefs.defaultCategoryName = tmpPrefs.defaultProjectName;
	}
	
	prefsGL.standardDayBegin = new Date(1970, 0, 1, 
		tmpPrefs.standardDayBeginHr, 
		tmpPrefs.standardDayBeginMin, 
		0);
	prefsGL.standardDayEnd = new Date(1970, 0, 1, 
		tmpPrefs.standardDayEndHr, 
		tmpPrefs.standardDayEndMin, 
		0);

	if (tmpPrefs.startOfWeekDay != undefined) 
	{
		prefsGL.startOfWeekDay = tmpPrefs.startOfWeekDay;
	}
	else 
	{
		prefsGL.startOfWeekDay = Mojo.Format.getFirstDayOfWeek();
	}
	
	if(tmpPrefs.defaultCategoryId != undefined)
	{
		prefsGL.defaultCategoryId = tmpPrefs.defaultCategoryId;	
	}
	
	if(tmpPrefs.minuteInterval != undefined)
	{
		prefsGL.minuteInterval = tmpPrefs.minuteInterval;	
	}

	if (tmpPrefs.breakCalculate != undefined) 
	{
		prefsGL.breakCalculate = tmpPrefs.breakCalculate;
	}

	if (tmpPrefs.breakDurationInHours != undefined) 
	{
		prefsGL.breakDurationInHours = tmpPrefs.breakDurationInHours;
	}

	if (tmpPrefs.breakDurationInMinutes != undefined) 
	{
		prefsGL.breakDurationInMinutes = tmpPrefs.breakDurationInMinutes;	
	}

	if (tmpPrefs.breakAfterHours != undefined) 
	{
		prefsGL.breakAfterHours = tmpPrefs.breakAfterHours;
	}

	if (tmpPrefs.breakAfterMinutes != undefined) 
	{
		prefsGL.breakAfterMinutes = tmpPrefs.breakAfterMinutes;
	}

	if (tmpPrefs.workdays != undefined) 
	{
		prefsGL.workdays = tmpPrefs.workdays;
	}	
	
	if (tmpPrefs.defaultCategoryName != undefined) {
		prefsGL.defaultCategoryName = tmpPrefs.defaultCategoryName;
	}	

	if (tmpPrefs.categoriesFilter == undefined || 
		tmpPrefs.categoriesFilter == "undefined" || 
		tmpPrefs.categoriesFilter == null ||
		tmpPrefs.categoriesFilter == "") 
	{
		prefsGL.categoriesFilter = "all";
	}
	else 
	{
		prefsGL.categoriesFilter = "" + tmpPrefs.categoriesFilter;
	}
	
	if(tmpPrefs.nightShift != undefined)
	{
		prefsGL.nightShift = tmpPrefs.nightShift;
	}
	
	if(tmpPrefs.autoCheckInOutMode != undefined)
	{
		prefsGL.autoCheckInOutMode = tmpPrefs.autoCheckInOutMode;
	}

    if(tmpPrefs.sound != undefined)
    {
        prefsGL.sound = tmpPrefs.sound;
    }
    
    if(tmpPrefs.soundFilename != undefined)
    {
        prefsGL.soundFilename = tmpPrefs.soundFilename;
    }
    
    if(tmpPrefs.soundName != undefined)
    {
        prefsGL.soundName = tmpPrefs.soundName;
    }
    
    if(tmpPrefs.vibrate != undefined)
    {
        prefsGL.vibrate = tmpPrefs.vibrate;
    }
    
    if(tmpPrefs.acceptMetrix != undefined)
    {
        prefsGL.acceptMetrix = tmpPrefs.acceptMetrix;
    }
    
    if(tmpPrefs.lockRotate != undefined)
    {
        prefsGL.lockRotate = tmpPrefs.lockRotate;
    }
    
	
	
	tmwGL.inOut = tmpPrefs.inOut;	
	
	if(tmpPrefs.betaAccepted == Mojo.appInfo.version)
	{
		prefsGL.betaAccepted = Mojo.appInfo.version;
	}
	
	if(tmpPrefs.changelogAccepted == Mojo.appInfo.version)
	{
		prefsGL.changelogAccepted = Mojo.appInfo.version;
	}
}
