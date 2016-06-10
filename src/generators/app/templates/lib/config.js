const config = {
  rooms: {
    build: process.env.HUBOT_ROOMS_BUILD || process.env.HUBOT_ROOMS || "",
    notice: process.env.HUBOT_ROOMS_NOTICE || process.env.HUBOT_ROOMS || ""
  }
};

export default {
  rooms: {
    build: config.rooms.build.split( "," ),
    notice: config.rooms.notice.split( "," )
  }
};
