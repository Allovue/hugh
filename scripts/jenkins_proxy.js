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
