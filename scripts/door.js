Kisi = require('kisi-client');
kisiClient = new Kisi.default();

var kisiUsername = process.env.KISI_USERNAME;
var kisiPassword = process.env.KISI_PASSWORD;

module.exports = function(robot) {
  return robot.hear(/let me in/i, function(res) {
    return kisiClient.signIn(kisiUsername, kisiPassword).
      then(function() { kisiClient.post("locks/3697/unlock") }).
      then(function() { kisiClient.post("locks/3698/unlock") }).
      then(function() { res.reply("Unlocking both :door:s") }).
      catch(function() { res.reply("I can't open the :door:") })
  })
}
