import _ from "lodash";
import generators from "yeoman-generator";
import chalk from "chalk";

export default class HubotGenerator extends generators.Base {
  constructor( ...args ) {
    super( ...args );

    this.defaultAdapter = "slack";
    this.defaultDescription = "A simple helpful robot for your Company";
    this.externalScripts = [
      "hubot-diagnostics",
      "hubot-help",
      "hubot-auth",
      "hubot-announce"
    ];

    this.option( "owner", {
      desc: "Name and email of the owner of new bot (ie Example <user@example.com>)",
      type: String
    } );

    this.option( "name", {
      desc: "Name of new bot",
      type: String
    } );

    this.option( "description", {
      desc: "Description of the new bot",
      type: String
    } );

    this.option( "defaults", {
      desc: "Accept defaults and don't prompt for user input",
      type: Boolean
    } );

    if ( this.options.defaults ) {
      this.options.owner = this.options.owner || this.determineDefaultOwner();
      this.options.name = this.options.name || this.determineDefaultName();
      this.options.description = this.options.description || this.defaultDescription;
    }

    if ( this.options.owner === true ) {
      this.env.error( "Missing owner. Make sure to specify it like --owner=\"<owner>\"" );
    }

    if ( this.options.name === true ) {
      this.env.error( "Missing name. Make sure to specify it like --name=\"<name>\"" );
    }

    if ( this.options.description === true ) {
      this.env.error( "Missing description. Make sure to specify it like --description=\"<description>\"" );
    }
  }

  _slugify( str ) {
    return _( str ).toString().trim().toLowerCase().replace( / /g, "-" ).replace( /([^a-zA-Z0-9\._-]+)/, "" );
  }

  _determineDefaultOwner() {
    var userName, userEmail;

    if ( typeof ( this.user.git.name ) === "function" ) {
      userName = this.user.git.name();
    } else {
      userName = this.user.git.name;
    }

    if ( typeof ( this.user.git.email ) === "function" ) {
      userEmail = this.user.git.email();
    } else {
      userEmail = this.user.git.email;
    }

    if ( userName && userEmail ) {
      return `${userName} <${userEmail}>`;
    }

    return "User <user@example.com>";
  }

  _determineDefaultName() {
    return this._slugify( this.appname );
  }

  initializing() {
    this.pkg = require( "../../../package.json" );

    this.log( hubotStartSay() );
  }

  get prompting() {
    return {
      askForBotOwner() {
        const prompts = [];

        if ( !this.options.owner ) {
          prompts.push( {
            type: "input",
            name: "botOwner",
            message: "Owner",
            default: this._determineDefaultOwner()
          } );
        }

        return this.prompt( prompts ).then( props => {
          this.botOwner = this.options.owner || props.botOwner;
        } );
      },

      askForBotNameAndDescription() {
        const prompts = [];

        if ( !this.options.name ) {
          prompts.push( {
            type: "input",
            name: "botName",
            message: "Bot name",
            default: this._determineDefaultName()
          } );
        }

        if ( !this.options.description ) {
          prompts.push( {
            type: "input",
            name: "botDescription",
            message: "Description",
            default: this.defaultDescription
          } );
        }

        return this.prompt( prompts ).then( props => {
          this.botName = this.options.name || props.botName;
          this.botDescription = this.options.description || props.botDescription;
        } );
      },

      askForBotAdapter() {
        this.botAdapter = "slack";
      }
    };
  }

  get writing() {
    return {
      app() {
        this.directory( ".docker", ".docker" );
        this.directory( "bin" );
        this.directory( "scripts", "scripts" );
        this.directory( "lib", "lib" );

        this.copy( "_babelrc", ".babelrc" );
        this.copy( "_dockerignore", ".dockerignore" );
        this.copy( "_drone.yml", ".drone.yml" );
        this.copy( "_eslintrc.js", ".eslintrc.js" );
        this.copy( "_gitignore", ".gitignore" );

        this.template( "Dockerfile", "Dockerfile" );

        this.write( "external-scripts.json", JSON.stringify( this.externalScripts, undefined, 2 ) ); // eslint-disable-line

        this.template( "_package.json", "package.json" );
        this.template( "README.md", "README.md" );
      },
      projectfiles() {
        this.copy( "_editorconfig", ".editorconfig" );
      }
    };
  }

  end() {
    let packages = [ "hubot", "hubot-scripts", "hubot-slack" ].concat( this.externalScripts );

    this.npmInstall( packages, { save: true } );

    this.log( hubotEndSay() );
  }
}

/* eslint-disable */
function hubotStartSay() {
  return  "                     _____________________________  " + "\n" +
          "                    /                             \\ " + "\n" +
          " "+chalk.cyan( "  //\\")+"              |      Extracting input for    |" + "\n" +
          " "+chalk.cyan( " ////\\  ")+"  "+chalk.yellow( "_____")+"    |   self-replication process   |" + "\n" +
          " "+chalk.cyan( "//////\\  ")+chalk.yellow( "/")+chalk.cyan( "_____")+chalk.yellow( "\\")+"   \\                             / " + "\n" +
          " "+chalk.cyan( "=======") + chalk.yellow( " |")+chalk.cyan( "[^_/\\_]")+chalk.yellow( "|")+"   /----------------------------  " + "\n" +
          "  "+chalk.yellow( "|   | _|___")+"@@"+chalk.yellow( "__|__")+"                                " + "\n" +
          "  "+chalk.yellow( "+===+/  ///     ")+chalk.cyan( "\\_\\")+"                               " + "\n" +
          "   "+chalk.cyan( "| |_")+chalk.yellow( "\\ /// HUBOT/")+chalk.cyan( "\\\\")+"                             " + "\n" +
          "   "+chalk.cyan( "|___/")+chalk.yellow( "\\//      /")+chalk.cyan( "  \\\\")+"                            " + "\n" +
          "         "+chalk.yellow( "\\      /   +---+")+"                            " + "\n" +
          "          "+chalk.yellow( "\\____/    |   |")+"                            " + "\n" +
          "           "+chalk.cyan( "| //|")+"    "+chalk.yellow( "+===+")+"                            " + "\n" +
          "            "+chalk.cyan( "\\//")+"      |xx|                            " +
          "\n";
}

function hubotEndSay() {
  return  "                     _____________________________  " + "\n" +
          " _____              /                             \\ " + "\n" +
          " \\    \\             |   Self-replication process   |" + "\n" +
          " |    |    "+chalk.yellow( "_____")+"    |          complete...         |" + "\n" +
          " |__"+chalk.cyan( "\\\\")+"|   "+chalk.yellow( "/")+chalk.cyan( "_____")+chalk.yellow( "\\")+"   \\     Good luck with that.    / " + "\n" +
          "   "+chalk.cyan( "|//") + chalk.yellow( "+  |")+chalk.cyan( "[^_/\\_]")+chalk.yellow( "|")+"   /----------------------------  " + "\n" +
          "  "+chalk.yellow( "|   | _|___")+"@@"+chalk.yellow( "__|__")+"                                " + "\n" +
          "  "+chalk.yellow( "+===+/  ///     ")+chalk.cyan( "\\_\\")+"                               " + "\n" +
          "   "+chalk.cyan( "| |_")+chalk.yellow( "\\ /// HUBOT/")+chalk.cyan( "\\\\")+"                             " + "\n" +
          "   "+chalk.cyan( "|___/")+chalk.yellow( "\\//      /")+chalk.cyan( "  \\\\")+"                            " + "\n" +
          "         "+chalk.yellow( "\\      /   +---+")+"                            " + "\n" +
          "          "+chalk.yellow( "\\____/    |   |")+"                            " + "\n" +
          "           "+chalk.cyan( "| //|")+"    "+chalk.yellow( "+===+")+"                            " + "\n" +
          "            "+chalk.cyan( "\\//")+"      |xx|                            " +
          "\n";
};
/* eslint-enable */
