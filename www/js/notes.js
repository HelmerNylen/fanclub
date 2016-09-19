angular.module('starter.notes', ['starter.services'])

.factory('NoteService', function(StorageService, DebuggerService) {
    var notes = StorageService.getOrDefault("notes", []);

    var find = function (event) {
        for (var i = 0; i < notes.length; i++) {
            //sektionshändelse
            if (event.id && notes[i].id) {
                if (event.id == notes[i].id)
                    return i;
            }
            //KTH-händelse
            else if (event.url && notes[i].url) {
                if (event.url == notes[i].url)
                    return i;
            }
        }
        return -1;
    };
	
    return {
        setNote: function (note, event) {
            DebuggerService.log("Setting note: " + note);
            var index = find(event);
            if (index == -1) {
                var noteobj = { note: note };
                if (event.id) {
                    noteobj.id = event.id;
					notes.push(noteobj);
				}
                else if (event.url) {
                    noteobj.url = event.url;
					notes.push(noteobj);
				}
                else
                    DebuggerService.log("event could not be identified: " + JSON.stringify(event), "red");
            }
            else
                notes[index].note = note;

            StorageService.set("notes", notes);
        },
        getNote: function (event) {
            var index = find(event);
            return index != -1 ? notes[index].note : null;
        },
        getAllNotes: function () {
            return notes.map(function (a, b, c) { return a; });
        },
        clearNote: function (event) {
            var index = find(event);
            if (index != -1) {
				DebuggerService.log("Deleting note");
				
                notes.splice(index, 1);
				StorageService.set("notes", notes);
			}
        }
    };
})
;