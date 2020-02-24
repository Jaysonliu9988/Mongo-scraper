$(document).ready(function() {
  $(".scrape").on("click", scrapeArticle);
  $(".save-button").on("click", saveArticle);
  $(".delete-button").on("click", deleteArticle);
  $(".note-button").on("click", addNote);

  function scrapeArticle(event) {
    event.stopPropagation();
    $.ajax({
      method: "GET",
      url: "/scrape"
    }).then(function(data) {
      console.log(data);
      location.reload();
    });
  }

  function deleteArticle(event) {
    event.stopPropagation();
    let id = $(this).data("id");
    $.ajax({
      method: "DELETE",
      url: "/delete/" + id
    }).then(function() {
      location.reload();
    });
  }
  function saveArticle(event) {
    event.stopPropagation();
    var id = $(this).data("id");
    var saved = $(this).data("saved");

    let savedArticle = {
      saved: true
    };
    $.ajax({
      method: "put",
      url: "/saved/" + id,
      saved: savedArticle
    }).then(function() {
      location.reload();
    });
  }
  function addNote() {
    event.stopPropagation();

    $(".modal-body").empty();
    $("#myModal").modal("show");
    var thisId = $(this).attr("data-id");
    $.ajax({
      method: "GET",
      url: "/" + thisId
    }).then(function(data) {
      $.ajax({
        method: "GET",
        url: "/note/" + thisId
      }).then(noteData => {
        $(".modal-title").html("<h5>" + data.headline + "</h5>");
        // $(".modal-body").append("<input id='titleinput' name='title' placeholder='title'></br>");
        noteData.forEach(note => {
          $(".modal-body").append(
            "<p>" + note.noteTitle + ": " + note.noteBody + "</p>"
          );
        });
        $(".modal-body").append(
          "<textarea id='bodyinput' name='body'placeholder='comment'></textarea></br>"
        );
        // do something when you press the save note
        $(".modal-body").append(
          "<button data-id='" + data._id + "' id='savenote'>Save Note</button>"
        );
        if (data.note) {
          // $("#titleinput").val(data.note.noteTitle);
          // console.log(data.note.noteTitle);
          $("#bodyinput").val(data.note.noteBody);
        }
      });
    });
  }

  // function addNote() {
  //   event.stopPropagation();
  //   const thisId = $(this).attr("data-id");
  //   $('#article-id').text(thisId);
  //   $('#save-note-button').attr('data-id', thisId);
  //   $.ajax({
  //     method: "GET",
  //     url: "/" + thisId
  //   }).then(function (data) {
  //     console.log(data);
  //     $('.modal-body').empty();
  //     if (data[0].note.length > 0){
  //       data[0].note.forEach(v => {
  //         $('modal-body').append($(`<li class='list-group-item'>${v.text}<button type='button' class='btn btn-danger btn-sm float-right btn-deletenote' data='${v.thisId}'>X</button></li>`));
  //       });
  //     }
  //     else {
  //       $('.modal-body').append($(`<li class='list-group-item'>No notes for this article yet</li>`));
  //       console.log("Second ran!")
  //     }
  //     $('#myModal').modal('toggle');
  //   })

  //   $(".modal-body").empty();
  //       $("#myModal").modal("show")
  //       var thisId = $(this).attr("data-id");
  //       $.ajax({
  //           method: "GET",
  //           url: "/" + thisId
  //       }).then(function (data) {
  //         console.log(data)
  //         $(".modal-title").html("<h5>" + data.headline + "</h5>");
  //           $(".modal-body").append("<input id='titleinput' name='title' placeholder='title'></br>");
  //           $(".modal-body").append("<textarea id='bodyinput' name='body'placeholder='comment'></textarea></br>");
  //           $(".modal-body").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
  //           if (data.note) {
  //             $("#titleinput").val(data.note.noteTitle);
  //             console.log(data.note.noteTitle);
  //             $("#bodyinput").val(data.note.noteBody);
  //         }
  //   });
  // };

  $(document).on("click", "#savenote", function(event) {
    event.preventDefault();
    const thisId = $(this).attr("data-id");
    const noteBody = $("#bodyinput")
      .val()
      .trim();
    $("#bodyinput").val("");
    console.log("Ive been clicked");
    let requestData = {
      text: noteBody
    };
    console.log(requestData);
    $.ajax({
      method: "POST",
      url: "/" + thisId,
      data: {
        articleId: thisId,
        noteTitle: "Note",
        noteBody: noteBody
      }
    }).then(function(data) {
      console.log(data);
    });
    $("#myModal").modal("hide");
    // $("#titleinput").val("");
    $("#bodyinput").val("");
    // $('#myModal').modal('toggle');
  });
});
