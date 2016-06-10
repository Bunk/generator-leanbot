// Description:
//   Hubot personality module.
//
// Commands:
//   who is hubot?  - gives a description of hubot

export default robot => {
  const name = `${robot.name}|${robot.alias}`;

  robot.hear( new RegExp( `(who|what)('s|’s| is)(.*) ${name}` ), msg => {
    msg.reply( `I'm ${robot.name}, and I'm here to serve your automation needs` );
  } );
};
