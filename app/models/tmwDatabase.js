/*****************************************************************************
 * TrackMyWork - Database functions
 * 
 * (c) 2009, 2010 by Klaus Reger <K.Reger@gmx.de>
 * 
 ****************************************************************************/



var tmwDatabase = Class.create(
{
	modelName:	'tmwDatabase',
	db:			null,
	
	initialize: function(callbackPI)
	{
		Mojo.Log.info("tmwDatabase:initialize cb=" + callbackPI);
		
		this.openDatabase();
		this.createTables(callbackPI);
	}
});

/* =======================================================================
 * openDatabase
 * =======================================================================
 */
tmwDatabase.prototype.openDatabase = function()
{
	Mojo.Log.info("tmwDatabase:openDatabase()");
	
	this.db = null;
	
	try {
		this.db = openDatabase('TrackMyWorkDB', 
						  '1.0', 
						  'TrackMyWork Data Store', 
				  		  1024*1024);
	}
	catch (e)
	{
		Mojo.Log.error("openDatabase: Error = " + e);	
	}	
}
	
	
	
/* =======================================================================
 * createTables
 * =======================================================================
 */
tmwDatabase.prototype.createTables = function(callbackPI)
{
	Mojo.Log.info("tmwDatabase:createTables()");	

    //create table 
	this.db.transaction(function(tx)
	{	
		var sqlCmd = ('CREATE TABLE IF NOT EXISTS tmw_projects ' +
	  				  '(i_tmw_projects_id   INTEGER PRIMARY KEY AUTOINCREMENT,'+
					  ' v_name              VARCHAR(40), '+
					  ' e_type              VARCHAR(40), '+
					  ' v_color             VARCHAR(20),'+
					  ' UNIQUE (i_tmw_projects_id));'+
					  'GO;');
		tx.executeSql(sqlCmd, [], 
		function(tx, result)
		{
			Mojo.Log.info("create table "+sqlCmd);
				  
			//create table 
			var sqlCmd = ('CREATE TABLE IF NOT EXISTS tmw_times ' +
	  					  '(i_tmw_times_id    INTEGER PRIMARY KEY AUTOINCREMENT,'+
						  ' i_tmw_projects_id INTEGER NOT NULL'+
						  '                   REFERENCES tmw_projects (i_tmw_projects_id), '+
						  ' t_Start           TIMESTAMP NOT NULL DEFAULT "CURRENT_TIMESTAMP", '+
						  ' t_End             TIMESTAMP,' + 
						  ' v_note            VARCHAR(128),'+
						  ' UNIQUE (i_tmw_times_id));'+
						  'GO;');
			tx.executeSql(sqlCmd, [], 
			function(tx, result)
			{
				
				Mojo.Log.info("create table "+sqlCmd);
				
				// insert default record
				try {
					// -1 => force insert with id 1
					tmwGL.db.saveCategory(-1, 'TrackMyWork', callbackPI);
				
				}
				catch(arg)
				{
					Mojo.Log.error("Error, saving first category entry: "+ arg);
				};
				// callbackPI();
			}.bind(this), 
			function(tx, error){
				Mojo.Log.error("create table: " + error.message);
				return;
			}.bind(this));
		}.bind(this), 
		function(tx, error){
			Mojo.Log.error("create table: " + error.message);
			return;
		}.bind(this));
	});		
}
	
	
/* =======================================================================
 * createTables
 * =======================================================================
 */
tmwDatabase.prototype.createTimesTable = function()
{
	Mojo.Log.info("tmwDatabase:createTimesTable()");

  
}
	
	
	
/* =======================================================================
 * getWeekData
 * =======================================================================
 */
tmwDatabase.prototype.getWeekData = function(dateStartPI, callbackPI)
{
	Mojo.Log.info("XXXXXXX:tmwDatabase:getWeekData("+dateStartPI+")");

	this.db.transaction(function(tx) 
	{
		// add 7 days
		var dateEnd = new Date(dateStartPI.getTime() + 86400000 * 7);
		var dateStartStr = dateToYYYYMMDD(dateStartPI, '-');
		var dateEndStr   = dateToYYYYMMDD(dateEnd, '-');
			 
 		var sql =
			("SELECT strftime('%Y-%m-%d', DATETIME(t.t_start, 'localtime'))    AS d_date,"+
			 "       strftime('%s', MIN(t.t_start))     AS i_minUnixtime," +
  			 "       strftime('%s', MAX(COALESCE(t.t_end, DATETIME('now')))) AS i_maxUnixtime, " +
	    	 "       sum(strftime('%s', COALESCE(t.t_end, DATETIME('now'))) - strftime('%s', t_start))" +
			 "                                          AS i_duration,"+
			 "       p.v_name                           AS v_projectName" +
			 "  FROM tmw_times t" + 
			 "  LEFT JOIN tmw_projects p" +
			 "    ON (t.i_tmw_projects_id = p.i_tmw_projects_id)" +
			 " WHERE DATETIME(t.t_start, 'localtime') BETWEEN '" + dateStartStr + "'" +
			 "                                            AND '" + dateEndStr + "'" +
//			 " WHERE t.t_Start BETWEEN '" + dateStartStr + "'" +
//			 "                     AND '" + dateEndStr + "'" +
			 "   AND p.i_tmw_projects_id IN ("+prefsGL.categoriesFilter+")"+
			 " GROUP BY strftime('%Y-%m-%d', DATETIME(t.t_start, 'localtime'));");
		Mojo.Log.info("SELECT: %j", sql); 

  	  	tx.executeSql
			(sql, 
	    	 [], 	
			 function(tx, result)
			 {
			 	Mojo.Log.info("Result:" + Object.toJSON(result.rows));
				
			 	callbackPI(dateStartPI, result);
			 }.bind(this),
			 function(tx, error)
			 {
				Mojo.Log.error("getWeekData: "+error.message);
			 }.bind(this));
	});
}
	
	
	
/* =======================================================================
 * getStatistics
 * =======================================================================
 */
tmwDatabase.prototype.getStatistics = function(dateStartPI, 
											   dateEndPI, 
											   intervalPI, 
                                               categoryIdFilterPI,
											   callbackPI)
{
	Mojo.Log.info("tmwDatabase:getStatistics("+dateStartPI+"-"+dateEndPI+","+intervalPI+")");

	this.db.transaction(function(tx) 
	{	
		// next day 0:00:00
		var dateEnd = new Date(dateEndPI.getTime());
		dateEnd.setHours(0,0,0,0);
		dateEnd = new Date(dateEnd.getTime() + 86400000)
		
		// convert to string
		var dateStartStr = dateToYYYYMMDD(dateStartPI, '-');
		var dateEndStr   = dateToYYYYMMDD(dateEnd, '-');
			 
 		var sql = "";
        
        if(intervalPI !== "single")
        {
            sql = 
    			("SELECT strftime('%Y-%m-%d', DATETIME(t.t_start, 'localtime'))    AS d_date,"+
    			 "       strftime('%s', t.t_start)                                 AS i_unixtime," +
    			 "       strftime('%Y', t.t_start)                                 AS i_year," +
    			 "       strftime('%m', t.t_start)                                 AS i_month," +
    			 "       strftime('%j', t.t_start)                                 AS i_day_of_year," +
    			 "       strftime('%w', t.t_start)                                 AS i_day_of_week," +
    			 "       sum(strftime('%s', COALESCE(t.t_end, DATETIME('now'))) - "+
    			             "strftime('%s', t_start))                             AS i_duration,"+
                 "       ''                                                        AS v_note"  +     
    			 "  FROM tmw_times t" + 
    			 "  LEFT JOIN tmw_projects p" +
    			 "    ON (t.i_tmw_projects_id = p.i_tmw_projects_id)" +
    			 " WHERE DATETIME(t.t_start, 'localtime') >= '" + dateStartStr + "'" +
    			 "   AND DATETIME(t.t_start, 'localtime') <  '" + dateEndStr + "'" +
    			 "   AND p.i_tmw_projects_id IN ("+categoryIdFilterPI+")"+
    			 " GROUP BY strftime('%Y-%m-%d', DATETIME(t.t_start, 'localtime'))"+
    			 " ORDER BY 2;");
        }
        else
        {
            sql = 
                ("SELECT strftime('%Y-%m-%d', DATETIME(t.t_start, 'localtime'))    AS d_date,"+
                 "       strftime('%s', t.t_start)                                 AS i_unixtime," +
                 "       strftime('%Y', t.t_start)                                 AS i_year," +
                 "       strftime('%m', t.t_start)                                 AS i_month," +
                 "       strftime('%j', t.t_start)                                 AS i_day_of_year," +
                 "       strftime('%w', t.t_start)                                 AS i_day_of_week," +
                 "       strftime('%s', COALESCE(t.t_end, DATETIME('now'))) - "+
                 "       strftime('%s', t_start)                                   AS i_duration,"+
                 "       t.v_note                                                  AS v_note" +      
                 "  FROM tmw_times t" + 
                 "  LEFT JOIN tmw_projects p" +
                 "    ON (t.i_tmw_projects_id = p.i_tmw_projects_id)" +
                 " WHERE DATETIME(t.t_start, 'localtime') >= '" + dateStartStr + "'" +
                 "   AND DATETIME(t.t_start, 'localtime') <  '" + dateEndStr + "'" +
                 "   AND p.i_tmw_projects_id IN ("+categoryIdFilterPI+")"+
                 " ORDER BY 2;");
            
        }
        
		Mojo.Log.info("SELECT: %j", sql); 

  	  	tx.executeSql
			(sql, 
	    	 [], 	
			 function(tx, result)
			 {
			 	Mojo.Log.info("Result:" + Object.toJSON(result.rows));
				
			 	callbackPI(dateStartPI, dateEndPI, intervalPI, result);
			 }.bind(this),
			 function(tx, error)
			 {
				Mojo.Log.error("getStatisitcs: "+ error.message);
			 }.bind(this));
	});
}
	
	
	
/* =======================================================================
 * getCategoryData
 * =======================================================================
 */
tmwDatabase.prototype.getCategoryData = function(callbackPI)
{
	Mojo.Log.info("tmwDatabase:getCategoryData()");

	this.db.transaction(function(tx) 
	{
 		var sql =
			("SELECT p.i_tmw_projects_id,"+
			 "       p.v_name, "+
			 "       COUNT(t.i_tmw_times_id) AS i_count"+
  			 "  FROM tmw_projects p "+
 			 "  LEFT JOIN tmw_times t "+
			 "    ON (p.i_tmw_projects_id = t.i_tmw_projects_id) "+
			 " GROUP BY 1"+
			 " ORDER BY 2;");
		Mojo.Log.info("SELECT: %j", sql); 

  	  	tx.executeSql
			(sql, 
	    	 [], 	
			 function(tx, result)
			 {
			 	
				prefsGL.categoriesList = [];
				for (var i = 0; i < result.rows.length; i++) 
				{
					var row = result.rows.item(i);
		
					if(prefsGL.defaultCategory == "" ||
					   prefsGL.defaultCategoryId == row['i_tmw_projects_id'])
					{
						prefsGL.defaultCategoryName = row['v_name'];
						prefsGL.defaultCategoryId   = row['i_tmw_projects_id'];
					}
					
					prefsGL.categoriesList.push({
						'id':	row['i_tmw_projects_id'],
						'name':	row['v_name'],
						'count':row['i_count']
					});
				}

				if(callbackPI != undefined)
				{
				 	callbackPI(result);				
				}

			 },
			 function(tx, error)
			 {
				Mojo.Log.error("getCategories:"+error.message);
			 });
	});
}
	
	
	
/* =======================================================================
 * getDayData
 * =======================================================================
 */
tmwDatabase.prototype.getDayData = function(dateStartPI, callbackPI)
{
	Mojo.Log.info("tmwDatabase:getDayData("+dateStartPI+")");

	this.db.transaction(function(tx) 
	{
		// add 7 days
		var dateEnd = new Date(dateStartPI.getTime() + 86400000);
		var dateStartStr = dateToYYYYMMDD(dateStartPI, '-');
		var dateEndStr   = dateToYYYYMMDD(dateEnd, '-');
			 
 		var sql =
			("SELECT t.i_tmw_times_id,"+
			 "       strftime('%s', t.t_start)                         "+
			 "                                    AS i_startUnixtime,"+
			 "       strftime('%s', COALESCE(t.t_end, DATETIME('now')))"+ 
			 "                                    AS i_endUnixtime,"+
			 "       t.t_end                      AS t_end," +
			 "       t.v_note                     AS v_note," +
			 "       COALESCE(p.v_name, '')       AS v_projectName," +
			 "       p.i_tmw_projects_id          AS i_tmw_projects_id" +
			 "  FROM tmw_times t" + 
			 "  LEFT JOIN tmw_projects p" +
			 "    ON (t.i_tmw_projects_id = p.i_tmw_projects_id)" +
			 " WHERE DATETIME(t.t_Start, 'localtime')"+
			 "       BETWEEN '" + dateStartStr + " 00.00.00' AND '" + dateEndStr + " 00:00:00'" +
			 " ORDER BY 2;");
		Mojo.Log.info("SELECT: %j", sql); 

  	  	tx.executeSql
			(sql, 
	    	 [], 	
			 function(tx, result)
			 {
			 	Mojo.Log.info("Result:" + Object.toJSON(result.rows));
				
			 	callbackPI(dateStartPI, result);
			 }.bind(this),
			 function(tx, error)
			 {
				Mojo.Log.error("getDayData:" + error.message);
			 }.bind(this));
	});
}
	
	
/* =======================================================================
 * checkIn
 * =======================================================================
 */
tmwDatabase.prototype.checkIn = function()
{
	
	Mojo.Log.info("tmwDatabase.checkIn");
	tmwGL.inOut = 'in';	
    var now = new Date();
	var currentTimestamp = now.getTime() / 1000;
    new Date();
    
	// Insert record
	var sqlCmd = ('INSERT INTO tmw_times ' +
  				  '       (t_Start, '+
				  '        t_End,'+
				  '        i_tmw_projects_id' +
				  '       )'+
				  '       VALUES'+  
				  "       (datetime(?, 'unixepoch'),"+
				  '        NULL,' +
				  '        ?' +
				  ');');
	Mojo.Log.info(sqlCmd);
				  
	this.db.transaction(function (tx) 
	{ 
		tx.executeSql(sqlCmd, [currentTimestamp, prefsGL.defaultCategoryId],
		function(tx, result) 
	    {	
			Mojo.Log.info("Insert: " + result);
		}, 
		function(tx, error) 
		{		
			Mojo.Log.error("checkin: "+error.message)
       	}
       	);
	});
}
	

/* =======================================================================
 * checkOut
 * =======================================================================
 */
tmwDatabase.prototype.checkOut = function(callbackPI)
{
	Mojo.Log.info("tmwDatabase.checkOut");
	tmwGL.inOut = 'out';		

	// Insert record
				  
	this.db.transaction(function (tx) 
	{ 
		var sqlCmd = ("SELECT t.i_tmw_times_id, "+
					  "       t.i_tmw_projects_id,"+
					  "       t.v_note,"+
					  "       p.v_name AS v_projectName,"+
		   	          "       strftime('%s', DATETIME(t.t_start)) as i_startUnixTime"+
				  	  "  FROM tmw_times t"+
					  "  JOIN tmw_projects p"+
					  "    ON (t.i_tmw_projects_id = p.i_tmw_projects_id)"+
				  	  " WHERE i_tmw_times_id = "+
				  	  "       (SELECT MIN(t1.i_tmw_times_id)"+
				  	  "          FROM tmw_times t1"+
                      "          JOIN tmw_projects p1"+
                      "            ON (t1.i_tmw_projects_id = p1.i_tmw_projects_id)"+
				  	  "         WHERE t1.t_End IS NULL);");
		Mojo.Log.info(sqlCmd);
					  
		tx.executeSql(sqlCmd, [],
		function(tx, result) 
    	{		
			var row = result.rows.item(0);
			var id = row['i_tmw_times_id'];
			var startTime = new Date(row['i_startUnixTime']*1000);
			var endTime   = new Date();
			
			// We are on another day
			if((startTime.getDate()     != endTime.getDate()  ||
			    startTime.getMonth()    != endTime.getMonth() ||
			    startTime.getFullYear() != endTime.getFullYear()) &&
				prefsGL.nightShift == false)
			{
			   	endTime = new Date(startTime);
				endTime.setHours(23, 59, 59, 999);
			}
			
			var dbEndTime = parseInt(endTime.getTime() / 1000, 10);
			
			var sqlCmd = ("UPDATE tmw_times SET" +
						  "       t_End = DATETIME(?, 'unixepoch')" +
						  " WHERE i_tmw_times_id = ?;");
			Mojo.Log.info(sqlCmd);
				  
			tx.executeSql(sqlCmd, [dbEndTime, id],
			function(tx, result) 
    		{
				if(callbackPI)
				{
					callbackPI(id, startTime, endTime, row);
				}
			}.bind(this),		
			function(tx, error) 
			{
				Mojo.Log.error("checkOut update: " + error.message);
        	}.bind(this));
		}, 
		function(tx, error) 
		{
			Mojo.Log.error("checkOut select: "+error.message);
        }.bind(this));
	}.bind(this));	
}
	

/* =======================================================================
 * checkTimes
 * =======================================================================
 */
tmwDatabase.prototype.checkTimes = function(id, dateStart, dateEnd) {
	Mojo.Log.info("tmwDatabase.checkTimes");
	
	var problem = "";
	
	if(dateStart > dateEnd) {
		problem = $L("Start must be before end");
	}
	
	return problem;
}


/* =======================================================================
 * save TMW entry
 * =======================================================================
 */
tmwDatabase.prototype.save = function(id, dateStart, dateEnd, note, categoriesId)
{
	Mojo.Log.info("tmwDatabase.save");

	var startDateInSecs = dateStart.getTime() / 1000;
	var endDateInSecs;
    var sqlCmd          = "";
	
	if(dateEnd != null)
	{
		endDateInSecs = dateEnd.getTime() / 1000;
	}
	else
	{
		endDateInSecs = null;
	}
	
	if(categoriesId == 0)
	{
		categoriesId = prefsGL.defaultCategoryId;
	}

    if(id == 0)
	{
		sqlCmd = ("INSERT INTO tmw_times " +
  				  "       (t_Start, "+
				  "        t_End, "+
				  "        i_tmw_projects_id," +
				  "        v_note" +
				  "       )"+
				  "VALUES"+
				  "       (datetime(?, 'unixepoch')," +
				  "        datetime(?, 'unixepoch')," +
				  "        ?," +
				  "        ?" +
				  '       );' +
				  'GO;');
	
		this.db.transaction(function (tx) 
		{ 
			tx.executeSql(sqlCmd, [startDateInSecs, endDateInSecs, categoriesId, note],
			function(tx, result) 
    		{	
				Mojo.Log.info("Update: " + result);
			}, 
			function(tx, error) 
			{
				Mojo.Log.error("save entry: "+error.message);
   	     	});
		});	
	}
	else
	{
		// Alter record
		sqlCmd = ("UPDATE tmw_times SET" +
				  "       t_start = datetime(?, 'unixepoch'),"  +
				  "       t_End   = datetime(?, 'unixepoch'),"  +
				  "       i_tmw_projects_id = ?," +
				  "       v_note  = ?" +
				  " WHERE i_tmw_times_id = ?;" +
			  	  "GO;");
				  
		this.db.transaction(function (tx) 
		{ 
			tx.executeSql(sqlCmd, [startDateInSecs, endDateInSecs, categoriesId, note, id],
			function(tx, result) 
    		{	
				Mojo.Log.info("Update: " + result);
			}, 
			function(tx, error) 
			{
				Mojo.Log.error("update entry: "+error.message);
       		});
		});	
	}
	Mojo.Log.info(sqlCmd);
				  
}
	

/* =======================================================================
 * save Category
 * =======================================================================
 */
tmwDatabase.prototype.saveCategory = function(id, name, callbackPI)
{
	Mojo.Log.info("tmwDatabase.saveCategory");
    var sqlCmd          = "";
	
    if(id <= 0)
	{
		if(id < 0)
		{
			id = -id;
		}
		else
		{
			id = null;
		}
		
		sqlCmd = ("INSERT INTO tmw_projects " +
  				  "       (v_name,"+
				  "        i_tmw_projects_id"+
				  "       )"+
				  "VALUES"+
				  "       (?, ?);" +
				  "");
	}
	else
	{
		// Alter record
		sqlCmd = ("UPDATE tmw_projects SET" +
				  "       v_name = ?"  +
				  " WHERE i_tmw_projects_id = ?;"+
				  "");
	}
	
	Mojo.Log.info(sqlCmd);
	this.db.transaction(function (tx) 
	{ 
		tx.executeSql(sqlCmd, [name, id],
		function(tx, result) 
    	{	
			if(prefsGL.defaultCategoryId == id)
			{
				prefsGL.defaultCategoryName = name;
			}
			
            // Get new category ID
            if(id == null)
            {
                var sql = ("select last_insert_rowid() AS i_id;");
           
                tx.executeSql
                    (sql, 
                     [], 
                    function(tx, result)
                    {
                        if (result.rows.item(0)['i_id'] != null) 
                        {
                            prefsGL.categoriesFilter = prefsGL.categoriesFilter +
                                "," + result.rows.item(0)['i_id'];
                        }
                    }, 
                    function(tx, error) 
                    {
                        Mojo.Log.error("update category"+error.message);
                    }
                );   
            }
            
			if(callbackPI != undefined)
			{
				callbackPI();
			}
		}, 
		function(tx, error) 
		{
			Mojo.Log.error("saveCategory: "+error.message)
        });
	});	
	
}
	

	
/* =======================================================================
 * remove --- remove an entry
 * =======================================================================
 */
tmwDatabase.prototype.remove = function(id)
{
	
	Mojo.Log.info("tmwDatabase.delete");
	
	// delete record
	var sqlCmd = ("DELETE FROM tmw_times " +
 				  "  WHERE i_tmw_times_id = ?;" +
				  "GO;");
	Mojo.Log.info(sqlCmd);
				  
	this.db.transaction(function (tx) 
	{ 
		tx.executeSql(sqlCmd, [id],
		function(tx, result) 
	    {	
			Mojo.Log.info("Delete: " + result);
		}, 
		function(tx, error) 
		{
        	Mojo.Log.error("Delete entry: "+error.message);
       	});
	});
}
	
/* =======================================================================
 * removeCategory --- remove a Category
 * =======================================================================
 */
tmwDatabase.prototype.removeCategory = function(id, callbackPI)
{
	
	Mojo.Log.info("tmwDatabase.delete");
	
	// delete record
	var sqlCmd = ("DELETE FROM tmw_projects " +
 				  "  WHERE i_tmw_projects_id = ? AND"+
				  "        i_tmw_projects_id NOT IN "+
				  "        (SELECT DISTINCT i_tmw_projects_id FROM tmw_times);" +
				  "GO;");
	Mojo.Log.info(sqlCmd);
				  
	this.db.transaction(function (tx) 
	{ 
		tx.executeSql(sqlCmd, [id],
		function(tx, result) 
	    {	
			Mojo.Log.info("Delete: " + result);
			callbackPI("");
		}, 
		function(tx, error) 
		{
			Mojo.Log.error("Delete category: "+error.message);
       		callbackPI(error.message);
       	});
	});
}
	
	
/* =======================================================================
 * getInOrOut
 * =======================================================================
 */
tmwDatabase.prototype.getInOrOut = function(callbackPI)
{		
	Mojo.Log.info("tmwDatabase.getInOrOut");

    this.db.transaction(function (tx) 
	{ 
		var sql = ("SELECT COUNT(*) AS i_Count"+
				   "  FROM tmw_times" + 
		  		   " WHERE t_End IS NULL; GO;");
		   
		Mojo.Log.info("SELECT:" + sql); 

		tx.executeSql
			(sql, 
   	  		 [], 
			function(tx, result)
			{
				if (result.rows.item(0)['i_Count'] > 0) 
				{
					tmwGL.inOut = 'in';
				}
				else 
				{
					tmwGL.inOut = 'out';
				}
			
				callbackPI();
			}, 
			function(tx, error) 
		 	{
        		Mojo.Log.error("getInOrOut:"+error.message);
         	}
		);
	});
}
	
    
/* =======================================================================
 * getDashboardMessage
 * =======================================================================
 */
tmwDatabase.prototype.getDashboardMessage = function(callbackPI)
{       
    Mojo.Log.info("tmwDatabase.getDashboardMessage");

    this.db.transaction(function (tx) 
    { 
        var sql =     
             "SELECT strftime('%s',t.t_start) AS i_start, " +
             "       strftime('%s',t.t_end)   AS i_end," +
             "       strftime('%s', COALESCE(t.t_end, t.t_start))"+ 
             "                                AS i_unixtime,"+
             "       p.v_name AS v_projectName"+
             "  FROM tmw_times t" +
             "  LEFT JOIN tmw_projects p"+
             "    ON (t.i_tmw_projects_id = p.i_tmw_projects_id)"+
             " WHERE DATETIME(t.t_Start, 'localtime') <= DATETIME('now', 'localtime')"+
             "   AND (DATETIME(t.t_End, 'localtime') <= DATETIME('now', 'localtime') OR"+
             "        t.t_End IS NULL)"+
             " ORDER BY 3 DESC" +
             " LIMIT 1";

        Mojo.Log.info("SELECT: %j", sql); 

        tx.executeSql
            (sql, 
             [], 
            function(tx, result)
            {
                if(result.rows.length == 0)
                {
                    callbackPI($L("No data"), "");
                }
                else
                { 
                    
                    var row = result.rows.item(0);
                    var category = row.v_projectName;
                    var inOut = "";
                    var lastTime = row.i_unixtime;
                    var lastDate = new Date(lastTime*1000);
                    var lastStr = Mojo.Format.formatDate(lastDate, {
                            time: 'short',
                            date: 'short',
                            countryCode: ''
                        });
    
                    if (row.i_end === null) 
                    {
                        inOut = $L('In');
                    }
                    else 
                    {
                        inOut = $L('Out');
                        category = prefsGL.defaultCategoryName;
                    }
                
                    callbackPI($L("Category") + ": " + category, 
                        inOut + " " +$L("since") + ": " + lastStr);
                
                }
            }, 
            function(tx, error) 
            {
                Mojo.Log.error("Error: "+error.message);
            }
        );
    });
}
    
	
/* =======================================================================
 * errorHandler
 * =======================================================================
 */
tmwDatabase.prototype.errorHandler = function(message)
{
	Mojo.Log.info("tmwDatabase.errorHandler");
	Mojo.Log.info("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX: Sql-Error: " + message);
	Mojo.Controller.errorDialog(message);
}


startOfDay = function(datePI)
{
	result = datePI;
	
	result.setHours(0);
	result.setMinutes(0);
	result.setSeconds(0);
	result.setMilliseconds(0);
	
	return result;
}

/* =======================================================================
 * dateToYYYYMMDD - format a date
 * =======================================================================
 */
dateToYYYYMMDD = function(date, delimiter)
{
	// Mojo.Log.info("dateToYYYYMMDD:" + date);
	
	var year  = date.getYear() + 1900;
	var month = date.getMonth() + 1;
	var day   = date.getDate();
	
	month = month < 10? "0" + month: month;
	day   =	day < 10? "0" + day: day;
	
	var result = year + delimiter + month + delimiter + day;
	
	return result;
}


/* =======================================================================
 * durationToHHMM - format a duration
 * =======================================================================
 */
durationToHHMM = function(durationInSec)
{
	// Mojo.Log.info("dateToYYYYMMDD:" + date);
	
	var durationInMin = parseInt(durationInSec / 60, 10);
	var durationInHr = parseInt(durationInMin / 60, 10);
	
	var result = parseInt(durationInHr) + ":" + 
		((durationInMin%60) < 10? "0": "") + (durationInMin % 60);

	return result;
}
