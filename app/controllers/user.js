module.exports = function($scope) {

  	$scope.signin = function() {
		var formData = {
			email: $scope.email,
			password: $scope.password
		};
	};
	$scope.signup = function() {
		var formData = {
			email: $scope.email,
			password: $scope.password,
			first_name: $scope.first_name,
			last_name: $scope.last_name
		};
	};
	$scope.retrieve = function() {
		var formData = {
			email: $scope.email
		};
	};

  console.log("required!");
};
