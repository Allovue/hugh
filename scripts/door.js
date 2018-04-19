Kisi = require('kisi-client');
kisiClient = new Kisi.default();

module.exports = function(robot) {
  return robot.hear(/let me in/i, function(res) {
    return kisiClient.signIn('mark@allovue.com', 'Fs5-Hdb-FGN-NNS').
      then(function() { kisiClient.post("locks/3697/unlock") }).
      then(function() { kisiClient.post("locks/3698/unlock") }).
      catch(function() { res.reply("I can't open the :door:") })
  })
}
