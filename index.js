const MySQLEvents = require('@rodrigogs/mysql-events');
const dotenv = require('dotenv');
var admin = require("firebase-admin");
dotenv.config();


var serviceAccount = require(process.env.serviceAccount);

  const program = async () => {
    const instance = new MySQLEvents({
      host: process.env.host,
      user: process.env.user,
      password: process.env.password,
    }, {
      startAtEnd: true,
    });
  
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.databaseURL
    });

    
    await instance.start();
  
    instance.addTrigger({
      name: 'monitoring all INSERT',
      expression: 'flussskraftwerk.meldungen.*',
      statement: MySQLEvents.STATEMENTS.INSERT,
      onEvent: (event) => {
        console.log(event.affectedRows[0].after)
        
        //sendPushNotification("event"); 
      },
    });

    function sendPushNotification(msg) {
      var registrationToken =  process.env.token;

      var message = {
        notification: {
          title: 'event',
          body: '2:45'
        }
      };

      admin.messaging().sendToDevice(registrationToken, message)
      .then((response) => {
        console.log('Successfully sent message:', response);
      })
      .catch((error) => {
        console.log('Error sending message:', error);
      });
    };
  
    instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, console.error);
    instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, console.error);
  };
  
  program()
    .then(() => console.log('Waiting for database evnts...'))
    .catch(console.error);