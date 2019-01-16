// Pre-initialize variables, so that we can use them in all functions

let carbrands = null;
let models = null;
let categorys = null;
let link = null;
let usernames = null;
let passworts = null;
var admin_link= null;


//// as soon as DOM (Document Object Model) is loaded, do this:

$(document).ready(() => {

  console.log('DOM is ready!')

  carbrands = $('#select_carbrand'); // carbrand dropdown
  models = $('#select_model'); // model dropdown
  categorys = $('#select_category');
  link = $("#link_suggestion");
 
  // get carbrands and add them to dropdown menu
  
  getData(); 

  // listen for change in carbrand dropdown and show models for selected carbrand

  $('#select_carbrand').on('change', async (event) => {
    event.preventDefault();
    showModels( carbrands.find(":selected").text() );
  });

  if ($('#iframe_scene').is(':hidden')) {
    getLinks();
  };

  // listen for change in Model dropdown and show category for selected carbrand/model

  $('#select_model').on('change', async (event) => {
    event.preventDefault();
    showCategorys(carbrands.find(":selected").text(), models.find(":selected").text());
  });

  // listen for submit event on form (when button is pressed)

  $('#form_search').on('submit', async (event) => {
    event.preventDefault();
    await getCarScene(carbrands.find(":selected").text(), models.find(":selected").text());
  })

 
  //Suggest Link Form

  $("#form_suggest").on("submit", async (event) => {
    event.preventDefault();
    await suggestLink(carbrands.find(":selected").text(), models.find(":selected").text(), categorys.find(":selected").text(), link.val() );
  })

   // Admin loggin
 $('#form_login').on('submit', async (event) => {
  event.preventDefault();
  var usernames = document.querySelector("#loginname").value; 
  var passworts = document.querySelector("#password").value;
  await getLogin(usernames,passworts);
})

$('#admin_form_search').on('submit', async (event) => {
  event.preventDefault();
  gettabl_data(1);
})
});

//// functions are definded below this line


async function getData() {
  try {
    const response = await fetch("/carbrands", {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      headers: { "Content-Type": "application/json" }
    });
    console.log("I (hopefully) got the following Carbrands: ");
    const carbrandsJSON = await response.json();

    carbrandsJSON.forEach(row => {
      var option = document.createElement('option');
      option.text = row.carbrand;
      console.log(row.carbrand);
      carbrands.append(option);
    });
    showModels( carbrands.find(":selected").text() );
  } catch (err) {
    console.log(err.name + ":" + err.message);
  }
}

async function getLinks() {
  try {
    const response = await fetch("/links", {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      headers: { "Content-Type": "application/json" }
    });
    console.log('Got links: ');
    const linksJSON = await response.json();
    const ul = $('#car_list');

    linksJSON.forEach(row => {
      ul.append(`<li class="list-group-item"><a target="_blank" href="${row.link}">${row.carbrand}: ${row.model}</a></li>`)
    });
  
  } catch(err){
    console.log(err.name + ":" + err.message);
  }
}


async function showModels(carbrand) {
  // send selectet carbrand to server and wait for response
  // as soon as server sends us a list of models, add them to dropdown menu "model"
  console.log("Sending carbrand (" + carbrand + ") to server to get models...")
  
  var data = { "carbrand": carbrand };
  
  try {
    const response = await fetch('/models', {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const modelsJSON = await response.json();
    
    console.log("I (hopefully) got the following Models: ");
    
    models.empty(); // remove previous models from dropdown 

    modelsJSON.forEach(row => {
      console.log(row.model);
      
      var option = document.createElement('option');
      option.text = row.model;
      models.append(option);
    })
  } catch (err) {
    console.log(err.name + ": " + err.message);
  }
}

async function showCategorys(carbrand, model) {
  console.log("Sending carbrand (" + carbrand + ") and model (" + model + ") to server to get models...")
  
  var data = { "carbrand": carbrand, "model": model };
  
  try {
    const response = await fetch('/categorys', {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const categoryJSON = await response.json();
    
    console.log("I (hopefully) got the following categorys: ");
    
    categorys.empty(); // remove previous categorys from dropdown 

    categoryJSON.forEach(row => {
      console.log(row.category);
      
      var option = document.createElement('option');
      option.text = row.category;
      categorys.append(option);
    })
  } catch (err) {
    console.log(err.name + ": " + err.message);
  }
}

//suggest function

async function suggestLink(carbrand, model, category, link) {
  var data = {"carbrand" : carbrand, "model" : model, "category" : category, "link" : link};
  console.log("Brand: " + carbrand + " model: " + model + " category: " + category + link);

  const response = await fetch("/suggest", {
    method: "POST",
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  });

}

async function getCarScene(carbrand, model) {
  // add some temporay spaces so that we can already scroll down
  var data = { "carbrand": carbrand, "model": model };

  const response = await fetch("/carScene", {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const carSceneJSON = await response.json();

  // load scene in iframe 
  // if first time loading show some info about controls
  $('#info_controls').html("");
  if($('#iframe_scene').attr('src') == ""){
    $('#iframe_scene').attr('src', carSceneJSON.path);
    $("#myHeading").hide(); 
    $('#info_controls').removeClass('d-none');
    $('#info_controls').append("<br><br><div class=\"row justify-content-center\">&#8592; &#8594; Ansicht mit Pfeiltasten rotieren</div>");
    setTimeout(function(){ $('#info_controls').append("<br><br><div class=\"row justify-content-center\">&#9757; &#9757; Doppelklick auf gewünschten Bereich</div>");
      setTimeout(function(){ $('#info_controls').append("<br><br><div class=\"row justify-content-center\">&#9757; Klick auf Schrift zeigt Auswahl</div><br><br>"); 
        setTimeout(function(){ $('#info_controls').addClass('d-none'); $('#info_controls').empty(); $('#iframe_scene').removeClass('d-none'); $('#iframe_scene').focus(); }, 4000);}, 1200);}, 1200);
  } else {
    $('#iframe_scene').attr('src', carSceneJSON.path);
    $('#iframe_scene').removeClass('d-none');
    $('#iframe_scene').focus();
  }
}

//////////// ********************************************** ADMIN ***********************************




// passwort sending and anser
async function getLogin(username, passwort) {

  var data = { "username": username, "passwort": passwort};

  const response = await fetch("/login", {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  const rowJSON = await response.json();
  const rowJSONlink = rowJSON.row.link;
  if(rowJSONlink == undefined) return;
  admin_link = rowJSONlink;
  console.log("151 " + admin_link);
  window.location = rowJSONlink; 
  console.log("153 " + admin_link);
}


// Delete Butten
async function delete_row(clicked_id , para)
{
  var data = { "rowid": clicked_id};
  const response = await fetch("/deleteRow", {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    headers: {"Content-Type": "application/json",},
    body: JSON.stringify(data),
  });
  await response.json();

  gettabl_data(para);
}

// Veröffentlichen Button
async function save_row(clicked_id){
  var data = { "rowid": clicked_id};
  const response = await fetch("/saveRow", {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    headers: {"Content-Type": "application/json",},
    body: JSON.stringify(data),
  });
  gettabl_data(0);
}
// ******   Katergorriene 
async function gettabl_data(para){

  carbrands = $('#select_carbrand'); // carbrand dropdown
  models = $('#select_model'); // model dropdown
  carbrand = carbrands.find(":selected").text();
  model = models.find(":selected").text();

    var data = { "para": para , "carbrand": carbrand, "model": model};
  
  try {
    const response = await fetch('/adminTable', {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const rowsJSON = await response.json();
    
    $("#shouts").html(''); // remove previous rows from table
    
    let rowString = 
    `<tr>
    <th>Link</th>
    <th>Kategorie</th>
    <th>Automarke</th>
    <th>Model</th>
    <th>Löschen</th>
    </tr>`;
    

    let rowpublicString = `<tr>
    <th>Link</th>
    <th>Kategorie</th>
    <th>Automarke</th>
    <th>Model</th>
    <th>Veröffentlichen</th>
    <th>Löschen</th>
    </tr>`;
    if (para == 1){
    $("#shouts").append(rowString);
    $("#admin_form_search").css("display","block")
    }
    else if ( para == 0){
    $("#admin_form_search").css("display","none")
    $("#shouts").append(rowpublicString);
    }
  
    rowsJSON.forEach(row => {
      rowString = `<tr><td><a href=${row.link} style=\"display:block;margin:0px;width:100%;height:100%;\">                   ${row.link }<\/a><\/td> 
                  <td>${row.category} <\/td>
                  <td>${row.carbrand} <\/td>
                  <td>${row.model} <\/td>
                  <td><button id=\"${row.rowid}\" onClick=\"delete_row(this.id , 1 )\" class=\"btn btn-primary\">L\u00F6schen<\/button><\/td>
                  <\/tr>`;

                  rowpublicString = `<tr><td><a href=${row.link} style=\"display:block;margin:0px;width:100%;height:100%;\">                   ${row.link }<\/a><\/td> 
                  <td>${row.category} <\/td>
                  <td>${row.carbrand} <\/td>
                  <td>${row.model} <\/td>
                  <td><button id=\"${row.rowid}\" onClick=\"save_row(this.id)\" class=\"btn btn-primary\">Ver\u00F6ffentlichen<\/button><\/td>
                  <td><button id=\"${row.rowid}\" onClick=\"delete_row(this.id , 0)\" class=\"btn btn-primary\">L\u00F6schen<\/button><\/td>
                  <\/tr>`;

                  if (para == 1){
                    
                    $("#shouts").append(rowString);
                    }
                    else if ( para == 0){
                     
                    $("#shouts").append(rowpublicString);
                    }
    });
    
  } catch (err) {
    console.log(err.name + ": " + err.message);
  }
}