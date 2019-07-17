var chatRendered;
var MOBILE_WINDOW_WIDTH = 750;
var userId;
var user;
var directLineConn;
var dlToken;
// var ROOT_FOLDER = '/sites/default/chatboot/'
var ROOT_FOLDER = 'https://gpbot.azureedge.net/ict/webchat/'
// var ROOT_FOLDER = '';
var chatLanguage = 'en';

$(document).ready(function() {
    // CHAT WINDOW EVENTS
    var gpTemplateHtml = 
        '<div class="minimizable-web-chat">'
        + '<button class="maximize">'
            + '<div class="message-notification">1</div> '
        + '</button>'
        + '<div id="animation-box"></div>'
        + '<div class="chat-box right">'
            + '<img src="' + ROOT_FOLDER + 'img/MrSloth.png" class="header-image">'
            + '<header>'
                + '<div class="title">'
                    + '<div class="title-username">'
                        + '<label>Mr. Sloth</label>'
                        + '<img src="' + ROOT_FOLDER + 'img/Costa-Rica-Flag-icon.png">'
                    + '</div>'
                    + '<div class="title-online-status">'
                        + '<label>Online</label>'
                    + '</div>'
                + '</div>'
                + '<div class="filler"></div>'
                + '<div class="minimize-chat">'
                    + '<img src="' + ROOT_FOLDER + 'img/baseline_minimize_white_18dp.png"/>'
                + '</div>'
                + '<div class="close-chat">'
                    + '<img src="' + ROOT_FOLDER + 'img/baseline_close_white_18dp.png"/>'
                + '</div>'
                + '<div id="close-chat-popover"></div>'
            + '</header>'
            + '<div id="webchat"></div>'
        + '</div>'
    + '</div>';
    $('#gp_webchat').html(gpTemplateHtml);

    $.ajaxSetup({
        // Disable caching of AJAX responses
        cache: false
    });
    chatRendered = false;
    var maximizeChatButton = $('.minimizable-web-chat button.maximize');
    var minimizeChatButton = $('.minimizable-web-chat .chat-box div.minimize-chat img');
    maximizeChatButton.click(openChatWindow);
    minimizeChatButton.click(minimizeChatWindow);

    //GET WEB PAGE LANGUAGE
    var pageLanguage = 'en';
    var pathName = window.location.pathname;

    if (!String.prototype.endsWith) { //Polyfill for IE
        String.prototype.endsWith = function(suffix) {
            return this.indexOf(suffix, this.length - suffix.length) !== -1;
        };
    }

    if(pathName.endsWith('/es')
        || pathName.indexOf('/es/') >= 0
        || pathName.indexOf('/es?') >= 0){
            pageLanguage = 'es';
        }
    console.log('language: ', pageLanguage);

    //POPOVER FOR CLOSING CHAT
    var popoverTitle = pageLanguage === 'es' ? 'Cerrar chat' : 'Close chat';
    var popoverContent = pageLanguage === 'es' ? 
        '¿Desea finalizar la convesación?'
        : 'Are you sure you want to finish the conversation?';
    var popoverConfirm = pageLanguage === 'es' ? 'Confirmar' : 'Confirm';
    var popoverCancel = pageLanguage === 'es' ? 'Cancelar' : 'Cancel';
    
    $('#close-chat-popover').css('max-width', '220px').css('z-index', '16777271').html(
        '<div class="popover-title">' + popoverTitle +'</div>'
            + '<div class="popover-content">'
                + '<label>' + popoverContent + '</label>'
            + '<div>'
                + '<button onClick="closeChatWindow()" class="btn">' + popoverConfirm + '</button>'
                + '<button onClick="cancelCloseChatWindow()" class="btn">' + popoverCancel + '</button>'
            + '</div>'
        + '</div>'
    );

    var popperRef = $('.close-chat');
    var popperElem = $('#close-chat-popover');
    popperElem.hide();
    popperRef.click(function(){
        popperElem.show();
        var popper = new Popper(popperRef, popperElem, {
            placement: 'left'
        });
    });
    
});

function openChatWindow() {
    if(window.innerWidth < MOBILE_WINDOW_WIDTH){
        window.open('./mchat.html');
        // window.open(ROOT_FOLDER + 'js/chatboot/mchat.html');
    }
    else{
        $('.minimizable-web-chat div.chat-box').addClass('chat-visible');
        $('.minimizable-web-chat button.maximize').addClass('chat-button-hidden');
        
        if(!chatRendered){
            chatRendered = true;
            renderWebChat();
        }
    }
}

function minimizeChatWindow() {
    $('.minimizable-web-chat div.chat-box').removeClass('chat-visible');
    $('.minimizable-web-chat button.maximize').removeClass('chat-button-hidden');
}

function closeChatWindow() {
    $('#close-chat-popover').hide();
    $('.minimizable-web-chat div.chat-box').removeClass('chat-visible');
    $('.minimizable-web-chat button.maximize').removeClass('chat-button-hidden');

    location.reload();
    //TODO: restart chat
    // $('#webchat').empty();
    // renderWebChat();
}

function cancelCloseChatWindow() {
    // $('.close-chat').popover('hide');
    $('#close-chat-popover').hide();
}

function renderWebChat(){
    const styleSet = window.WebChat.createStyleSet({
        bubbleBackground: 'rgba(0, 130, 255, 1)',
        bubbleFromUserBackground: 'rgba(226, 226, 226, 1)'
    });
    if(styleSet && styleSet.textContent){
        // styleSet.textContent.fontFamily = '\'Comic Sans MS\', \'Arial\', sans-serif';
        // styleSet.textContent.fontWeight = 'bold';
    }

    $.get('https://qa.gpbot.ai/getToken', { botId: 'ICT' }, function(res){
    // $.get('http://localhost:3798/getToken', { botId: 'ICT' }, function(res){
        console.log('Token response:', res);
        dlToken = res.token;

        userId = generateUserId();
        user = { id: userId };
        directLineConn = window.WebChat.createDirectLine({ 
            token: dlToken,
            user: user,
            bot: { id: 'GPBot' }
            ,resize: 'detect'
        });
        window.WebChat.renderWebChat({
            directLine: directLineConn,
            userID: userId,
            botAvatarInitials: 'Bot',
            userAvatarInitials: 'User',
            styleSet: styleSet
        }, document.getElementById('webchat'));

        displayAnimation();

        directLineConn.postActivity({
            from: user,
            name: 'requestWelcomeDialog',
            type: 'event',
            value: 'en'
        })
        .subscribe(function(id){
            console.log('"trigger requestWelcomeDialog" sent');
            setTimeout(setChangeLanguageEvent, 500);
        });

		/* Mutation observer for "New Messages" button */
		var chatWindowContainer = $('div.css-gtdio3.css-mfy564');
		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
		var observer = new MutationObserver(mutationHandler);
		var obsConfig = { childList: true, characterData: true, attributes: true, subtree: true };
		chatWindowContainer.each ( function () {
			observer.observe (this, obsConfig);
		});
		
    });
}

function setChangeLanguageEvent(){
	var languageButton = $('button:contains("Español")');
	if(languageButton && languageButton.html()){
		$(languageButton).click(function(){
			chatLanguage = 'es';
		});
	} else{
		setTimeout(setChangeLanguageEvent, 1000);
	}
}

function mutationHandler (mutationRecords) {
    mutationRecords.forEach (function (mutation) {
		if(mutation.type === 'childList'){
			if(mutation.addedNodes && mutation.addedNodes[0]){
				if(mutation.addedNodes[0].className === 'css-1r0h5kb'){
					if(chatLanguage === 'es'){
						$('.css-1r0h5kb').html('Mensajes nuevos');
					}
				}
			}
		}
    });
}

function displayAnimation(){
    var imgName = Math.floor(Math.random()*4) + 1;

    // setTimeout(function(){
        $('.css-dhu3ty.css-7c9av6')
            .append($('<li id="animation-item" class="css-1qyo5rb">'
                        + '<div class="css-hgucfj css-1wi3416">'    //1
                            + '<div class="css-7xorrq avatar">Bot</div>' 
                            + '<div class="content">' //2
                                + '<div class="row message">' //3
                                    + '<div class="css-ostbv8 bubble">' //4
                                        + '<div class="markdown css-o3xlyv"><p>' //5
                                            + '<img src="' + ROOT_FOLDER + 'img/anim/' + imgName + '.png" class="animation-image" />'
                                        + '</p></div>' //5
                                    + '</div>' //4
                                    + '<div class="filler"></div>' 
                                + '</div>' //3
                                + '<div class="row">' 
                                    + '<span class="css-1phiexw">'
                                    // + 'Just now'
                                    + '</span>' 
                                    + '<div class="filler"></div>' 
                                + '</div>' 
                            + '</div>' //2
                            + '<div class="filler"></div>' 
                        + '</div>' //1
                    + '</li>').hide().fadeIn(2000));

        $('#animation-item').delay(10000).fadeOut(2000);
    // }, 1000);
}

function generateUserId(){
    return /*"dl_" +*/ Date.now().toString() + (Math.floor(Math.random() * 1000000) + 1).toString();
}

function sendEventToBot(name, value){
    if(directLineConn){
        directLineConn.postActivity({
            from: user,
            name: name,
            type: 'event',
            value: value
        })
        .subscribe(function(id){
            console.log('Event ', name, ' sent');
        });
    }
}
