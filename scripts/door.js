Kisi = require('kisi-client');
kisiClient = new Kisi.default();

var kisiUsername = process.env.KISI_USERNAME;
var kisiPassword = process.env.KISI_PASSWORD;

Array.prototype.randomElement = function() {
  return this[Math.floor(Math.random() * this.length)];
}

var doorUnlockedMessages = [
  "The door is probably open now",
  "The door might be open now",
  "I tried opening the door",
  "kisi told ME the door was open, but sometimes kisi lies",
  "Speak, friend, and enter",
  "Say 'friend' and enter",
  "Concentrate and ask again",
  "Reply hazy try again",
  "I think the door is unlocked now",
  "I'm givin' her all she's got, Captain!",
  "It's really quite a lovely hallway, isn't it?"
]

module.exports = function(robot) {
  robot.hear(/let me in/i, function(res) {
    return kisiClient.signIn(kisiUsername, kisiPassword).
      then(function() { res.reply(doorUnlockedMessages.randomElement()) }).
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
