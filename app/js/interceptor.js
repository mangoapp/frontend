module.exports = function(API, auth) {
	return {
    // automatically attach Authorization header
    	request: function(config) {
	  		var token = auth.getToken();
	  		if(config.url.indexOf(API) === 0 && token) {
	    		config.headers.Authorization = 'Bearer ' + token;
	  		}

	  		return config;
		},

    // If a token was sent back, save it
	    response: function(res) {
		  if(res.config.url.indexOf(API) === 0 && res.data.token) {
		    auth.saveToken(res.data.token);
		  }

		  return res;
		}
	};
};