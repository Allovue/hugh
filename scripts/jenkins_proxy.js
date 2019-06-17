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
}
