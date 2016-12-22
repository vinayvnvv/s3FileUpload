var app = angular.module('app', ['s3FileUpload']);

app.controller('main', ['$scope', function($scope){

	console.log("main controller called!!")
	$scope.beforeUpload = function (status) {
		console.log("before upload called!")
		console.log(status)
	}

	$scope.errorUpload = function (x, status) {
		console.log("error upload called!")
		console.log(status)
	}

	$scope.succesUpload = function (x, status) {
		console.log("sucess upload called!")
		console.log(status)
	}
	
}]);