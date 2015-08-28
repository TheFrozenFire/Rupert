<!doctype html>
<html>
    <head>
        <base href="/">
    </head>
    <body>
        <div>
            <p id="status"></p>
        </div>
    	<script src="/js/speech.js"></script>
    	<script>
    	    (function() {
    	        'use strict';
    	        
        	    var speechEngine;
        	    var init = function() {
        	        var userConfig = {},
        	            statusElement = document.getElementById('status');
        	    
        	        if(speechEngine != undefined) {
        	            speechEngine.shutdown();
        	        }
        	        
        	        userConfig.language = 'en-CA';
        	        userConfig.debug = true;
        	        
        	        userConfig.callbacks = {
        	            probableInitialMatch: function(result) {
        	                statusElement.innerHTML = 'Hrmm...';
        	            },
        	            initialMatch: function(result) {
        	                statusElement.innerHTML = 'Oh hey there!';
        	            },
        	            commandMatch: function(command) {
        	                statusElement.innerHTML = 'Pending command: ' + speechEngine.pendingCommand;
        	            },
        	            executeCommand: function(command) {
        	                var request;
        	            
        	                statusElement.innerHTML = 'Executing command: ' + command;
        	                
        	                request = new XMLHttpRequest();
        	                request.open('POST', '/execute.php?command=' + encodeURIComponent(command));
        	                request.send();
        	            }
        	        };
        	    
        	        speechEngine = new speech(userConfig);
        	        speechEngine.listenForInitialCommand();
        	    };
        	    
        	    init();
    	    }) ();
    	</script>
    </body>
</html>
