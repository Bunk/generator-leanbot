// Description
//   A hubot script that checks and reports the health of any dependent services
//
// Configuration:
//   HUBOT_ROOMS_NOTICE - The rooms to send notifications to
//
// Commands:
//   hubot health - Responds with the current health of the monitored systems
//
// Notes:
//   Also supplied an HTTP endpoint at '/hubot/health' that responds with a health check
//
// Author:
//   JD Courtoy <jd.courtoy@gmail.com>

import aupair from "aupair";
import pkg from "../package.json";
import notificationsFactory from "../lib/notifications";
import Logger from "../lib/logger";

function transformColor( status ) {
  if ( status.degraded ) {
    return "warning";
  }
  return status.healthy ? "good" : "danger";
}

function transformState( status ) {
  if ( status.degraded ) {
    return "degraded";
  }
  return status.healthy ? "ok" : "down";
}

function transformStateIcon( status ) {
  if ( !status.healthy ) {
    return ":white_check_mark:";
  }
  return status.degraded ? ":interrobang:" : ":bangbang:";
}

function transformDetails( status ) {
  return status.details.map( detail => {
    return {
      title: detail.name,
      value: `${ transformStateIcon( detail ) } ${ detail.message }`,
      short: true
    };
  } );
}

export default robot => {
  const notifications = notificationsFactory( robot );

  robot.respond( /health/, msg => {
    const logger = new Logger();
    aupair.check()
      .then( status => {
        const notification = {
          logger,
          rooms: [ msg.envelope.room ],
          color: transformColor( status ),
          title: `${robot.name} v.${pkg.version}`,
          fallback: `${robot.name} v.${pkg.version} Status: ${ transformState( status ) }`,
          fields: transformDetails( status )
        };
        notifications.notify( notification );
      } )
      .catch( err => {
        notifications.error( err, { logger } );
      } );
  } );

  robot.router.get( "/health", ( req, res ) => {
    const logger = new Logger();
    aupair.check()
      .then( payload => {
        res.set( "Content-Type", "application/json" );
        res.send( JSON.stringify( payload ) );
        logger.info( "/health", payload );
      } )
      .catch( err => {
        robot.emit( "error", err, req );

        let message = { error: err.message };
        if ( process.env.DEBUG ) {
          message.stack = err.stack;
        }

        res.status( 500 ).send( message ); // eslint-disable-line no-magic-numbers
      } );
  } );
};
