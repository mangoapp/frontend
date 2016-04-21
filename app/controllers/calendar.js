module.exports = function($scope,$http,API,auth,$window,$routeParams,$timeout,$interval,uiCalendarConfig) {
    var stopCourses;
    $scope.globalCalendar = true;
    var events = [];
    $scope.eventsSource = [events];

    if (auth.getToken()) {
        $scope.token = auth.getToken();
        $scope.loggedin = true;
    } else {
        $scope.loggedin = false;
        $window.location.href = './#!/sign-in';
    }
    $scope.getUser = function() {
        var tok = auth.getToken();
        var ptok = auth.parseJwt(tok);
        for (var i = 0; i < ptok.roles.length; i++) {
            if (ptok.roles[i] == "course_admin") {
                $scope.isAdmin = true;
            }
        }
    };

    $scope.getCourseWithID = function(id) {
        if ($scope.courses) {
            for (var i = 0; i < $scope.courses.length; i++) {
                if ($scope.courses[i].id == id) {
                    $scope.noCourses = false;
                    $scope.courseID = $scope.courses[i].id;
                    $scope.courseName = $scope.courses[i].name;
                    $scope.userRole = $scope.courses[i].role_name;
                    $scope.userDisplayRole = $scope.courses[i].role_display_name;
                    $scope.courseData = true;
                    if ($scope.userRole == 'course_admin') {
                        $scope.isInstructor = true;
                    }
                }
            }
            if ($scope.courseData) {
                $interval.cancel(stopCourses);
            }
        }
    };

    $scope.handleRequest = function(res) {
        $scope.noCourses = true;
        $scope.message = res.data.message;
    };

    $scope.getCourses = function() {
        var req = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer: ' + $scope.token
            },
            url: API + '/users/sections'
        };
        $http(req).then(function(res) {
            $scope.courses = res.data;
            $scope.courseLength = res.data.length;
            $scope.courseCount = 1;
        },$scope.handleRequest);
    };

    $scope.getEvents = function() {
        if ($scope.globalCalendar) {
            $scope.getEventsGlobal();
            $scope.calendarLink = API + '/calendar/' + auth.parseJwt($scope.token).uuid;
        } else {
            $scope.getEventsByID($routeParams.courseNumber);
            $scope.calendarLink = API + '/calendar/section/' + $routeParams.courseNumber;
        }
        console.log($scope.calendarLink);
    };

    $scope.getEventsGlobal = function() {
        var req = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer: ' + $scope.token
            },
            url: API + '/users/events'
        };
        console.log("uuid:" + auth.parseJwt($scope.token).uuid);
        $http(req).then(function(res) {
            $scope.parseEvents(res.data);
        },$scope.handleRequest);
    };

    $scope.getEventsByID = function(id) {
        var req = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer: ' + $scope.token
            },
            url: API + '/sections/' + id + '/events'
        };
        $http(req).then(function(res) {
            $scope.parseEvents(res.data);
        },$scope.handleRequest);
    };

    $scope.parseEvents = function(rawEvents) {
        for (var i = 0; i < rawEvents.length; i++) {
            events[i] = {};
            events[i].title = rawEvents[i].title;
            events[i].allday = false;
            events[i].start = rawEvents[i].begin;
            events[i].end = rawEvents[i].end;
        }
        console.log(events);
    };

    $scope.instructorAnnounceToggle = function() {
        $scope.instructorToggle = $scope.instructorToggle === false ? true: false;
    };

    $scope.uiConfig = {
        calendar: {
            editable: false,
            header: {
                left: 'prev,next today',
                center: 'title',
                right: 'month,agendaWeek,agendaDay'
            }
        }
    };

    $scope.$on('$viewContentLoaded', function() {
        if ($routeParams.courseNumber) {
            $scope.globalCalendar = false;
        }
        $scope.getCourses();
        stopCourses = $interval(function() {
            if ($routeParams.courseNumber) {
                $scope.getCourseWithID($routeParams.courseNumber);
            }
        }, 50, 50);
        $scope.getUser();
        $scope.instructorToggle = true;
        $scope.getEvents();
    });
};
