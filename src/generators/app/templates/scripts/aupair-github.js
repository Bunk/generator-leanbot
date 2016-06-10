// Description:
//   Hubot dependency health monitor
//
// Notes:
//   Uses the aupair status library

import aupair from "aupair";
import ApiDependency from "aupair-api";
import Logger from "../lib/logger";

const githubStatus = {
  good: true,
  minor: false,
  major: false
};

const dependency = new ApiDependency( {
  name: "github",
  uri: "https://status.github.com/api/last-message.json",
  transforms: {
    response( response ) {
      let healthy = githubStatus[ response.body.status ] || false;
      return {
        healthy,
        message: response.body.body,
        error: healthy ? undefined : new Error( response.body.body ),
        timestamp: response.created_on
      };
    }
  }
} );

export default robot => {
  let logger = new Logger();
  logger.info( "Registered health monitor", dependency );
  aupair.register( dependency );
};
