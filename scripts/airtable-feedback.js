// Commands:
// feedback - sends the subsequent text to AirTable as a feedback item. Currently only works in the product feedback channel.

// Notes:
// If you want to scope the listener to a single channel (room),
// set the feedbackRoomId env var. It can be found by looking at
// the end of the URL when you visit a slack channel in the browser.

// We are using Jake Mauer's Airtable key for this as of 5/20/2020

var airtableApiKey = process.env.AIRTABLE_API_KEY,
    airtableApiUrl = 'https://api.airtable.com/v0/appHAt8PJfbVnwr1g',
    airtableFeedbackTableUrl = process.env.AIRTABLE_FEEDBACK_TABLE_URL || 'https://airtable.com/tblMADv92bjacPHAY/viwkAB29UaKLhQ67S',
    feedbackRoomId = process.env.FEEDBACK_ROOM_ID, // e.g. C0PFAF5QRS
    errorMessage   = process.env.PRODSLACK_ERROR_MESSAGE,
    successMessage = process.env.PRODSLACK_SUCCESS_MESSAGE;

module.exports = function (robot) {

  var postFeedback = function (feedbackData, slackRes) {

    var feedbackRecord = JSON.stringify({'records' : [
      {
        'fields': {
          "My Feedback": feedbackData.feedback,
          "From": feedbackData.email,
          "Submitter Name": feedbackData.name,
          "Where": "#product-feedback"
        }
      }
    ]});

    robot.http(`${airtableApiUrl}/Feedback`)
      .header('Authorization', `Bearer ${airtableApiKey}`)
      .header('Content-Type', 'application/json')
      .post(feedbackRecord)( function(err, res, body) {
        console.log('post created: ', body)
        console.log('parsed post created: ', JSON.parse(body))
        var postID = JSON.parse(body)['records'][0]['id'];
        if (postID) {replyWithURL(postID, slackRes)}
      })
  }

  var replyWithURL = function (postID, slackRes) {
    let postURL = `${airtableFeedbackTableUrl}/${postID}`;
    slackRes.reply(successMessage || `Your feedback has been posted to Airtable and is visible here: ${postURL}`)
  }

  robot.hear(/^#?feedback (.*)/i, function(res) {
    var feedbackData = {
      name: res.message.user.real_name,
      email: res.message.user.email_address,
      feedback: res.match[1],
    }

    var messageRoomId = res.message.room;
    if(!feedbackRoomId || feedbackRoomId === messageRoomId){
      return postFeedback(feedbackData, res);
    }

  })
}
