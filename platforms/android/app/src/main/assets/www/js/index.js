function Main() {
    this.debug = true;
}

Main.prototype.Init = function(){
    if(this.debug)
        console.log("INICIANDO Home");
    this.GotoPage('home', true);
}

Main.prototype.GetContacts = function(){
    if(typeof navigator.contacts  == 'undefined')
        return true;
    else{
        // find all contacts
        var options      = new ContactFindOptions();
        options.filter   = "";
        options.multiple = true;
        // options.desiredFields = [navigator.contacts.fieldType.id];
        options.hasPhoneNumber = true;
        var fields       = [navigator.contacts.fieldType.displayName, navigator.contacts.fieldType.name];
        navigator.contacts.find(fields, this.ListContacts.bind(this), this.ErrorContacts, options);
    }
}

Main.prototype.ListContacts = function(contacts){
    if(this.debug)
        console.warn('CONTACTOS:', contacts);
    self.Utils.Alert('Contactos', 'Found ' + contacts.length + ' contacts.');

    /*const _templateHeader = `<div class="list-group">
                                <ul id="list-group-[[LETTER]]">
                                    <li class="list-group-title">[[LETTER]]</li>
                                </ul>
                            </div>`;*/

    const _templateContacto = `<li class="accordion-item">
                                    <a href="" class="item-link item-content">
                                        <div class="item-inner">
                                            <div class="item-title">[[DISPLAYNAME]]</div>
                                        </div>
                                    </a>
                                    <div class="accordion-item-content">[[PHONE-NUMBERS]]</div>
                                </li>`;
    try{
        contacts.map( (contacto) => {
            let _lettermain = contacto.displayName.toUpperCase().substr(0,1);
            if($(`#list-group-${_lettermain}`).length == 0){
                $(`#ListaContactos`).append(_templateHeader.replace(/\[\[LETTER]]/g, _lettermain));
            }

            let phoneNumbers = '<ul>';
            contacto.phoneNumbers.map(number =>{
                phoneNumbers += `<li>${number.type} - <b>${number.value}</b></li>`;
            });
            phoneNumbers += `</ul>`;

            let element = _templateContacto.replace(/\[\[DISPLAYNAME]]/g, contacto.displayName);
            element = element.replace(/\[\[PHONE-NUMBERS]]/g, phoneNumbers);

            $(`#list-group-${_lettermain}`).append(element);
        });
    }
    catch(e){console.error("EXCEPCION", e);}   
}
Main.prototype.ErrorContacts = function(){
    self.Utils.Alert("Error", 'Ha ocurrido un error al consultar los contactos.');
}
Main.prototype.JobInit = function(){
    window.plugins.fibotech.location.runService({
        time: String(self.Geolocation._PeriodTime),  //campo obligatorio
        url: self.Geolocation.urlazure, //campo obligatorio
        UserId: String(self.Rest.user),
        AppVersion: String($('#VersionApp').text()),
        Tipo: 'periodico',
        Actividad: '',
        Clave: String(self.Rest.clave),        
        header: { // agregar header si es requerido
            "Authorization" : self.Geolocation.token,
            "Content-Type": "application/json",
            "ContentType": "application/atom+xml;type=entry;charset=utf-8"
        }
    },function(err, res){
        // if(err)
            console.log('SERVICE Error:',err);
        // else
            console.log('SERVICE:',res);
    });
}
Main.prototype.JobStop = function(){
    return new Promise((resolve, reject) => {
        window.plugins.fibotech.location.stopService(function(err, res){
            if(self.Geolocation.debug){
                console.log('SERVICE RUNNING', res); // res retorna true | false
                console.log('SERVICE RUNNING ERROR', err);
            }
            if(err)
                return reject(err);
            else 
                return resolve(res);
        });
    });
}
Main.prototype.JobStatus = function(){
    return new Promise((resolve, reject) => {
        window.plugins.fibotech.location.isServiceRunning(function(err, res){
            if(self.Geolocation.debug){
                console.log('SERVICE RUNNING', res); // res retorna true | false
                console.log('SERVICE RUNNING ERROR', err);
            }
            if(err)
                return reject(err);
            else 
                return resolve(JSON.parse(res));
        });
    });
}

Main.prototype.Token = function(_is_background = false) {
    this.obteniendo = true;
    if(!_is_background){
        // self.Utils.Notification('Obteniendo Token.', 2000, '', 'info');
        self.Utils.ShowSpinner();
    }
    let _data = new FormData();
    _data.append('clave', this.clave);
    _data.append('mobile', this.mobile);
    _data.append('imei', this.imei);
    _data.append('pin', this.pin);
    _data.append('version', this.version);
    var _this = this;

    console.info("VERSION", this.version);

    return $.ajax({
        url: this.urlToken,//url del webservice
        data: _data,
        timeout: 5000,
        type: 'POST',
        dataType: 'json',
        success: function(r, status){
            console.info('RESULT', r);
            if(r.status === 'success'){
                _this.token = r.data;
                self.Utils.SetLS('__TOKEN_DIMEX', r.data);
                if(!_is_background){
                    // self.Utils.Notification('Token Obtenido.');
                }
            }
            if(r.status === 'invalid'){
                console.log("ESTATUS INVALID", r);
            }
            else {
                self.Rest.HandleTokenCode(r.code, r.message);
                Error(r.message);
                if(!_is_background){
                    // self.Utils.Notification('Error obteniendo Token', 5000, '', true);
                }
            }
                // throw r.message;
            return r;
        },
        error: function (request, status, error){
            //alert('error');
            //alert(request.responseText);
            console.warn('ERROR TOKEN GENERATED', request.responseText);
            if(!_is_background)
                self.Utils.Notification('Error conexión', 5000, '', true);
        },
        complete: function(){
            self.Utils.HideSpinner();
            this.obteniendo = false;
        }
    });
}
Main.prototype.cbWatch = function(position){
    if(self.Geolocation.debug)
        console.info("POSICION GPS", position);
    self.Utils.SetLS("__GPS_LATITUDE", position.coords.latitude);
    self.Utils.SetLS("__GPS_LONGITUDE", position.coords.longitude);
    self.Utils.SetLS("__GPS_ACCURACY", position.coords.accuracy);
}
Main.prototype.cbWatchError = function(error){
    console.error("ERROR WATCH", error)
    console.error('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
}
// ---- JOB SCHEDULER
Main.prototype.JobError = function(error){
    console.log('SchedulerPlugin error: ', error);
}
Main.prototype.JobSuccess = function(){
    console.warn("JOB SCHEDULER AT: ", new Date().toLocaleTimeString());

    self.peticion = new Peticion();
    self.peticion.SaveOnError = false;
    self.peticion.url = self.Rest.url + 'SaveData';
    self.peticion.type = "PRUEBA_JOB";
    self.peticion.fields = [];
    self.peticion.fields.push(["txt1", self.Rest.clave]);
    self.peticion.fields.push(["date1", dateStringUTC()]);


    self.peticion.Send().done((r)=>{
        console.log("RESULTADO PROMESA JOB", r);
        if(r.status == 'success') {  
            console.warn("JOB SCHEDULER SUCCESS AT: ", new Date().toLocaleTimeString());
        }
        else if(r.status == 'invalid'){
            setTimeout(()=>{
                self.Rest.Token().done((_restoken)=>{
                    if(_restoken.status === 'success')
                        self.Geolocation.JobSuccess();
                })
            }, 1000);
        }
    });
}

Main.prototype.SendGPS = function(_tipo = 'periodico', _actividad = null){

    self.peticion = new Peticion();
    self.peticion.SaveOnError = false;
    self.peticion.url = self.Rest.url + 'SaveData';
    self.peticion.type = "location";
    self.peticion.fields = [];
    self.peticion.fields.push(["txt1", self.Rest.clave]);
    self.peticion.fields.push(["txt2", _tipo]);
    self.peticion.fields.push(["txt3", _actividad]);
    self.peticion.fields.push(["txt4", 'accuracy']);
    self.peticion.fields.push(["txt5", 'provider']);
    self.peticion.fields.push(["date1", dateStringUTC()]);
    self.peticion.fields.push(["t1", 'locations']);


    self.peticion.Send().done((r)=>{
        // console.log("RESULTADO PROMESA", r);
        if(r.status == 'success') {  
            self.Utils.Notification('Cotización realizada.', 2000, '', 'success');
        }
        else if(r.status == 'invalid'){
            setTimeout(()=>{
                self.Rest.Token().done((_restoken)=>{
                    if(_restoken.status === 'success')
                        self.Solicitud.GuardarCotizacion();
                    else
                        self.peticion.SaveLocal();
                }).fail(err=>{
                    self.peticion.SaveLocal();
                });
            }, 1000);
        }
        else{
            self.peticion.SaveLocal();
            self.Rest.HandleTokenCode(r.code);
        }
    });
}

Main.prototype.Send = function(_tipo = 'periodico', _actividad = '') {

    if(_tipo == 'actividad' && self.Utils.GetLS('gps_activity_is_enabled') != '1'){
        return false;
    }
    
    let _data = {
        UserId: String(self.Rest.user),
        AppVersion: String($('#VersionApp').text()),
        FechaRegistro: String(dateStringUTC()),
        Tipo: String(_tipo),
        Actividad: String(_actividad),
        Accuracy: String(self.Utils.GetLS('__GPS_ACCURACY')),
        Provider: '',
        Clave: String(self.Rest.clave),
        Latitude: parseFloat(self.Utils.GetLS('__GPS_LATITUDE')),
        Longitude: parseFloat(self.Utils.GetLS('__GPS_LONGITUDE')),
    }

    if(this.debug)
        console.log("JSON DATA", _data);

    if(this.token !== null){
        _data = JSON.stringify(_data);
        this._Send(this.urlazure, _data).fail((r)=>{
            if(this.debug)
                console.log('>>>>>_AZURE_ERROR_request', r);
        });
    }
    else{
        console.log('>>>>>_AZURE_EVT_WAIT_TOKEN');
        // setTimeout(this.Send, 2000, evt);
        //setTimeout(() => { this.Send(evt, _data); }, 2000);
    } 
}

Main.prototype._Send = function(_url = '', _data = null) {
    var _this = this;
    return $.ajax({
        type: "POST",
        url: _url,
        data: _data,
        // processData: false,
        cache: false,
        contentType: "application/json",
        dataType: "text",
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("Authorization", _this.token);
            xhr.setRequestHeader("ContentType", 'application/atom+xml;type=entry;charset=utf-8');
        },
        success:function(result, status){
            // console.log(">>>>>_AZURE_EVT_STATUS", status);
            // console.log(">>>>>_AZURE_EVT_RESULT", result);
        },
        error: function (request, status, error){//error de conexion con el WS
            if(_this.debug){
                console.log('>>>>>_AZURE_EVT_STATUS_REQUEST', request);
                console.log(">>>>>_AZURE_EVT_STATUS_ERROR", status);
                console.log('>>>>>_AZURE_EVT__ERROR', error);
            }
            return error
        }
    });
}

Main.prototype.HandleError = function(err){
    try{self.Utils.Alert(err);} catch(e){console.error(e)};
}


/* ------------ UTILS ---------- */
function Utils() {
    this.debug = true;
}
Utils.prototype.SetLS = function(name, value){
    window.localStorage.setItem(name, value);
}
Utils.prototype.GetLS = function(name){
    return window.localStorage.getItem(name);
}
Utils.prototype.DelLS = function(name){
    window.localStorage.removeItem(name);
}

Utils.prototype.GotoPage = function(_page = null, _clean = false, _callback = null){
    this.SetLS("forma", _page);

    if(mainView.history.indexOf(_page+".html") === -1){
        mainView.router.load({
            url: _page +'.html'
        });
    }
    else{
        mainView.router.back({
            pageName: _page,
            force: true
        });
    }

    if(_callback !== null)
        _callback();
    /*if(_clean)
        this.CleanPage(_page);*/
}
Utils.prototype.Alert = function(_message = '', _title = '', _callback = null){
    myApp.alert(_message, _title);
}
