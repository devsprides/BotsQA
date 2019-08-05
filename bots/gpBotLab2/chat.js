(function() {

    var gpChatRendered;
    var jQuery; // Localize jQuery variable
    var directLineConn;
    var userId;
    var user;
    var chatClosed = false;
 
    
    /******** Load jQuery if not present *********/
    if (window.jQuery === undefined || window.jQuery.fn.jquery !== '3.2.1') {
        var script_tag = document.createElement('script');
        script_tag.setAttribute("type","text/javascript");
        script_tag.setAttribute("src",
        "./jquery3-2-1.min.js");
        if (script_tag.readyState) {
          script_tag.onreadystatechange = function () { // For old versions of IE
              if (this.readyState == 'complete' || this.readyState == 'loaded') {
                  scriptLoadHandler();
              }
          };
        } else { // Other browsers
          script_tag.onload = scriptLoadHandler;
        }
        // Try to find the head, otherwise default to the documentElement
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
    } else {
        // The jQuery version on the window is the one we want to use
        jQuery = window.jQuery;
        main();
    }

    /******** Called once jQuery has loaded ******/
    function scriptLoadHandler() {
        // Restore $ and window.jQuery to their previous values and store the
        // new jQuery in our local jQuery variable
        jQuery = window.jQuery.noConflict(true);
        // Call our main function
        main(); 
    }
    
    /******** Main function ********/
    function main() {
        jQuery(document).ready(function($) {

            
            userId = generateUserId();
            user = { id: userId };
            directLineConn = window.WebChat.createDirectLine({ 
                secret_qa: 'HQ4NY4XMCYs._qCGJbmah4fS5zUV0taYZDkKUFIIiSTxf94hyk-qEls',
                secret_dev: 'X3-5HYsVEf4.cwA.n78.-OJsgUASThdxjH0psyq_5m0rrgxhHvXOJ_m4PvgVk2E',
                secret_dev2: 'GOWld-pMKeg.a4lgcyau-7fWWgn3UbdM-1yvqXNvUXMCMgE6VUWISkM',
                secret: 'V0ES7JA4i_Y.cwA.p54.E3JTUew9LRk9-oG6dUEfF9htXAQW7pWBabqlksjEBuo',
                user: user,
                bot: { id: 'Bot' }
                ,resize: 'detect'
            });

            gpChatRendered = false;
            var css_link = $("<link>", { 
                rel: "stylesheet", 
                type: "text/css", 
                href: "chat.css" 
            });
            css_link.appendTo('head');

            jQuery('#gp_webchat').html(gpTemplateHtml);

            var maximizeChatButton = jQuery('.minimizable-web-chat button.maximize');
            var minimizeChatButton = jQuery('.minimizable-web-chat .chat-box div.minimize-chat img');
            var closeChatButton = jQuery('.minimizable-web-chat .chat-box div.close-chat img');
            maximizeChatButton.click(openChatWindow);
            minimizeChatButton.click(minimizeChatWindow);
            closeChatButton.click(closeChatWindow);

            
        });
    }

    var gpTemplateHtml = 
        '<div class="minimizable-web-chat">'
        + '<button class="maximize">'
            + '<span class="badge">1</span>'
        + '</button>'
        + '<div class="chat-box right">'
            + '<header>'
                + '<div class="title">'
                    + '<div class="picture"></div>'
                    + '<div class="text">'
                        + '<div class="name">Betty</div>'
                        + '<div class="status">'
                            + '<div class="green_dot"></div>'
                            + '<label>En Línea</label>'
                        + '</div>'
                    + '</div>'
                + '</div>'
                + '<div class="close-buttons">'
                    + '<div class="minimize-chat">'
                        + '<img src="img/baseline_minimize_white_36dp.png"/>'
                    + '</div>'
                    + '<div class="close-chat">'
                        + '<img src="img/baseline_close_white_48dp.png"/>'
                    + '</div>'
                + '</div>'
            + '</header>'
            + '<div id="webchat"></div>'
        + '</div>'
    + '</div>';

    function openChatWindow() {
        if(window.innerWidth < 750){
            window.open('mchat.html');
        }
        else{
            jQuery('.minimizable-web-chat div.chat-box').addClass('chat-visible');
            jQuery('.minimizable-web-chat button.maximize').addClass('chat-button-hidden');
        }
        
        if(!gpChatRendered){
            renderWebChat();
            gpChatRendered = true;
        }
    }

    function minimizeChatWindow() {
        // jQuery('#webchat form.css-1yaojre.css-sdb7gy.css-1fe8kfc > input').attr('disabled', true);
        // jQuery('#webchat button').attr('disabled', true);
        jQuery('.minimizable-web-chat div.chat-box').removeClass('chat-visible');
        jQuery('.minimizable-web-chat button.maximize').removeClass('chat-button-hidden');
        // chatClosed = true;

        // location.reload();
    }

    function closeChatWindow() {
        location.reload();
    }
    
    function renderWebChat(){
        console.log('Rendering webchat...');
        const styleSet = window.WebChat.createStyleSet({
            bubbleBackground: 'rgba(66, 200, 244, .4)',
            bubbleFromUserBackground: 'rgba(141, 193, 44, .4)'
        });
        if(styleSet && styleSet.textContent){
            // styleSet.textContent.fontFamily = '\'Comic Sans MS\', \'Arial\', sans-serif';
            // styleSet.textContent.fontWeight = 'bold';
        }
        
        window.WebChat.renderWebChat({
            directLine: directLineConn,
            userID: user.id,
            botAvatarInitials: 'Bot',
            userAvatarInitials: 'User',
            locale: 'es-ES',
            styleSet: styleSet
        }, document.getElementById('webchat'));

        displayAnimation();
    
        setTimeout(function(){
            directLineConn.postActivity({
                from: user,
                name: 'requestWelcomeDialog',
                type: 'event',
                value: userId
            })
            .subscribe(function(id){
                console.log('"trigger requestWelcomeDialog" sent');
            });
        }, 1000);
        
    }

    function generateUserId(){
        
        return Date.now().toString() + (Math.floor(Math.random() * 1000000) + 1).toString();
    }

    function addFakeMessageFromBot(message){
        jQuery('.css-dhu3ty.css-7c9av6')
                // .append('<li class="css-1qyo5rb"><div class="css-hgucfj css-1wi3416"><div class="css-7xorrq avatar">Bot</div><div class="content"><div class="row message"><div class="css-ostbv8 bubble"><div class="markdown css-9qpka5"><p>'
                //     + greeting
                //     + '</p></div></div><div class="filler"></div></div><div class="row"><span class="css-1phiexw">' 
                //     //+ 'Just now'
                //     + '</span><div class="filler"></div></div></div><div class="filler"></div></div></li>')
                // }, 1500);
                .append('<li class="css-1qyo5rb"><div class="css-hgucfj css-1wi3416"><div class="css-7xorrq avatar">Bot</div><div class="content"><div class="row message"><div class="css-ostbv8 bubble"><div class="markdown css-o3xlyv"><p>'
                    + message
                    + '</p></div></div><div class="filler"></div></div><div class="row"><span class="css-1phiexw">'
                    // + 'Just now'
                    + '</span><div class="filler"></div></div></div><div class="filler"></div></div></li>');
    }

    function refreshWebchat(){
        // console.log('Refreshing webchat...');
            // const styleSet = window.WebChat.createStyleSet({
            //     bubbleBackground: 'rgba(66, 200, 244, .4)',
            //     bubbleFromUserBackground: 'rgba(141, 193, 44, .4)'
            // });
            // userId = generateUserId();
            // user = { id: userId };
            // directLineConn = window.WebChat.createDirectLine({ 
            //     secret: '8myXMXqIKPg.cwA.HVQ.Nyo92f1ygSSABe6ON-6_i_85sIqwlOadgVqNj8Fi1t0',
            //     secret_0: 'raBRjpHPs6o.cwA.vIA.t4WhOFq7szm-yYFHOM-7hVMVk8EsYGQJxLmzTflrMzo',
            //     secret_01: '7V-lB7wjEcc.cwA.HwQ.J9KAmjQd0SiTkD46QfsOo0-pcZ3fzbf-8bxIWkLoBQM',
            //     user: user,
            //     bot: { id: 'Bot' }
            //     ,resize: 'detect'
            // });
            // window.WebChat.renderWebChat({
            //     directLine: directLineConn,
            //     botAvatarInitials: 'Bot',
            //     userAvatarInitials: 'User',
            //     styleSet
            // }, document.getElementById('webchat'));
            // directLineConn.postActivity({
            //     from: user,
            //     // name: 'requestTimeout',
            //     name: 'requestWelcomeDialog',
            //     type: 'event',
            //     value: userId
            // })
            // .subscribe(function(id){
            //     console.log('"trigger timeoutDialog" sent');
            // });
    }

    function sendEventToBot(eventName){
        if(directLineConn){
            directLineConn.postActivity({
                from: user,
                name: eventName,
                type: 'event',
                value: userId
            })
            .subscribe(function(id){
                console.log('Sent event ' + eventName);
            });
        }
    }

    function confirmLeavePage(){
        jQuery(window).bind('beforeunload', function(){
            console.log('Request to leave page');

            if(gpChatRendered){
                console.log('Sending leave chat event');
                directLineConn.postActivity({
                    from: user,
                    name: 'requestLeaveChat',
                    type: 'event',
                    value: userId
                })
                .subscribe(function(id){
                    console.log('"Leave chat event sent');
                });
            }

            return 'Are you sure you want to leave?';
        });
    }

    function disableMessageInput(){
        jQuery('#webchat form.css-1yaojre.css-sdb7gy.css-1fe8kfc > input').attr('disabled', true);
        jQuery('#webchat button').attr('disabled', true);
    }

    function setPlaceHolder(){
        //jQuery("#webchat form.css-1yaojre.css-sdb7gy.css-1fe8kfc > input").attr("placeholder", "age");
        $('#gp_webchat .minimizable-web-chat > .chat-box > #webchat form.css-1yaojre css-1sjcwuh.css-1fe8kfc input').attr('placeholder', 'Responder a Sofi');
    }

    //For webchat v4.4.1
    function displayAnimation(){
        jQuery('.css-ljhy6a.css-7c9av6')
            .append(jQuery(
                '	<li class="css-1qyo5rb hide-timestamp" role="listitem">'
                +'		<div class="css-tyxksf css-2p02md">'
                +'			<div class="content">'
                +'				<div class="webchat__row attachment">'
                +'					<div id="welcome-image" class="css-cekmep attachment bubble">'
                +'						<div class="css-1vieo9r">'
                +'							<div class="ac-container" tabindex="0" style="display: flex; flex-direction: column; justify-content: flex-start; box-sizing: border-box; flex: 0 0 auto; padding: 15px;">'
                +'								<div class="ac-container" style="display: flex; flex-direction: column; justify-content: flex-start; box-sizing: border-box; flex: 0 0 auto;">'
                +'									<div style="display: flex; align-items: flex-start; justify-content: flex-start; box-sizing: border-box; flex: 0 0 auto;">'
                +'										<img class="ac-image" src="img/fondo.png" alt="" style="max-height: 100%; min-width: 0px; width: 100%;">'
                +'									</div>'
                +'								</div>'
                +'							</div>'
                +'						</div>'
                +'					</div>'
                +'				</div>'
                +'				<div aria-hidden="true" class="webchat__row"><span class="css-1s8geyi timestamp transcript-timestamp">Hace 6 minutos</span>'
                +'					<div class="filler"></div>'
                +'				</div>'
                +'			</div>'
                +'			<div class="filler"></div>'
                +'		</div>'
                +'	</li>'
            ).hide().fadeIn(2000));
    }
    
    })();