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
            "http://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js");
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

            setPlaceHolder();
            userId = generateUserId();
            user = { id: userId };
            directLineConn = window.WebChat.createDirectLine({ 
                secret_0: 'qdBrGZG1wI8.qZhe_NPp-PxpEXi76UzNpQH7qVucs4t4Lpr9oNsbD8A',
                secret: 'NY5UjyJFCMc.elW2fIooICnN5z6LX828kS_D3_E_9k65LzIYQ-Ocx84',
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
            maximizeChatButton.click(openChatWindow);
            minimizeChatButton.click(minimizeChatWindow);

            
        });
        
    }

    var gpTemplateHtml = `
        <div class="minimizable-web-chat">
            <button class="maximize">
                 <img src="img/00-Avatar-Dipo.png" width="64px" height="64px" 
                    style="border-radius: 20%; position: fixed; right: 20px; bottom: 20px;" />
            </button>
            <div class="chat-box right">
                <header>
                    <div>
                    <img src="img/00-Avatar-Dipo.png" width="32px" height="32px" 
                    style="border-radius: 50%; right: 20px; bottom: 20px; margin-top: 25%; margin-left: 30%;" />
                    </div>
                    <div class="title">
                        <b><label style="text-align:left;">Pocho</label></b>

                        <div class="status">
                            <div class="green_dot"></div>
                            <label style="text-align:left; font-size:60%;">En Línea</label>
                        </div>
                    </div>
                    <!--                     <div class="minimize-chat">
                    <img src="img/baseline_close_white_48dp.png"/>
                    </div>-->
                </header>
                <div id="webchat"></div>
            </div>
        </div>
    `;

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
        // jQuery('.minimizable-web-chat div.chat-box').removeClass('chat-visible');
        // jQuery('.minimizable-web-chat button.maximize').removeClass('chat-button-hidden');
        // chatClosed = true;

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
            styleSet
        }, document.getElementById('webchat'));
    
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

        setTimeout(function(){
            jQuery('.css-1yaojre > input').attr('placeholder', 'Responder a Pocho');
            console.log("cambio placeholder");
        }, 10);
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
        //$("#webchat form.css-1yaojre.css-sdb7gy.css-1fe8kfc > input:text").attr("placeholder", "age");
    }
    
    })();