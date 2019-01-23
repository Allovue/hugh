module.exports = function(robot) {

  function sendFeedback(feedbackData, slackRes) {
    var data = JSON.stringify(feedbackData);

    robot.http("https://api.prodpad.com/v1/feedbacks")
      .header('Content-Type', 'application/json')
      .header('Authorization', `Bearer ${process.env.PRODPAD_API_KEY}`)
      .post(data)(function(err, res, body) {
        if (err) {
          return slackRes.reply(`Well dang there was an error sending your feedback:\n ${err}`)
        }
        return slackRes.reply("Your feedback was received!")
      })

  };

  robot.hear(/feedback (.*)/i, function(res) {
    var feedbackData = {
      name: res.message.user.real_name,
      email: res.message.user.email_address,
      feedback: res.match[1],
    }
    return sendFeedback(feedbackData, res);
  })
}





