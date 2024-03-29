angular.module('app', ['ngResource', 'ngRoute']);

angular.module('app').config(function ($routeProvider, $locationProvider) {
    var routeRoleChecks = {
        admin: {auth: function (apAuth) {
            return apAuth.authorizeCurrentUserForRoute('admin');
        }},
        teacher: {auth: function(apAuth) {
            return apAuth.authorizeCurrentUserForRoute('teacher');
        }},
        user: {auth: function (apAuth) {
            return apAuth.authorizeAuthenticatedUserForRoute();
        }}
    }

    $locationProvider.html5Mode(true);
    $routeProvider
        .when('/', { templateUrl: '/partials/main/main', controller: 'apMainCtrl'})
        .when('/problems', {templateUrl: '/partials/problems/problems', 
                controller: 'apGetDataCtrl', resolve: routeRoleChecks.user})
        .when('/modeling', {templateUrl: '/partials/modules/modeling/modeling', 
                controller: 'apModelingCtrl', resolve: routeRoleChecks.user})
        .when('/simplex-phase-2-s-b-s', {templateUrl: '/partials/modules/simplex-phase-2-s-b-s/simplex-phase-2-s-b-s', 
                controller: 'apSimplexPhase2SBSCtrl', resolve: routeRoleChecks.user})
        .when('/simplex-phase-2-calc', {templateUrl: '/partials/modules/simplex-phase-2-calc/simplex-phase-2-calc', 
                controller: 'apSimplexPhase2CalcCtrl', resolve: routeRoleChecks.user})
        .when('/admin/users', { templateUrl: '/partials/admin/user-list',
            controller: 'apUserListCtrl', resolve: routeRoleChecks.admin
        })
        .when('/signup', { templateUrl: '/partials/account/signup',
            controller: 'apSignupCtrl'})
        .when('/profile', { templateUrl: '/partials/account/profile',
            controller: 'apProfileCtrl', resolve: routeRoleChecks.user })
        .when('/problems', {templateUrl: '/partials/problems/problems',
            controller: 'apGetDataCtrl', resolve: routeRoleChecks.user })
        .when('/classes', {templateUrl: '/partials/classes/class-list',
            controller: 'apClassListCtrl', resolve: routeRoleChecks.user})
        .when('/create-class', {templateUrl: '/partials/classes/create-class',
            controller: 'apCreateClassCtrl', resolve: routeRoleChecks.teacher})
        .when('/manage-class-students/:class', {templateUrl: '/partials/classes/manage-class-students',
            controller: 'apManageClassStudentsCtrl', resolve: routeRoleChecks.teacher});;

});

angular.module('app').run(function ($rootScope, $location) {
    $rootScope.$on('$routeChangeError', function (evt, current, previous, rejection) {
        if (rejection === 'not authorized') {
            $location.path('/');
        }
    })
})
