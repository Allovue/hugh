# Description:
#   Unlock the office.
#

module.exports = (robot) ->
  robot.hear /let me in/i, (res) ->
    unlock = (door_id) -> robot.http("https://api.getkisi.com/locks/#{door}/access")
      .header('Host: api.getkisi.com')
      .header('Content-Type: application/json; charset=utf-8')
      .header('X-Authentication-Token: a68be37deacb63bd628bdd27a5c7b9c8')
      .header('Accept: application/json')
      .post('{"context":{"device":{"model":"iPhone 8","manufacturer":"Apple"},"os":{"name":"iOS","version":"11.4","rooted":false},"location":{"error":"Location data not accessible."},"app":{"version":"4.0.1","uuid":"D7FEBEEB-7FCC-4696-A123-1D3B11FCE7FD"},"services":[{"type":"GPS","enabled":true,"authorized":false},{"type":"BLE","enabled":true,"authorized":false}],"beacons":[]},"trigger":"manual","executed_on_enter":false}')

    unlock door for door in [3697,3698]
