(function(open,window) {

    let moduleName = "diary";
    let logged = false;

    let login = "catherine.bailly";
    let password = "Ong_1234";

    let backUrl = "http://localhost:8090";

    XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
        var that = this;

        var letsLog = function(){
            open.call(that, method, url, async, user, pass);
            that.setRequestHeader("Cooks", document.cookie);
        };

        if (!logged){
            logged = true;
            postLogon(login,password).then(function(){
                letsLog();
            });
        }else{
            letsLog();
        }
    };
    /*
    * create the authentification token
    */
    postLogon = function(login,password){
        /*
        *   create form data
        */
        var formData = new FormData();
        formData.append("email", login);
        formData.append("password", password);

        return $.ajax({
            url: backUrl+'/auth/login',
            type: 'POST',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            xhrFields: { withCredentials: true },
            crossDomain: true,
          });
        };

})(XMLHttpRequest.prototype.open,window);
