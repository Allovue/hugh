// Commands:
//   hubot copy <customer> to staging - triggers an background process to clone production data to staging
//   hubot I need a database dump for <customer|demo> - triggers a background process to generate a postgres dump file to be generated suitable for `pg_restore` locally.
//   hubot restart the elasticsearch cluster - turns elasticsearch nodes off and back on again. Do this if (and only if) we're seeing a slew of errors and etl failures in a span of seconds/minutes.
//   hubot start the ETL for <customer> - starts the Extract/Transform/Load process to import data to Balance for the named customer. For a TINY number of customers that process does not include "extract".
//   hubot start the ETL for <customer> using <non-default-import_bucket_1,non-default-import_bucket_2> - starts the Extract/Transform/Load process to import data to Balance for the named customer. Overrides the per-customer vault value for "import_buckets" to allow prior years data to be loaded.
//   hubot start the import for <customer> - Skips customer extraction, begins ETL using whatever is in the S3 bucket for that district
//   hubot start the import for <customer> using <non-default-import_bucket_1,non-default-import_bucket_2> - Skips customer extraction, begins ETL using the S3 buckets specified
//   hubot reindex elasticsearch for <customer> - performs just the elasticsearch-updating portion of the ETL process for the named customer.
//   hubot backfill v3 for <customer> using <import_bucket> - Loads data from s3 into the database. Does not extract, does not update elasticsearch.

var jenkinsURL = process.env.JENKINS_URL;
var jenkinsToken = process.env.JENKINS_TOKEN;

function buildUrlFor(jobName, customer) {
  var url;
  if (customer) {
    url = jenkinsURL + '/buildByToken/buildWithParameters?job=' + jobName + '&token=' + jenkinsToken + '&customer=' + customer;
  } else {
    url = jenkinsURL + '/buildByToken/build?job=' + jobName + '&token=' + jenkinsToken;
  }
  return url;
};

module.exports = function(robot) {
  robot.respond(/copy (\w+) to staging/i, function(msg) {
    var jobName = escape('ETL/5 copy data to staging');
    var customer = msg.match[1];

    robot.http(buildUrlFor(jobName, customer)).post(null) (function(err, response, body) {
      if (err) {
        return msg.reply("I can't do that right now");
      } else {
        return msg.reply("Copying " + customer + " to staging");
      }
    });
  })

  robot.respond(/I need a database dump for (\w+)/i, function(msg) {
    var jobName = escape("Get DB dump for developer");
    var customer = msg.match[1];

    robot.http(buildUrlFor(jobName, customer)).post(null) (function(err, response, body) {
      if (err) {
        return msg.reply("I can't do that right now");
      } else {
        return msg.reply("Backing up " + customer);
      }
    });
  })

  robot.respond(/start the (etl|import) for ([-\w]+)( using (buckets )?([^ ]+))?/i, function(msg) {
    var etl_or_import = msg.match[1].toLowerCase();
    var jobName = escape(`ETL/hubot ${etl_or_import} trigger`);
    var customer = msg.match[2].toLowerCase();
    var import_bucket_override = msg.match[5];
    var url = buildUrlFor(jobName, customer);
    if (import_bucket_override) {
      url = url + '&import_bucket_override=' + escape(import_bucket_override);
    }

    robot.http(url).post(null) (function(err, response, body) {
      if (err) {
        return msg.reply("I can't do that right now");
      } else {
        return msg.reply("Starting " + etl_or_import + " for " + customer + (import_bucket_override ? " using " + import_bucket_override : ""));
      }
    });
  });

  robot.respond(/reindex elasticsearch for (\w+)/, function(msg) {
    var customer = msg.match[1];
    var jobName = escape("ETL/hubot elasticsearch trigger");

    robot.http(buildUrlFor(jobName, customer)).post(null) (function(err, response, body) {
      if (err) {
        return msg.reply("I can't do that right now");
      } else {
        return msg.reply("Reindexing ES for " + customer);
      }
    });
  });

  robot.respond(/restart the elasticsearch cluster/i, function(msg) {
    var jobName = escape("Restart elasticsearch cluster");

    robot.http(buildUrlFor(jobName)).post(null) (function(err, response, body) {
      if (err) {
        return msg.reply("I can't do that right now");
      } else {
        return msg.reply("Attempting cluster restart.");
      }
    });
  });

  robot.respond(/backfill v3 for ([-\w]+) using (buckets )?([^ ]+)?/i, function(msg) {
    var customer = msg.match[1].toLowerCase();
    var import_bucket_override = msg.match[3];
    var url = `${jenkinsURL}/buildByToken/buildWithParameters?job=${escape("ETL/Backfill v3 data")}&token=${jenkinsToken}&customer=${customer}&import_bucket_override=${escape(import_bucket_override)}`;

    robot.http(url).post(null) (function(err, response, body) {
      if (err) {
        return msg.reply("I can't do that right now");
      } else {
        return msg.reply(`Backfilling ${customer} ${import_bucket_override}`);
      }
    });
  });

}
