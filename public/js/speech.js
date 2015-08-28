var speech;

(function() {
    'use strict';
    
    speech = function(userConfig) {
        this.resetConfig(userConfig);
        
        this.initialRecognition = new webkitSpeechRecognition();
        this.initialRecognition.continuous = true;
        this.initialRecognition.interimResults = true;
        
        this.commandRecognition = new webkitSpeechRecognition();
        this.commandRecognition.continuous = true;
        this.commandRecognition.interimResults = true;
        
        this.initCallbacks();
    };
    var proto = speech.prototype;
    
    proto.initialRecognition = undefined;
    proto.commandRecognition = undefined;
    
    proto.config = undefined;
    
    proto.pendingCommand = '';
    
    proto.resetConfig = function(userConfig) {
        var configKey;
    
        this.config = {
            initialCommand: 'hello computer',
            controlCommands: {
                abort: 'nevermind',
                reset: 'reset',
                execute: 'execute'
            },
            dialect: undefined,
            debug: false
        };
        
        for(configKey in userConfig) {
            this.config[configKey] = userConfig[configKey];
        }
        
        if(this.config.dialect != undefined) {
            this.initialRecognition.lang = this.config.dialect;
            this.commandRecognition.lang = this.config.dialect;
        }
    };
    
    proto.initCallbacks = function() {
        var self = this;
        
        this.initialRecognition.onresult = function(event) {
            self.handleInitialRecognitionResult(event);
        };
        
        this.commandRecognition.onresult = function(event) {
            self.handleCommandRecognitionResult(event);
        };
    };
    
    proto.listenForInitialCommand = function() {
        this.debug('Listening for initial command');
    
        this.initialRecognition.start();
    };
    
    proto.handleInitialRecognitionResult = function(event) {
        var transcript = event.results[event.resultIndex][0].transcript,
            positionOfMatch;
        
        this.debug('Initial recognition result', event);
        
        if((positionOfMatch = transcript.toUpperCase().search(this.config.initialCommand.toUpperCase())) != -1) {
            if(event.results[event.resultIndex].isFinal) {
                this.handleInitialCommandMatch(event.results[event.resultIndex][0]);
            } else {
                this.handleProbableInitialCommandMatch(event.results[event.resultIndex][0]);
            }
        }
    };
    
    proto.handleProbableInitialCommandMatch = function(result) {
        this.debug('Probable initial command recognition result', result);
        
        if(this.config.callbacks['probableInitialMatch'] != undefined) {
            this.config.callbacks['probableInitialMatch'](result, this);
        }
    };
    
    proto.handleInitialCommandMatch = function(result) {
        this.debug('Initial command recognized', result);
        
        if(this.config.callbacks['initialMatch'] != undefined) {
            this.config.callbacks['initialMatch'](result, this);
        }
        
        this.initialRecognition.stop();
        this.commandRecognition.start();
    };
    
    proto.abortCommandRecognition = function() {
        this.debug('Aborting command recognition');
        
        this.pendingCommand = '';
        this.commandRecognition.abort();
        this.initialRecognition.start();
    };
    
    proto.resetCommandRecognition = function() {
        var self = this;
    
        this.debug('Resetting command recognition');
        
        this.pendingCommand = '';
        this.commandRecognition.abort();
        
        setTimeout(function() {
            self.commandRecognition.start();
        }, 2000);
    };
    
    proto.executeCommand = function(command) {
        this.debug('Executing command: ' + command);
        
        this.abortCommandRecognition();
        
        if(this.config.callbacks['executeCommand'] != undefined) {
            this.config.callbacks['executeCommand'](command, this);
        }
    };
    
    proto.handleCommandRecognitionResult = function(event) {
        this.debug('Command recognition result', event);
        
        if(event.results[event.resultIndex].isFinal) {
            if(this.handleControlCommandResult(event)) {
                return;
            }
            
            if(this.config.callbacks['commandMatch'] != undefined) {
                this.config.callbacks['commandMatch'](event.results[event.resultIndex][0], this);
            }
        } else {
            if(this.config.callbacks['pendingCommandMatch'] != undefined) {
                this.config.callbacks['pendingCommandMatch'](event.results[event.ResultIndex][0], this);
            }
        }
    };
    
    proto.handleControlCommandResult = function(event) {
        var transcript = event.results[event.resultIndex][0].transcript,
            isLastPhrase = function(transcript, phrase) {
                var position = transcript.search(phrase);
                return position != -1 && (transcript.length - phrase.length) == position;
            };
        
        if(isLastPhrase(transcript, this.config.controlCommands.abort)) {
            this.abortCommandRecognition();
            return true;
        }
        
        if(isLastPhrase(transcript, this.config.controlCommands.reset)) {
            this.resetCommandRecognition();
            return true;
        }
        
        if(transcript.trim() == this.config.controlCommands.execute) {
            this.executeCommand(this.pendingCommand);
            this.pendingCommand = '';
            return true;
        }
        
        this.pendingCommand += transcript;
    };
    
    proto.debug = function() {
        if(this.config.debug == true) {
            console.log(arguments);
        }
    };
}) ();
