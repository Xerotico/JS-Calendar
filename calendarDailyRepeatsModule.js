function Event(name, dateTime, callback){
    this.name = name;
    this.dateTime = dateTime;
    this.callback = callback;

    this.repeats = [];

    this.id = undefined;
    this.timeout = undefined;
}

function getNextExecuteDate (event){
    var nextExecuteDate = new Date(event.dateTime);

    if(event.repeats === undefined || event.repeats.length == 0){
        return nextExecuteDate;
    } else{
        var currentDate = new Date();
        if(event.repeats.indexOf(currentDate.getDay()) != -1){
            nextExecuteDate.setFullYear(currentDate.getFullYear());
            nextExecuteDate.setMonth(currentDate.getMonth());
            nextExecuteDate.setDate(currentDate.getDate());

            if(event.dateTime.getHours() > currentDate.getHours()){
                return nextExecuteDate;
            }

            if(event.dateTime.getHours() == currentDate.getHours()){
                if(event.dateTime.getMinutes() > currentDate.getMinutes()){
                    return nextExecuteDate;
                }

                if(event.dateTime.getMinutes() == currentDate.getMinutes()){
                    if(event.dateTime.getSeconds() > currentDate.getSeconds()){
                        return nextExecuteDate;
                    }

                    if(event.dateTime.getSeconds() == currentDate.getSeconds()){
                        if(event.dateTime.getMilliseconds() > currentDate.getMilliseconds())
                            return nextExecuteDate;
                    }
                }
            }
        }

        var nextExecuteDay = event.repeats[0];

        for (var repeat in event.repeats){
            if(repeat > currentDate.getDay()){
                nextExecuteDay = repeat;
                break;
            }
        }

        nextExecuteDate.setFullYear(currentDate.getFullYear());
        nextExecuteDate.setMonth(currentDate.getMonth());

        if(nextExecuteDay > currentDate.getDay()){
            nextExecuteDate.setDate(currentDate.getDate() + nextExecuteDay - currentDate.getDay());
            return nextExecuteDate;
        } else{
            nextExecuteDate.setDate(currentDate.getDate() + nextExecuteDay - currentDate.getDay() + 7);
            return nextExecuteDate;
        }
    }
}

if((typeof Calendar) !== "undefined"){
    Calendar.startEventScheduler = function(){
        var events = Calendar.getAllEvents();
        var nextExecute;

        events.filter(
            function (event){
                nextExecute = getNextExecuteDate(event) - new Date();

                return (((nextExecute <= MAX_TIMEOUT) &&
                (nextExecute > 0) &&
                (event.timeout === undefined)));
            }
        ).forEach(
            function (event){
                event.timeout = setTimeout(event.callback, nextExecute);
            }
        );
    };
    Calendar.addEvent = function (event){
        var events = Calendar.getAllEvents();
        var nextExecute = getNextExecuteDate(event) - new Date();

        if((nextExecute >= 0) && (nextExecute <= MAX_TIMEOUT)){
            event.timeout = setTimeout(event.callback, nextExecute);
        }

        event.id = events.reduce(function(maxId, currentEvent){
                return (maxId < currentEvent.id) ? currentEvent.id : maxId;
            }, 0) + 1;
        events.push(event);

        if(Calendar.isSchedulerStarted == false){
            Calendar.isSchedulerStarted = true;
            setInterval(Calendar.startEventScheduler, SCHEDULER_INTERVAL);
        }
    };
    Calendar.editEventById = function (eventId, name, date){
        var events = Calendar.getAllEvents();

        var currentEvent = events.find(function (event){
                return (event.id == eventId);
        });

        if(currentEvent != undefined){
            if(name !== undefined)
                currentEvent.name = name;

            if(date !== undefined){
                clearTimeout(currentEvent.timeout);
                currentEvent.timeout = undefined;

                currentEvent.dateTime = date;

                var nextExecute = getNextExecuteDate(currentEvent) - new Date();
                if ((nextExecute >= 0) && (nextExecute <= MAX_TIMEOUT)) {
                    currentEvent.timeout = setTimeout(currentEvent.callback, nextExecute);
                }
            }
        }
    };
} else{
    console.error("Main calendar module doesn't exists!")
}