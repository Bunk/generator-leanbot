import shortid from "shortid";
import bunyan from "bunyan";
import PrettyStream from "bunyan-prettystream";

const prettyStdOut = new PrettyStream();
prettyStdOut.pipe( process.stdout );

const ringbuffer = new bunyan.RingBuffer( { limit: 1000 } );
const hubotLogger = bunyan.createLogger( {
  name: "hubot",
  streams: [ {
    stream: prettyStdOut,
    level: "info",
    type: "raw"
  }, {
    stream: ringbuffer,
    level: "trace",
    type: "raw"
  } ]
} );

export function getLatestLogs( { id = null } = {} ) {
  let logs = ringbuffer.records;
  if ( id ) {
    logs = logs.filter( log => log.id === id );
  }
  return logs;
}

export default class Logger {
  constructor() {
    this.id = shortid.generate();
    this._logger = hubotLogger.child( { id: this.id }, true );
  }

  info( msg, data ) {
    this._logger.info( data || {}, msg );
  }

  trace( msg, data ) {
    this._logger.trace( data || {}, msg );
  }

  error( msg, err ) {
    this._logger.error( err, msg );
  }
}
