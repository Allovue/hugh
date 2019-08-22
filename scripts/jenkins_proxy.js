// Commands:
//   hubot copy [customer] to staging - triggers an background process to clone production data to staging (note that demo copiee to development)
//   hubot I need a database dump for [customer|demo] - triggers a background process to generate a postgres dump file to be generated suitable for `pg_restore` locally.
//   hubot restart the elasticsearch cluster - turns elasticsearch nodes off and back on again. Do this if (and only if) we're seeing a slew of errors and etl failures in a span of seconds/minutes.

var jenkinsURL = process.env.JENKINS_URL;
var jenkinsToken = process.env.JENKINS_TOKEN;

module.exports = function(robot) {
  robot.respond(/copy (.+) to staging/i, function(msg) {
    var jobName = 'DB_copy'
    var customer = msg.match[1];
    if (customer == "demo" || customer == "development") { customer = "demo" };
    robot.http(jenkinsURL + '/buildByToken/buildWithParameters?job=' + jobName + '&token=' + jenkinsToken + '&customer=' + customer).post(null) (function(err, response, body) {
      if (err) {
        return msg.reply("I can't do that right now");
      } else {
        return msg.reply("Copying " + customer + " to staging");
      }
    });
  })

  robot.respond(/I need a database dump for (.+)/i, function(msg) {
    var jobName = "Get%20DB%20dump%20for%20developer"
    var customer = msg.match[1];
    robot.http(jenkinsURL + '/buildByToken/buildWithParameters?job=' + jobName + '&token=' + jenkinsToken + '&customer=' + customer).post(null) (function(err, response, body) {
      if (err) {
        return msg.reply("I can't do that right now");
      } else {
        return msg.reply("Backing up " + customer);
      }
    });
  })

  robot.respond(/restart the elasticsearch cluster/i, function(msg) {
    var jobName = "Restart%20elasticsearch%20cluster"
    robot.http(jenkinsURL + '/buildByToken/build?job=' + jobName + '&token=' + jenkinsToken).post(null) (function(err, response, body) {
      if (err) {
        return msg.reply("I can't do that right now");
      } else {
        return msg.reply("Attempting cluster restart.");
      }
    });
  });
}
