// Commands:
// feedback - sends the subsequent text to canny as a feedback item. Currently only works in the product feedback channel.

// Notes:
// If you want to scope the listener to a single channel (room),
// set the feedbackRoomId env var. It can be found by looking at
// the end of the URL when you visit a slack channel in the browser.

// We are using Jason's ProdPad key for this as of 1/23/19

var airtableApiKey = process.env.AIRTABLE_API_KEY,
    airtableApiUrl = 'https://api.airtable.com/v0/appHAt8PJfbVnwr1g/Feedback'
    feedbackRoomId = process.env.FEEDBACK_ROOM_ID, // e.g. C0PFAF5QRS
    errorMessage   = process.env.PRODSLACK_ERROR_MESSAGE,
    successMessage = process.env.PRODSLACK_SUCCESS_MESSAGE,

module.exports = function (robot) {

  var postFeedback = function (feedbackData, slackRes) {

    robot.http(`${airtableApiUrl}`)
      .header('Content-Type', 'application/json')
      .post(data)(function(err, res, body) {
        var postID = JSON.parse(body).id;
        console.log('post created: ', body)
        if (postID) {replyWithURL(postID, slackRes)}
    })
  }

  var replyWithURL = function (postID, slackRes) {
    robot.http(`${cannyApiUrl}/posts/retrieve?apiKey=${cannyApiKey}&id=${postID}`)
      .header('Content-Type', 'application/json')
      .get()(function(err, res, body) {
        postURL = JSON.parse(body).url
        slackRes.reply(successMessage || `Your feedback has been posted to Canny.io and is visible here: ${postURL}`)
      })

  }

  robot.hear(/^#?feedback (.*)/i, function(res) {
    var feedbackData = {
      name: res.message.user.real_name,
      email: res.message.user.email_address,
      feedback: res.match[1],
    }

    var messageRoomId = res.message.room;
    if(!feedbackRoomId || feedbackRoomId === messageRoomId){
      return prepForFeedback(feedbackData, res);
    }

  })
}
