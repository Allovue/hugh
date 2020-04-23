// Commands:
// feedback - sends the subsequent text to canny as a feedback item. Currently only works in the product feedback channel.

// Notes:
// If you want to scope the listener to a single channel (room),
// set the feedbackRoomId env var. It can be found by looking at
// the end of the URL when you visit a slack channel in the browser.

// We are using Jason's ProdPad key for this as of 1/23/19

var cannyApiKey    = process.env.CANNY_API_KEY,
    cannyApiUrl    = 'https://canny.io/api/v1'
    feedbackRoomId = process.env.FEEDBACK_ROOM_ID, // e.g. C0PFAF5QRS
    errorMessage   = process.env.PRODSLACK_ERROR_MESSAGE,
    successMessage = process.env.PRODSLACK_SUCCESS_MESSAGE,
    cannyBoardID   = '5e9f570507cc5a0988c5945c';

module.exports = function (robot) {
  
  var prepForFeedback = function (feedbackData, slackRes) {
    robot.http(`${cannyApiUrl}/users/retrieve?apiKey=${cannyApiKey}&email=${feedbackData.email}`)
      .header('Content-Type', 'application/json')
      .get()(function(err, res, body) {
        var userID = JSON.parse(body).id;
        if (userID) {
          feedbackData["userID"] = userID;
          postFeedback(feedbackData, slackRes)
        } else {
          createCannyUser(feedbackData, slackRes)
        }
      });
  }

  var createCannyUser = function (feedbackData, slackRes) {
    console.log('Attempting to find or create a new user')
    robot.http(`${cannyApiUrl}/users/find_or_create?apiKey=${cannyApiKey}&name=${feedbackData.name}&email=${feedbackData.email}&userID=${feedbackData.email}`)
      .header('Content-Type', 'application/json')
      .get()(function(err, res, body) {
        if (body) {assert.throws(block, expected, 'message');
          var userID = JSON.parse(body).id;
          
          if (userID) {
            feedbackData["userID"] = userID;
            postFeedback(feedbackData, slackRes);
          }
        }
        if (err) {
          return slackRes.reply(errorMessage || `Well dang, there was an error getting your user ID info:\n ${err}`)
        }
      });
    }

  var postFeedback = function (feedbackData, slackRes) {
    robot.http(`${cannyApiUrl}/posts/create?apiKey=${cannyApiKey}&authorID=${feedbackData.userID}&boardID=${cannyBoardID}&title=${feedbackData.name}s Feedback&details=${feedbackData.feedback}`)
      .header('Content-Type', 'application/json')
      .get()(function(err, res, body) {
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
