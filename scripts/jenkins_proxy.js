// Commands:
//   hubot copy <customer> to staging - triggers an background process to clone production data to staging
//   hubot I need a database dump for <customer|demo> - triggers a background process to generate a postgres dump file to be generated suitable for `pg_restore` locally.
//   hubot dump <customer|demo> - triggers a background process to generate a postgres dump file to be generated suitable for `pg_restore` locally.
//   hubot start the ETL for <customer> - starts the Extract/Transform/Load process to import data to Balance for the named customer. For a TINY number of customers that process does not include "extract".
//   hubot start the ETL for <customer> using <non-default-import_bucket_1,non-default-import_bucket_2> - starts the Extract/Transform/Load process to import data to Balance for the named customer. Overrides the per-customer vault value for "import_buckets" to allow prior years data to be loaded.
//   hubot start the import for <customer> - Skips customer extraction, begins ETL using whatever is in the S3 bucket for that district
//   hubot start the import for <customer> using <non-default-import_bucket_1,non-default-import_bucket_2> - Skips customer extraction, begins ETL using the S3 buckets specified
//   hubot backfill v3 for <customer> using <import_bucket> - Loads data from s3 into the database. Does not extract.
//   hubot restart (or rebuild) <PR number> - Destroys and re-creates a QA box for pull request number X.
//   hubot copy <customer> to qa <PR number> - Makes the QA box for the given pull request number use customer's data

var jenkinsURL = process.env.JENKINS_URL;
var jenkinsToken = process.env.JENKINS_TOKEN;

function buildUrlFor(jobName, parameter_name, parameter_value) {
  var url;
  if (parameter_name) {
    url = jenkinsURL + `/buildByToken/buildWithParameters?job=${jobName}&token=${jenkinsToken}&${parameter_name}=${parameter_value}`;
  } else {
    url = jenkinsURL + `/buildByToken/build?job=${jobName}&token=${jenkinsToken}`;
  }
  return url;
};

module.exports = function(robot) {
  robot.respond(/copy (\w+) to staging/i, function(msg) {
    var jobName = escape('ETL/3 copy data to staging');
    var customer = msg.match[1];

    robot.http(buildUrlFor(jobName, "customer", customer)).post(null) (function(err, response, body) {
      if (err) {
        return msg.reply("I can't do that right now");
      } else {
        return msg.reply("Copying " + customer + " to staging");
      }
    });
  })

  robot.respond(/copy (\w+) to qa (\w+)/i, function(msg) {
    var jobName = escape('Ad Hoc/copy data to qa');
    var customer = msg.match[1];
    var pr_number = msg.match[2];

    url = jenkinsURL + `/buildByToken/buildWithParameters?job=${jobName}&token=${jenkinsToken}&customer=${customer}&pr_number=${pr_number}`;
    robot.http(url).post(null) (function(err, response, body) {
      if (err) {
        return msg.reply("I can't do that right now");
      } else {
        return msg.reply("Copying " + customer + " to qa_" + pr_number + ".allovue.com");
      }
    });
  })

  robot.respond(/restart|rebuild (\w+)/i, function(msg) {
    var jobName = escape("Destroy and re-create QA box");
    var pull_request_number = msg.match[1];

    robot.http(buildUrlFor(jobName, "pr_number", pull_request_number)).post(null) (function(err, response, body) {
      if (err) {
        return msg.reply("I can't do that right now");
      } else {
        return msg.reply("Destroying and re-creating QA box for pull request: " + pull_request_number);
      }
    });
  })

  robot.respond(/(?:(?:I need|give me) a (?:database )?)?dump (?:for|from|of)?\s?(\w+)/i, function(msg) {
    var jobName = escape("Get DB dump for developer");
    var customer = msg.match[1];

    robot.http(buildUrlFor(jobName, "customer", customer)).post(null) (function(err, response, body) {
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
    var url = buildUrlFor(jobName, "customer", customer);
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
