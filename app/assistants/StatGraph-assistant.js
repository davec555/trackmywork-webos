/*****************************************************************************
 * TrackMyWork - Graphical rendering for statistics
 * 
 * (c) 2009, 2010 by Klaus Reger <K.Reger@gmx.de>
 * 
 ****************************************************************************/

function StatGraphAssistant(titlePI, dataPI)
{
	Mojo.Log.info("StatGraphAssistant");
	/* this is the creator function for your scene assistant object. It will be passed all the 
	 additional parameters (after the scene name) that were passed to pushScene. The reference
	 to the scene controller (this.controller) has not be established yet, so any initialization
	 that needs the scene controller should be done in the setup function below. */
	
	this.title = titlePI;
	this.data = dataPI;

    var deviceInfo = Mojo.Environment.DeviceInfo;       

    Mojo.Log.info("ScreenWidth:" + deviceInfo.screenWidth);
    Mojo.Log.info("ScreenHeight:" + deviceInfo.screenHeight);

    // Touchpad:
    if(myApp.isTouchPad())
    {
        this.initGraph(1024-20, 768 - 20);    
    }
    // Pre3:
    else if(myApp.isPre3())
    {
        this.initGraph(300, 500);      
    }
    else
    {
    	this.initGraph(300, 460);    
    }
}

StatGraphAssistant.prototype.initGraph = function(maxX, maxY) 
{
	Mojo.Log.info("StatGraphAssistant.initGraph");
	
	
	this.canvasName = "canvasObj";
	
	this.borderN = 20;
	this.borderS = 18;
	this.borderW = 42;
	this.borderE = 10;
	
	this.maxX = maxX;
	this.maxY = maxY;
	
	this.nrOfRecords = this.data.length - 2;
	this.minDur = 9999999999;
	this.maxDur = 0;
	
	this.dateMax = new Date(0);
	this.dateMin = new Date(2100,0,0);
	
	// first line => header; last line summary
	for(var i=1; i < this.data.length - 1; i++)
	{
		if(this.data[i].durationInSec < this.minDur)
		{
			this.minDur = this.data[i].durationInSec;
		}	
		
		if(this.data[i].durationInSec > this.maxDur)
		{
			this.maxDur = this.data[i].durationInSec;
		}			

		if(this.data[i].dateMin < this.dateMin)
		{
			this.dateMin = new Date(this.data[i].dateMin);
		}	
		
		if(this.data[i].dateMin > this.dateMax)
		{
			this.dateMax = new Date(this.data[i].dateMin);
		}			
	}
	
	this.minHr = Math.floor(this.minDur / 3600) - 1;
	this.maxHr = Math.ceil(this.maxDur / 3600) + 1; 

	this.offsetHr   = (this.maxY - this.borderN - this.borderS) / (this.maxHr - this.minHr);
	this.offsetDays = ((this.maxX - this.borderW - this.borderE) / 
								 (((this.dateMax.getTime() - this.dateMin.getTime()) / 86400000)));

	alert("nrOfRecords:"+this.nrOfRecords);
	alert("minDur:"+this.minDur);
	alert("maxDur:"+this.maxDur);
	alert("minHr:"+this.minHr);
	alert("maxHr:"+this.maxHr);
	alert("dateMin:"+this.dateMin);
	alert("dateMax:"+this.dateMax);
	alert("offsetHr:"+this.offsetHr);
	alert("offsetDays:"+this.offsetDays);
	
}

StatGraphAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */	
    this.controller.enableFullScreenMode(true);
	
	// enable free orientation
    if(!prefsGL.lockRotate)
    {
        if(!myApp.isTouchPad())
        {
           	this.controller.window.PalmSystem.setWindowOrientation("free");
        }
    	else
        {
           // if (this.controller.stageController.setWindowOrientation) {
                this.controller.stageController.setWindowOrientation("free");
           // }
        }
    }
    
	/* add event handlers to listen to events from widgets */
    Mojo.Event.listen(this.controller.get('canvasObj'),
                      Mojo.Event.tap, 
                      this.goBack.bind(this));
                 
};

StatGraphAssistant.prototype.activate = function(event){
	/* put in event handlers here that should only be in effect when this scene is active. For
	 example, key handlers that are observing the document */
	
    if(!prefsGL.lockRotate)
    {
	   this.orientationChanged(PalmSystem.screenOrientation);
    }	
	this.drawGraph();
}


/* ===========================================================================
 * handleCommand
 * ===========================================================================
 */
StatGraphAssistant.prototype.handleCommand = function(event) 
{
    Mojo.Log.info("HelpAssistant.handleCommand");
    //Mojo.Log.error("event: %j", event)

    if(event.type == Mojo.Event.command) 
    {
        switch(event.command)
        {   
            case 'go-back':
                this.goBack(); 
                break;
            default:
                break;
        }
    }
}
StatGraphAssistant.prototype.goBack = function(event) 
{
    Mojo.Log.info("HelpAssistant.goBack");

    this.controller.stageController.popScene(); 
}




StatGraphAssistant.prototype.drawGraph = function(event){

	var devInfo = Mojo.Environment.DeviceInfo;
	
	var canvas = this.controller.get(this.canvasName);
	var ctx = canvas.getContext("2d");

	ctx.strokeStyle = "grey";	
	   
    var deviceInfo = Mojo.Environment.DeviceInfo;       

    // Touchpad:
    if(myApp.isTouchPad())
    {
        ctx.clearRect(0, 0, 1024, 1024);  
    }
    // Pre3
    else if(myApp.isPre3())
    {
        ctx.clearRect(0, 0, 800, 800);  
    }
    else
    {
    	ctx.clearRect(0, 0, 480, 480);  
    }
	
	ctx.font = "11px sans-serif";
    ctx.fillStyle = "Black";  
    ctx.lineCap = "round";  
	
	if(this.nrOfRecords < 2)
	{
		ctx.font = "16px sans-serif bold";
	   	ctx.textAlign = "center";  
		ctx.fillText($L("Not enough data."),
			         this.maxX / 2, 
					 this.maxY / 2 - 20);	

		ctx.fillText($L("A minimum of two records is required."),
			         this.maxX / 2, 
					 this.maxY / 2 + 20);	
		return;	
	}
	
	// --- Draw data as lines ---
    ctx.lineWidth   = 5;  
	ctx.fillStyle   = "#6FFF66";
	ctx.strokeStyle = "green";    
    ctx.lineJoin    = "round";  
	
    ctx.beginPath();  		
	ctx.moveTo(this.borderW, 
	           this.maxY - this.borderS);	
			    
	for (var i = 1; i <= this.nrOfRecords; i++) 
	{
		var offsetX = this.offsetDays *
			((this.data[i].dateMin.getTime() - this.dateMin.getTime()) / 86400000);
		var offsetY = this.maxY - this.borderN - this.borderS -
			(this.offsetHr * ((this.data[i].durationInSec / 3600) - this.minHr));
		
		alert("Point X="+offsetX+" Y="+offsetY);		
		ctx.lineTo(this.borderW + offsetX, 
		           this.borderN + offsetY);
	}
	ctx.lineTo(this.maxX - this.borderE,
	           this.maxY - this.borderS) ;
	ctx.fill();	


	var lastLine = -999;
	ctx.strokeStyle = "grey"; 
    ctx.lineWidth = 2;  
	// --- Data lines for each record ---
	for (var i=1; i < this.nrOfRecords; i++)
	{
		var offsetX = this.offsetDays *
			((this.data[i].dateMin.getTime() - this.dateMin.getTime()) / 86400000);

		if(lastLine + 40 < offsetX)
		{
			ctx.strokeRect(this.borderW + offsetX, 
						   this.borderN, 
						   0, 
						   this.maxY - this.borderN - this.borderS);
						   
			lastLine = offsetX;
		}
	}
	

	lastLine = 0;	
	// --- Draw lines for hours ---
	for (var hr = this.minHr + 1; hr < this.maxHr; hr++) {
		
		var offsetY = this.offsetHr * (hr - this.minHr);
		
		if (lastLine + 20 < offsetY) 
		{
			ctx.strokeRect(this.borderW, 
				           this.borderN + offsetY, 
						   this.maxX - this.borderE - this.borderW, 
						   0);
			lastLine = offsetY;
		}
	}
		
	// border around graph
	ctx.strokeStyle = "black"; 
	ctx.strokeRect(this.borderW, 
				   this.borderN, 
				   this.maxX - this.borderE - this.borderW, 
				   this.maxY - this.borderS - this.borderN);
	
	lastLine = 0;		
	// --- Draw labels for hours ---
    ctx.fillStyle = "black";  
    ctx.textAlign = "right";  
	for (var hr = this.minHr + 1; hr < this.maxHr; hr++) {
		
		var offsetY = this.offsetHr * (hr - this.minHr);
		
		if (lastLine + 20 < offsetY) 
		{
			ctx.fillText((this.maxHr - hr + this.minHr) + ":00", 
			             38, 
						 this.borderN + offsetY + 3);
			lastLine = offsetY;
		}
	}
	
	var lastLine = -999;
    ctx.textAlign = "center";  
	// --- Data labels for each record ---
	for (var i=1; i <= this.nrOfRecords; i++)
	{
		var offsetX = this.offsetDays *
			((this.data[i].dateMin.getTime() - this.dateMin.getTime()) / 86400000);

		if(lastLine + 40 < offsetX)
		{
			var date = new Date();
			
			var year = this.data[i].dateMin.getFullYear(); // % 100;
			var month = this.data[i].dateMin.getMonth() + 1;
			var day = this.data[i].dateMin.getDate();
	
            var text = month + "/" + day;
    	      
            if(Mojo.Locale.getCurrentLocale().match("de.*"))
            {
    			text = day + "." + month;
            }
          
			if(this.offsetDays < 1)
			{
				text = month + "/" + (year < 10? "0": "") + year;
			}

	   		ctx.fillText(text, 
						 offsetX + this.borderW, 
					     this.maxY - 4);
	   		
			lastLine = offsetX;
		}
	}
	
	// --- Points for each record ---  
    ctx.fillStyle = "blue";  
	for (var i = 1; i <= this.nrOfRecords; i++) 
	{
		var offsetX = this.offsetDays *
			((this.data[i].dateMin.getTime() - this.dateMin.getTime()) / 86400000);
		var offsetY = this.maxY - this.borderN - this.borderS -
			(this.offsetHr * ((this.data[i].durationInSec / 3600) - this.minHr));
		
		alert("Point X="+offsetX+" Y="+offsetY);		

        ctx.beginPath();  		
		ctx.arc(offsetX + this.borderW, 
				offsetY + this.borderN,
				3, 0, Math.PI * 2, true);
		ctx.fill();
	}

	ctx.font = "14px sans-serif";
    ctx.fillStyle = "Black";  
    ctx.textAlign = "center";  
	ctx.fillText(this.title, ((this.maxX - this.borderW - this.borderE) / 2) + this.borderW, 16);	
};



StatGraphAssistant.prototype.orientationChanged = function(orientation) 
{
    
    if(prefsGL.lockRotate)
    {
        return;
    }
    
	var deviceInfo = Mojo.Environment.DeviceInfo;		
	this.orientationClass = "";
	this.canvasName = "canvasObj";
    
	if(orientation == "left" ||
	   orientation == "right")
	{    
        if(myApp.isTouchPad())
        {
            this.maxY = 1024;
            this.maxX = 768;            
        }
        else if(myApp.isPre3())
        {
            this.maxX = 500;
            this.maxY = 320;                        
        }
        else
        {
    		this.maxX = deviceInfo.screenHeight;
    		this.maxY = deviceInfo.screenWidth;
        }
	}	
	else
	{
        if (myApp.isTouchPad()) 
        {
            this.maxX = 1024;
            this.maxY = 768;
        }
        else if (myApp.isPre3()) 
        {
            this.maxY = 500;
            this.maxX = 320;
        }
        else 
        {
            this.maxY = deviceInfo.screenHeight;
            this.maxX = deviceInfo.screenWidth;
        }
	}
		
    Mojo.Log.info("orientation: "+ orientation)
    Mojo.Log.info("       maxX: "+ this.maxX)
	Mojo.Log.info("       maxY: "+ this.maxY)
	
	this.initGraph(this.maxX, this.maxY);
	this.drawGraph();
    
}




StatGraphAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

StatGraphAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
