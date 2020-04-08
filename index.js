const MySQLEvents = require('@rodrigogs/mysql-events');
const mariadb = require('mariadb');
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

    const pool = mariadb.createPool({
      host: process.env.host, 
      user:process.env.user, 
      password: process.env.password,
      database: process.env.database,
      connectionLimit: 5
    });
  
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.databaseURL
    });

    await instance.start();
  
    instance.addTrigger({
      name: 'monitoring all INSERT',
      expression: 'flusskraftwerk.meldungen.*',
      statement: MySQLEvents.STATEMENTS.INSERT,
      onEvent: (event) => {
        getUserDviceID(event.affectedRows[0].after);
      },
    });

  
    async function getUserDviceID(data) {
      let conn;
      try {     
        conn = await pool.getConnection();
        const user = await conn.query("SELECT FK_Benutzer FROM ansicht WHERE FK_Anlage =" + data.fk_anlagen);
        const deviceID = await conn.query("SELECT idDevice FROM benutzer WHERE idBenutzer =" + user[0].FK_Benutzer);
        sendPushNotification(deviceID[0].idDevice, data);
      } catch (err) {
        console.log(err);
      } finally {
        if (conn) return conn.end();
      }
    };

    function sendPushNotification(registrationToken, msg) {
    
      var message = {
        notification: {
          title: msg.bemerkungMel,
          body: msg.datum.toISOString()
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