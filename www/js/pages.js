'use strict';
/*
|------------------------------------------------------------------------------
| Home
|------------------------------------------------------------------------------
*/
myApp.onPageInit('home', function(page) {
	// console.log("HOME", page);
	// $("#btnTEST").click(TomarFoto);
	/* Theme Color */
	self.Utils.SetLS('forma', 'home');
});

myApp.onPageInit('contactos', function(page) {
    self.Utils.SetLS('forma', 'contactos');
    self.Main.GetContacts();
});

myApp.onPageInit('reporte_problema', function(page) {
    self.Utils.SetLS('forma', 'reporte_problema');
    $('.page[data-page=reporte_problema] form[name=validation]').on('submit', function(e){
        e.preventDefault();
        return false;
    });

    jQuery.validator.addMethod("es_clave_ventas", function(value, element) {
        return value != "" ? /^[a-zA-Z\d\s]{4,7}$/i.test(value) : true;
    }, "Clave de ventas no válida.");

    $('.page[data-page=reporte_problema] form[name=validation]').validate({
        rules: {
            Nombre:{
                required: true,
                letterswithspace: true,
                maxlength: 100
            },
            ClaveVentas: {
                required: true,
                es_clave_ventas: true
            },
            Celular: {
                required: true,
                digits: true,
                minlength: 10,
                maxlength: 10
            },
            Comentarios:{
                required: true,
                maxlength: 100
            }
        },
        messages: {
            Nombre: {
                required: 'Por favor Ingresa tu nombre.',
                letterswithspace: 'Solo se permiten letras.',
                maxlength: 'Solo se permiten hasta 100 caracteres.'
            },
            ClaveVentas: {
                required: 'Por favor Ingresa tu Clave de ventas.',
                es_clave_ventas: 'Clave de ventas incorrecto.'
            },
            Celular: {
                required: 'Por favor ingresa tu teléfono.',
                digits: 'Por favor ingresa un teléfono valido.',
                minlength: 'Por favor ingresa un teléfono valido de 10 caracteres.',
                maxlength: 'Por favor ingresa un teléfono valido de 10 caracteres.'
            },             
            Comentarios: {
                required: 'Por favor Ingresa algun comentario.'
            }
        },
        errorElement : 'div',
        errorPlacement: function(error, element) {
            error.appendTo(element.parent().siblings('.input-error'));
        },
        submitHandler: function(form) {
        }
    });
});

/*
|------------------------------------------------------------------------------
| Chat
|------------------------------------------------------------------------------
*/

myApp.onPageInit('chat-main', function(page) {
	self.Utils.SetLS('forma', 'chat-main');
	$("#BuscarConversacion").on('blur', function(){
	    $("#BuscarConversacion").hide();
		$("#BuscarConversacion").prev('span').show();
	});

	$("#BuscarConversacion").on('keyup', e =>{
		$('#Conversaciones ul li').map( (index, e) => {
			// console.log('INDEX', index);
			// console.log('ELEMENT', e.value);
			if($(e).find('.item-title').text().toLowerCase().indexOf($("#BuscarConversacion").val().toLowerCase()) === -1){
				$(e).hide();
			}
			else{
				$(e).show();	
			}
		})
	});

	$("#BuscarContacto").on('keyup', e =>{
		$('#Contactos ul li').map( (index, e) => {
			// console.log('INDEX', index);
			// console.log('ELEMENT', e.value);
			if($(e).find('.item-title').text().toLowerCase().indexOf($("#BuscarContacto").val().toLowerCase()) === -1){
				$(e).hide();
			}
			else{
				$(e).show();	
			}
		})
	});

	$('#Conversaciones ul').empty();


	// Pull to refresh content
	var ptrContent = $$('.pull-to-refresh-content');
 
	// Add 'refresh' listener on it
	ptrContent.on('ptr:refresh', function (e) {
		CB_Client(null, true).then(res=>{
			myApp.pullToRefreshDone();
		}).catch(err=>{
			myApp.pullToRefreshDone();
		})
	});
});

myApp.onPageInit('chat', function(page) {
	self.Utils.SetLS('forma', 'chat');
	/* Initialize Messages */
	__MSGS = myApp.messages('.page[data-page=chat] .messages', {
    	autoLayout: true,
        messageTemplate: `{{#if day}}
            <div class="messages-date"><div class="date">{{day}} {{#if time}}, <span>{{time}}</span>{{/if}}</div></div>
            {{/if}}
            <div class="message message-{{type}} {{#if hasImage}}message-pic{{/if}} {{#if avatar}}message-with-avatar{{/if}} {{#if position}}message-appear-from-{{position}}{{/if}}">
                {{#if name}}<div class="message-name">{{name}}</div>{{/if}}
                <div class="message-text">{{text}}{{#if date}}<div class="message-date">{{date}}</div>{{/if}}</div>
                {{#if avatar}}<div class="message-avatar" style="background-image:url({{avatar}})"></div>{{/if}}
                {{#if label}}<div class="message-label">{{label}}</div>{{/if}}
            </div>`
	});

	/* Image Upload Handler */
	$$('.page[data-page=chat] .messagebar [data-action=send-file]').on('click', function(e) {
		e.preventDefault();
		$$('.page[data-page=chat] #image-file').click();
	});

	var image = $$('.page[data-page=chat] #image-file');
	image.on('change', function(e) {
		myApp.showIndicator();
		var reader = new FileReader();
		reader.onload = function() {
			var data = reader.result;
			
				/*messages.addMessage({
					text: '<img src="' + data + '" alt="Image" />',
					type: 'sent'
				});*/
                

                const formData = new FormData();
                formData.append('file', $$('.page[data-page=chat] #image-file')[0].files[0]);

                var _messageAttr = {
                    avatar: get_wls('USR_PICTURE'),
                    name: get_wls('usrNameComplete'),
                    email: get_wls('user_name'),
                    uid: get_wls('id_user'),
                    clave: get_wls('login-clave')
                };

                __Chat.channel.sendMessage(formData, _messageAttr).then(_index => {
                    /*let _bodymessage = '';
                    let _colorbtn = 'color-gray';
                    let _iconbtn = 'fa-file-o';

                    if (data.match(/^data:image\//)) {
                        _bodymessage = '<img src="' + data + '" alt="Image" />';
                    }
                    else{
                        if(data.match(/^data:application\/pdf/)){
                            _colorbtn = 'color-red';
                            _iconbtn = 'fa-file-pdf-o';
                        }
                        else if(data.match(/^data:application\/vnd/)){
                            _colorbtn = 'color-green';
                            _iconbtn = 'fa-file-excel-o';
                        }  
                        _bodymessage = `<a href="#" onclick="window.open('${data}', '_system');" class="button button-fill ${_colorbtn}"><i class="fa ${_iconbtn}"></i> ${$$('.page[data-page=chat] #image-file')[0].files[0].name}</a>`;
                    } 
                    __Chat.AddMessage(null, 'sent', '', _bodymessage);*/
                    $$('.page[data-page=chat] .messagebar textarea').val('');
                    $$('.page[data-page=chat] #image-file').val('')
                    myApp.hideIndicator();

                }).catch(_err => {
                    // console.log("ERROR ENVIANDO MENSAJE TWILIO", _err);
                    // console.error("ERROR ENVIANDO MENSAJE TWILIO", _err);
                    self.Utils.AyudaModal("Error al enviar el mensaje. code: " +_err);
                    $$('.page[data-page=chat] #image-file').val('')
                    myApp.hideIndicator();
                });

			/*else {
				myApp.addNotification({
					message: 'Please select a valid image.',
					hold: 2000,
					button: {
						text: ''
					}
				});
				image.val('');
				myApp.hideIndicator();
			}*/
		};
		reader.readAsDataURL(image.prop('files')[0]);
	});

	/* Send Message */
	$$('.page[data-page=chat] .messagebar [data-action=send-message]').on('click', function(e) {
		e.preventDefault();
		if (($$('.page[data-page=chat] .messagebar textarea').val().trim())) {
			var _messageAttr = {
				avatar: get_wls('USR_PICTURE'),
				name: get_wls('usrNameComplete'),
				email: get_wls('user_name'),
				uid: get_wls('id_user'),
                clave: get_wls('login-clave')
			};
			__Chat.channel.sendMessage($$.nl2br($$('.page[data-page=chat] .messagebar textarea').val()), _messageAttr).then(_index => {
				/*__MSGS.addMessage({
					text: $$.nl2br($$('.page[data-page=chat] .messagebar textarea').val()),
					type: 'sent',
					// avatar: get_wls('USR_PICTURE'),
					name: get_wls('usrNameComplete'),
					date: get_date_string_format_from_date(new Date())
					// date: new Date().toLocaleTimeString()
				});*/
                // __Chat.AddMessage(null, 'sent', get_wls('usrNameComplete'), $$('.page[data-page=chat] .messagebar textarea').val());
				$$('.page[data-page=chat] .messagebar textarea').val('');
			}).catch(_err => {
                console.log("ERROR ENVIANDO MENSAJE TWILIO", _err);
                console.error("ERROR ENVIANDO MENSAJE TWILIO", _err);
				self.Utils.AyudaModal("Error al enviar el mensaje. code: " +_err);
			});

			/*__MSGS.addMessage({
				text: $$.nl2br($$('.page[data-page=chat] .messagebar textarea').val() +' De Respuesta :) '),
				type: 'received',
				avatar: 'https://randomuser.me/api/portraits/women/17.jpg',
				name: 'Portal',
				date: new Date().toLocaleTimeString()
			});*/
		}
	});


	/* Photo Browser */
	$$('body').on('click', '.page[data-page=chat] .message .message-text img', function() {

		/*var photos = $('.page[data-page=chat] .message .message-text').children('img').map(function() {
			return $(this).attr('src');
		}).get();*/



        try{
            /*let photos = [];
            $(".page[data-page=chat] .message .message-text img").each((i, e) => {
                photos.push($(e).attr('src'));
            })*/
            let photos = [$(this).attr('src')];
            var currentSlide = $.inArray($(this).attr('src'), photos);

    		var myPhotoBrowser = myApp.photoBrowser({
                photos: photos,
                type: 'popup',
                ofText: 'de',
                navbar: true,
                toolbar: false,
                theme: 'dark',
    			exposition: false,
    			initialSlide: currentSlide/*,
    			lazyLoading: true,
    			lazyLoadingInPrevNext: true,
    			lazyLoadingOnTransitionStart: true*/
    			// loop: true
    		});
    		myPhotoBrowser.open();
        }
        catch(_errorPhoto){
            console.error("ERROR PHOTO BROWSER", _errorPhoto);
        }
	});
});



/*
|------------------------------------------------------------------------------
| Splash Screen
|------------------------------------------------------------------------------
*/

myApp.onPageInit('splash-screen', function(page) {
});

/*
|------------------------------------------------------------------------------
| Side Panel
|------------------------------------------------------------------------------
*/

$$('.panel-left').on('open', function() {
    $$('.hamburger').addClass('is-active');
});

$$('.panel-left').on('close', function() {
    $$('.hamburger').removeClass('is-active');
});
