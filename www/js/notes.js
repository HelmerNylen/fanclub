angular.module('starter.notes', ['starter.services'])

.factory('NoteService', function(StorageService) {
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
            console.log("setting note", note);
            var index = find(event);
            if (index == -1) {
                var noteobj = { note: note };
                if (event.id)
                    noteobj.id = event.id;
                else if (event.url)
                    noteobj.url = event.url;
                else
                    console.log("event could not be identified: ", event);
                notes.push(noteobj);
            }
            else
                notes[index].note = note;

            StorageService.set("notes", notes);
        },
        getNote: function (event) {
            var index = find(event);
            return index != -1 ? notes[index].note : null;
        },
        clearNote: function (event) {
            console.log("deleting note");

            var index = find(event);
            if (index != -1)
                notes.splice(index, 1);

            StorageService.set("notes", notes);
        }
    };
})
;