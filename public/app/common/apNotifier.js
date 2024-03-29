angular.module('app').value('apToastr', toastr);

angular.module('app').factory('apNotifier', function (apToastr) {
    return {
        notify: function (msg) {
            apToastr.success(msg);
            console.log(msg);
        },

        error: function (msg) {
            apToastr.error(msg);
            console.log(msg);
        }
    }
})