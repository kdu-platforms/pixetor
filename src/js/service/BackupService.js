(function () {
  var ns = $.namespace('pxtr.service');

  var ONE_SECOND = 1000;
  var ONE_MINUTE = 60 * ONE_SECOND;

  // Save every minute = 1000 * 60
  var BACKUP_INTERVAL = ONE_MINUTE;
  // Store a new snapshot every 5 minutes.
  var SNAPSHOT_INTERVAL = ONE_MINUTE * 5;
  // Store up to 12 snapshots for a pixetor session, min. 1 hour of work
  var MAX_SNAPSHOTS_PER_SESSION = 12;
  var MAX_SESSIONS = 10;

  ns.BackupService = function (pixetorController, backupDatabase) {
    this.pixetorController = pixetorController;
    // Immediately store the current when initializing the Service to avoid storing
    // empty sessions.
    this.lastHash = this.pixetorController.getPixetor().getHash();
    this.nextSnapshotDate = -1;

    // backupDatabase can be provided for testing purposes.
    this.backupDatabase = backupDatabase || new pxtr.database.BackupDatabase();
  };

  ns.BackupService.prototype.init = function () {
    this.backupDatabase.init().then(function () {
      window.setInterval(this.backup.bind(this), BACKUP_INTERVAL);
    }.bind(this));
  };

  // This is purely exposed for testing, so that backup dates can be set programmatically.
  ns.BackupService.prototype.currentDate_ = function () {
    return Date.now();
  };

  ns.BackupService.prototype.backup = function () {
    var pixetor = this.pixetorController.getPixetor();
    var hash = pixetor.getHash();

    // Do not save an unchanged pixetor
    if (hash === this.lastHash) {
      return Q.resolve();
    }

    // Update the hash
    // TODO: should only be done after a successful save.
    this.lastHash = hash;

    // Prepare the backup snapshot.
    var descriptor = pixetor.getDescriptor();
    var date = this.currentDate_();
    var snapshot = {
      session_id: pxtr.app.sessionId,
      date: date,
      name: descriptor.name,
      description: descriptor.description,
      frames: pixetor.getFrameCount(),
      width: pixetor.getWidth(),
      height: pixetor.getHeight(),
      fps: pixetor.getFPS(),
      serialized: pxtr.utils.serialization.Serializer.serialize(pixetor)
    };

    return this.getSnapshotsBySessionId(pxtr.app.sessionId).then(function (snapshots) {
      var latest = snapshots[0];

      if (latest && date < this.nextSnapshotDate) {
        // update the latest snapshot
        snapshot.id = latest.id;
        return this.backupDatabase.updateSnapshot(snapshot);
      } else {
        // add a new snapshot
        this.nextSnapshotDate = date + SNAPSHOT_INTERVAL;
        return this.backupDatabase.createSnapshot(snapshot).then(function () {
          if (snapshots.length >= MAX_SNAPSHOTS_PER_SESSION) {
            // remove oldest snapshot
            return this.backupDatabase.deleteSnapshot(snapshots[snapshots.length - 1]);
          }
        }.bind(this)).then(function () {
          var isNewSession = !latest;
          if (!isNewSession) {
            return;
          }
          return this.backupDatabase.getSessions().then(function (sessions) {
            if (sessions.length <= MAX_SESSIONS) {
              // If MAX_SESSIONS has not been reached, no need to delete
              // previous sessions.
              return;
            }

            // Prepare an array containing all the ids of the sessions to be deleted.
            var sessionIdsToDelete = sessions.sort(function (s1, s2) {
              return s1.startDate - s2.startDate;
            }).map(function (s) {
              return s.id;
            }).slice(0, sessions.length - MAX_SESSIONS);

            // Delete all the extra sessions.
            return Q.all(sessionIdsToDelete.map(function (id) {
              return this.deleteSession(id);
            }.bind(this)));
          }.bind(this));
        }.bind(this));
      }
    }.bind(this)).catch(function (e) {
      console.error(e);
    });
  };

  ns.BackupService.prototype.getSnapshotsBySessionId = function (sessionId) {
    return this.backupDatabase.getSnapshotsBySessionId(sessionId);
  };

  ns.BackupService.prototype.deleteSession = function (sessionId) {
    return this.backupDatabase.deleteSnapshotsForSession(sessionId);
  };

  ns.BackupService.prototype.getPreviousPixetorInfo = function () {
    return this.backupDatabase.findLastSnapshot(function (snapshot) {
      return snapshot.session_id !== pxtr.app.sessionId;
    });
  };

  ns.BackupService.prototype.list = function() {
    return this.backupDatabase.getSessions();
  };

  ns.BackupService.prototype.loadSnapshotById = function(snapshotId) {
    var deferred = Q.defer();

    this.backupDatabase.getSnapshot(snapshotId).then(function (snapshot) {
      pxtr.utils.serialization.Deserializer.deserialize(
        JSON.parse(snapshot.serialized),
        function (pixetor) {
          pxtr.app.pixetorController.setPixetor(pixetor);
          deferred.resolve();
        }
      );
    });

    return deferred.promise;
  };

  // Load "latest" backup snapshot.
  ns.BackupService.prototype.load = function() {
    var deferred = Q.defer();

    this.getPreviousPixetorInfo().then(function (snapshot) {
      pxtr.utils.serialization.Deserializer.deserialize(
        JSON.parse(snapshot.serialized),
        function (pixetor) {
          pxtr.app.pixetorController.setPixetor(pixetor);
          deferred.resolve();
        }
      );
    });

    return deferred.promise;
  };
})();
