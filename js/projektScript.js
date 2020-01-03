
var events_array = [];
var clickedEvent;

$(document).ready(function () {
    var $confirmButton = $('#btn-confirm');
    var $modal = $('.modal');
    var newEvent = {};

    addLocalSavedEvents();

    $('#naviButtons i').click({param1: $(this).parentElement}, navigationClickHandler);


    $confirmButton.on('click', function (e) {
        var usage = $('.modal')[0].attributes.usage.value;

        if (usage === "add") {
            addNewEvent(newEvent, $modal);
        } else if (usage === "edit") {
            editEvent(newEvent, $modal);
        }
    });
});


function navigationClickHandler(parent) {
    $('#mainContent').children().remove();
    $('#naviButtons li').removeClass('buttonClicked');
    parent.currentTarget.parentElement.className += 'buttonClicked';
    $('#currentTabText').text(parent.currentTarget.title);

    if (parent.currentTarget.title === "Calendar") {

        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();

        var $modal = $('.modal');
        var $close = $('.btn-close');

        var calendarEl = $('<div/>').attr('id', 'calendar');
        $('#mainContent').append(calendarEl);
        $('#calendar').fullCalendar({
            plugins: ['interaction', 'dayGrid', 'moment'],
            height: 'parent',
            header: {
                left: 'month agendaWeek agendaDay',
                center: 'today prev,next',
                right: 'title'
            },
            editable: true,
            selectable: true,
            selectHelper: true,
            eventLimit: true,
            events: events_array,
            select: function (start, end) {
                if ($('#delete-button').length > 0) {
                    $('#delete-button').remove();
                }
                $('.modal').attr('usage', 'add');
                var windowHeight = $(window).height(),
                    windowWidth = $(window).width(),
                    modalWidth = windowWidth / 4;

                $('.modal-header').removeClass('modal-edit');

                $('#newEventTitle')[0].value = '';

                $('.modal-title').text('Add New Event');

                $modal.show();

                $close.on('click', function () {
                    $('.modal').hide();
                });

                $('#newEventStartDate')[0].value = moment(start).format();
                $('#newEventEndDate')[0].value = moment(end).format();
                $('#newEventColor')[0].value = "#3eb7c9";
                $('#newEventTextColor')[0].value = "#ffffff";
            },

            eventDrop: function (event, delta, revertFunc) {
                var eventArrayId = event.id - 1;
                events_array[eventArrayId].start = event.start;
                events_array[eventArrayId].end = event.end;

                $('#calendar').fullCalendar('updateEvent', event);
            },

            eventClick: function (event, element) {
                $('.modal').attr('usage', 'edit');
                $('.modal-title').text('Edit Event: ' + event.title);
                $('.modal-header').addClass('modal-edit');

                if ($('#delete-button').length === 0) {
                    var deleteButton = $('<button>').attr('id', 'delete-button')
                        .text('Delete')
                        .addClass('btn')
                        .click(function () {
                            $('#calendar').fullCalendar('removeEvents', event._id);
                            events_array.splice(event.id - 1, 1);
                            $modal.hide();
                            $(this).remove();
                        });
                    $('.modal-footer').append(deleteButton);
                }

                $close.on('click', function () {
                    $('.modal').hide();
                });

                $('#newEventTitle')[0].value = event.title;
                $('#newEventStartDate')[0].value = moment(event.start).format('YYYY-MM-DD');
                $('#newEventEndDate')[0].value = moment(event.end).format('YYYY-MM-DD');
                $('#newEventColor')[0].value = event.color;
                $('#newEventTextColor')[0].value = event.textColor;
                clickedEvent = event;
                $modal.show();
            }
        });
    } else if (parent.currentTarget.title === "Appointments") {
        var calendarEl = $('<div/>').attr('id', 'calendar');
        $('#mainContent').append(calendarEl);
        $('#calendar').fullCalendar({
            plugins: ['list'],
            height: 'parent',
            defaultView: 'listWeek',
            events: events_array
        });
    }
}

function getNewEventValues(newEvent) {
    var newEventStartTime = $('#newEventStartTime')[0].value;
    var newEventEndTime = $('#newEventEndTime')[0].value;

    newEvent.title = $('#newEventTitle')[0].value;
    newEvent.start = $('#newEventStartDate')[0].value;
    newEvent.end = $('#newEventEndDate')[0].value;
    newEvent.color = $('#newEventColor')[0].value;
    newEvent.textColor = $('#newEventTextColor')[0].value;
    newEvent.allDay = false;
    newEvent.id = events_array.length + 1;

    if (newEventStartTime) {
        newEvent.start += 'T' + newEventStartTime;
    }

    if (newEventEndTime) {
        newEvent.end += 'T' + newEventEndTime;
    }

    return newEvent;
}

function addNewEvent(newEvent, $modal) {
    newEvent = getNewEventValues(newEvent);

    events_array.push({
        id: newEvent.id,
        title: newEvent.title,
        start: newEvent.start,
        end: newEvent.end,
        allDay: newEvent.allDay,
        color: newEvent.color,
        textColor: newEvent.textColor
    });

    $('#calendar').fullCalendar('renderEvent', newEvent);
    $modal.hide();
}

function editEvent(newEvent, $modal) {
    newEvent = getNewEventValues(newEvent);

    clickedEvent.title = newEvent.title;
    clickedEvent.start = newEvent.start;
    clickedEvent.end = newEvent.end;
    clickedEvent.color = newEvent.color;
    clickedEvent.textColor = newEvent.textColor;

    events_array[clickedEvent.id - 1].title = newEvent.title;
    events_array[clickedEvent.id - 1].start = newEvent.start;
    events_array[clickedEvent.id - 1].end = newEvent.end;
    events_array[clickedEvent.id - 1].color = newEvent.color;
    events_array[clickedEvent.id - 1].textColor = newEvent.textColor;

    $('#calendar').fullCalendar('updateEvent', clickedEvent);
    $modal.hide();
}

function addLocalSavedEvents () {
    $.ajax({
       type: "GET",
       url: "./json/events.json",
       dataType: "json",
       success: function (data) {
           var localSavedEventsList = data.events;

           $.each(localSavedEventsList, function (index, element) {
               events_array.push(element);
           });
       }
    });
}