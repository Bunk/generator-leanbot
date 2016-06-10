import { SlackBot } from "hubot-slack";
import Config from "./config";

const blockTemplate = val => `\`\`\`\n${val}\n\`\`\``;
const defaultLogger = {
  error( ...parms ) {
    console.error( ...parms ); // eslint-disable-line
  },
  info( ...parms ) {
    console.log( ...parms ); // eslint-disable-line
  },
  debug( ...parms ) {
    console.log( ...parms ); // eslint-disable-line
  }
};

const api = robot => {
  return {
    reply( envelope, { title, message } ) {
      let blocks = blockerize( message );
      if ( title ) {
        const userRef = envelope.user ? `<@${envelope.user.id}>: ` : "";
        robot.messageRoom( envelope.room, `${userRef}${title}` );
      }
      blocks.forEach( block => {
        robot.messageRoom( envelope.room, block );
      } );
    },
    announce( message ) {
      let rooms = Config.rooms.notice;
      rooms.forEach( room => {
        robot.messageRoom( room, message );
      } );
    },
    error( err, { logger = defaultLogger, rooms = Config.rooms.notice, color = "bad", title } = {} ) {
      if ( !Array.isArray( rooms ) ) {
        rooms = [ rooms ];
      }

      const stackTrace = ( err.stack || "" ).trim();
      const stdOut = ( err.stdout || "" ).trim();
      let message = `${err.message}\n\n`;
      if ( stackTrace ) {
        message += `Stack:\n${blockTemplate( stackTrace )}\n`;
      }
      if ( stdOut ) {
        message += `Output:\n${blockTemplate( stdOut )}\n`;
      }

      let tailCommand = `${robot.name} tail 25`;
      if ( logger ) {
        tailCommand += ` ${logger.id}`;
      }

      message += "\nIf you'd like to see more logs to help troubleshoot the issue, you can run ";
      message += `the \`${tailCommand}\` command.`;

      if ( logger ) {
        logger.error( err );
      }

      robot.emit( "error", err );

      return this.notify( {
        rooms,
        color: "danger",
        title: title || "<!here> Something absolutely terrible has happened!",
        fallback: title || `Something absolutely terrible has happened! ${ err.message }`,
        text: message,
        thumb_url: "http://cultofthepartyparrot.com/parrots/sadparrot.gif" // eslint-disable-line
      } );
    },
    notify( { logger = defaultLogger, rooms = Config.rooms.notice, fallback, ...rest } = {} ) {
      if ( !Array.isArray( rooms ) ) {
        rooms = [ rooms ];
      }

      let message = {
        fallback: fallback || rest.header,
        attachments: [ {
          mrkdwn_in: [ "text" ], // eslint-disable-line camelcase
          ...rest
        } ]
      };

      if ( logger ) {
        logger.info( { ...rest } );
      }

      rooms.forEach( channel => {
        robot.emit( "slack-attachment", { channel, ...message } );
      } );
    }
  };
};

export default api;

export function blockerize( msg ) {
  const MAX_MESSAGE_LENGTH = SlackBot.MAX_MESSAGE_LENGTH - 8; // eslint-disable-line no-magic-numbers
  if ( msg.length <= MAX_MESSAGE_LENGTH ) {
    return [ blockTemplate( msg ) ];
  }

  let submessages = [];
  while ( msg.length > 0 ) {
    if ( msg.length <= MAX_MESSAGE_LENGTH ) {
      submessages.push( msg );
      msg = "";
    } else {
      // Split message at last line break, if it exists
      let maxSizeChunk = msg.substring( 0, MAX_MESSAGE_LENGTH );

      let lastLineBreak = maxSizeChunk.lastIndexOf( "\n" );
      let lastWordBreakMatch = maxSizeChunk.match( /\W\w+$/ ) || {};
      let lastWordBreak = lastWordBreakMatch.index;

      let breakIndex;
      if ( lastLineBreak > -1 ) {
        breakIndex = lastLineBreak;
      } else if ( lastWordBreak ) {
        breakIndex = lastWordBreak;
      } else {
        breakIndex = MAX_MESSAGE_LENGTH;
      }

      submessages.push( msg.substring( 0, breakIndex ) );

      // Skip char if split on line or word break
      if ( breakIndex !== MAX_MESSAGE_LENGTH ) {
        breakIndex++;
      }

      msg = msg.substring( breakIndex, msg.length );
    }
  }
  return submessages.map( m => blockTemplate( m ) );
}

export function escapeQuotes( val ) {
  return val.replace( /"/g, '\\"' );
}
