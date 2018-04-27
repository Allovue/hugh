Kisi = require('kisi-client');
kisiClient = new Kisi.default();

const kisiUsername = process.env['KISI_USERNAME'];
const kisiApiKey = process.env['KISI_API_KEY'];

module.exports = function(robot) {
  return robot.hear(/let me in/i, function(res) {
    return kisiClient.signIn(kisiUsername, kisiApiKey).
      then(function() { kisiClient.post("locks/3697/unlock") }).
      then(function() { kisiClient.post("locks/3698/unlock") }).
      catch(function() { res.reply("I can't open the :door:") })
  })
}
