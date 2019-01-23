// We are using Jason's ProdPad key for this as of 1/23/19

// If you want to scope the listener to a single channel (room),
// set the feedbackRoomId env var. It can be found by looking at
// the end of the URL when you visit a slack channel in the browser.

var prodpadKey     = process.env.PRODPAD_API_KEY,
    feedbackRoomId = process.env.FEEDBACK_ROOM_ID, // e.g. C0PFAF5QRS
    errorMessage   = process.env.PRODSLACK_ERROR_MESSAGE,
    successMessage = process.env.PRODSLACK_SUCCESS_MESSAGE;

var sendFeedback = function(feedbackData, slackRes) {
  var data = JSON.stringify(feedbackData);

  robot.http("https://api.prodpad.com/v1/feedbacks")
    .header('Content-Type', 'application/json')
    .header('Authorization', `Bearer ${prodpadKey}`)
    .post(data)(function(err, res, body) {
      if (err) {
        return slackRes.reply(errorMessage || `Well dang, there was an error sending your feedback:\n ${err}`)
      }
      return slackRes.reply(successMessage || "Your feedback was successfully added to ProdPad")
    });
};

module.exports = function(robot) {
  robot.hear(/^feedback (.*)/i, function(res) {
    var feedbackData = {
      name: res.message.user.real_name,
      email: res.message.user.email_address,
      feedback: res.match[1],
    }

    var messageRoomId = res.message.room;
    console.log('recevied a feedback request')
    console.log('feedback room ID is: ', feedbackRoomId)
    if(!feedbackRoomId || feedbackRoomId === messageRoomId){
      console.log('sending the feedback to prodpad')
      // return sendFeedback(feedbackData, res);
    }

  })
}
