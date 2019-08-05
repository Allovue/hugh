var jenkinsURL = process.env.JENKINS_URL;
var jenkinsToken = process.env.JENKINS_TOKEN;

module.exports = function(robot) {
  robot.respond(/copy (.+) to staging/i, function(res) {
    var jobName = 'DB_copy'
    var customer = res.match[1];
    if (customer == "demo" || customer == "development") { customer = "demo" };
    robot.http(jenkinsURL + '/buildByToken/buildWithParameters?job=' + jobName + '&token=' + jenkinsToken + '&customer=' + customer).post(null) (function(err, res, body) {
      return res.reply("Copying " + customer + " to staging");
    });
  })

  robot.respond(/I need a database dump for (.+)/i, function(res) {
    var jobName = "Get%20DB%20dump%20for%20developer"
    var customer = res.match[1];
    robot.http(jenkinsURL + '/buildByToken/buildWithParameters?job=' + jobName + '&token=' + jenkinsToken + '&customer=' + customer).post(null) (function(err, res, body) {
      return res.reply("Backing up " + customer);
    });
  })

  robot.respond(/restart (the)? elasticsearch cluster/i, function(res) {
    var jobName = "Restart%20elasticsearch%20cluster"
    robot.http(jenkinsURL + '/buildByToken/build?job=' + jobName + '&token=' + jenkinsToken).post(null) (function(err, res, body) {
      return res.reply("Attempting cluster restart.");
    });
  });
}
