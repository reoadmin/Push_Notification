/**
 * Created by sj  on 3/4/2016.
 */


(function () {
    'use strict';

    angular
        .module('starter')
        .service('notificationService', notificationService);

    notificationService.$inject = ['$rootScope', '$http'];

    function notificationService( $rootScope, $http ) {

        var notificationsRecords = [],
            self, isAndroid, regID;

        return {
            initialize: function() {
                console.log('initialization notificationService');

                isAndroid = ionic.Platform.isAndroid();
                self = this;

                //HECK ecb of pushNotification
                window.onNotification = this.onNotification;
                console.log(this);
                console.log( !!window.onNotification);

                notificationsRecords.push({
                    message: 'pushNotification initialized.'
                });

                $rootScope.$emit('pushNotification:initialized', {});
            },
            getNotificationsRecords: function() {
                return notificationsRecords;
            },
            successHandler: function( result ) {
                alert('success = ' + result);
            },
            errorHandler: function( error ) {
                alert('error = ' + error);
            },
            register: function() {
                if ( isAndroid ){
                    pushNotification.register(
                        this.successHandler,
                        this.errorHandler,
                        {
                            senderID: config.GCMProjectNumber,
                            ecb: 'onNotification'
                        });
                }
            },
            unRegister: function() {
                if ( isAndroid ){
                    pushNotification.unregister(
                        this.successHandler,
                        this.errorHandler,
                        {
                            senderID : config.GCMProjectNumber
                        });
                }
            },
            sendPushNotification: function( data ) {
                var payload = {
                    regID : regID,
                    message: data.message
                };

                return $http.post(config.baseURL + 'send-notification', payload);
            },
            onNotification: function( evt ) {
                switch( evt.event ) {
                    case 'registered':
                        if ( evt.regid.length > 0 ) {
                            $rootScope.$emit('pushNotification:registered', evt);
                            self.onNotificationRegistered( evt );
                        }
                        break;

                    case 'message':
                        $rootScope.$emit('pushNotification:message', evt);
                        self.onNotificationMessage( evt );

                        // if this flag is set, this notification happened while we were in the foreground.
                        // you might want to play a sound to get the user's attention, throw up a dialog, etc.
                        if ( evt.foreground ) {
                            $rootScope.$emit('pushNotification:message:foreground', evt);
                            //var soundfile = evt.soundname || evt.payload.sound;
                            //// if the notification contains a soundname, play it.
                            //var my_media = new Media("/android_asset/www/"+ soundfile);
                            //my_media.play();
                        } else {
                            // otherwise we were launched because the user touched a notification in the notification tray.
                            if ( evt.coldstart ) {
                                $rootScope.$emit('pushNotification:message:coldstart', evt);
                            } else {
                                $rootScope.$emit('pushNotification:message:other', evt);
                            }
                        }
                        break;

                    case 'error':
                        $rootScope.$emit('pushNotification:error', evt);
                        self.onNotificationError( evt );
                        break;

                    default:
                        $rootScope.$emit('pushNotification:unknown', evt);
                        break;
                }
            },
            onNotificationRegistered: function( evt ) {
                console.log('onNotificationRegistered:', evt.regid);
                notificationsRecords.push({
                    message: 'registered successfully.'
                });

                regID = [ evt.regid ];
            },
            onNotificationMessage: function( evt ) {
                console.log('onNotificationMessage:', evt.payload.message);
                notificationsRecords.push({
                    message: evt.payload.message
                });
            },
            onNotificationError: function( evt ) {
                console.log('onNotificationError:', evt.msg);
                notificationsRecords.push({
                    message: 'error occurred in un-registration.'
                });
            }
        }
    }
})();

