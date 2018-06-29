Kisi = require('kisi-client');
kisiClient = new Kisi.default();

var kisiUsername = process.env.KISI_USERNAME;
var kisiPassword = process.env.KISI_PASSWORD;

module.exports = function(robot) {
  return robot.hear(/let me in/i, function(res) {
    return kisiClient.signIn(kisiUsername, kisiPassword).
      then(function() { res.reply("Opening the doors") }).
      then(function() { kisiClient.post("locks/3697/unlock") }).
      then(function() { kisiClient.post("locks/3698/unlock") }).
      catch(function() { res.reply("I can't open the :door:") })
  })

  return robot.hear(/mellon/i, function(res) {
    return kisiClient.signIn(kisiUsername, kisiPassword).
      then(function() { res.reply("The Doors of Durin slowly open...") }).
      then(function() { kisiClient.post("locks/3697/unlock") }).
      then(function() { kisiClient.post("locks/3698/unlock") }).
      catch(function() { res.reply("Nothing's happening.") })
  })
}
