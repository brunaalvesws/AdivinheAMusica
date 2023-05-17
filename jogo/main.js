//requisições para a API do spotify trazer os dados do usuário

async function getArtists(access_token) {
  const response = await fetch(
    'https://api.spotify.com/v1/me/following?type=artist',
    {
      headers: {
        'Authorization': 'Bearer ' + access_token
      }
    });
  const artists = await response.json()
  const getRandom = Math.floor(Math.random() * 20)
  var artist = artists.artists.items[getRandom]
  var artistName = artist.name
  var songName = await getArtistsInfo(access_token, artist.id)
  return { "song": songName, "artist": artistName }
}

async function getArtistsInfo(access_token, id) {
  const response = await fetch(
    `https://api.spotify.com/v1/artists/${id}/top-tracks?market=BR`,
    {
      headers: {
        'Authorization': 'Bearer ' + access_token
      }
    });
  const tracks = await response.json()
  const getRandom = Math.floor(Math.random() * 10)
  var song = tracks.tracks[getRandom]
  const regex = /^[a-zA-Z]+$/
  while (!regex.test(song.name)) {
    const getRandom = Math.floor(Math.random() * 10)
    var song = tracks.tracks[getRandom]
  }
  return song.name
}

//funções de desenhar o bonequinho na forca

function suporte() {
  const canvas = document.getElementById("forca");
  const context = canvas.getContext("2d");
  context.strokeStyle = '#444';
  context.lineWidth = 10;
  context.beginPath();
  context.moveTo(175, 225);
  context.lineTo(5, 225);
  context.moveTo(40, 225);
  context.lineTo(25, 5);
  context.lineTo(100, 5);
  context.lineTo(100, 25);
  context.stroke();
}

//funções que montam a tela inicial

function decodeMusic(string) {
  var decoded = ""
  for (var i = 0; i < string.length; i++) {
    (string[i] === " ") ? decoded = decoded + "-" : decoded = decoded + "_";
  }
  return decoded
}

async function showMusica(access_token) {
  var $guess = $('#palavra');
  var $tip = $('#tip');
  var musica = await getArtists(access_token);
  var decode = decodeMusic(musica.song)
  $guess.attr("data-value", musica.song)
  $guess.html(decode);
  $tip.html("Essa música é de: " + musica.artist);
  setModal();
}


function Restart() {
  window.location.reload()
}

function setModal() {
  var modal = document.querySelector(".modal");
  var btn = document.querySelector(".btn-open-modal");
  var span = document.querySelector(".close");
  modal.style.display = "block";

  btn.onclick = function () {
    modal.style.display = "block";
  }

  span.onclick = function () {
    modal.style.display = "none";
  }

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
}

window.onload = () => {
  /**
   * Obtains parameters from the hash of the URL
   * @return Object
   */
  function getHashParams() {
    var hashParams = {};
    var e, r = /[?&]([^=&]+)=([^&]+)/g,
      q = window.location.href.substring(1);
    console.log(e)
    console.log(r)
    console.log(q)

    while (e = r.exec(q)) {
      console.log(e);
      hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  var userProfileSource = document.getElementById('user-profile-template').innerHTML,
    userProfileTemplate = Handlebars.compile(userProfileSource),
    userProfilePlaceholder = document.getElementById('user-profile');

  var params = getHashParams();

  var access_token = params.access_token,
    refresh_token = params.refresh_token,
    error = params.error;

  if (error) {
    alert('There was an error during the authentication');
  } else {
    if (access_token) {
      $.ajax({
        url: 'https://api.spotify.com/v1/me',
        headers: {
          'Authorization': 'Bearer ' + access_token
        },
        success: function (response) {
          userProfilePlaceholder.innerHTML = userProfileTemplate(response);

          $('#login').hide();
          $('#loggedin').show();
          $('#guessgame').show();
          showMusica(access_token)
          suporte()
        }
      });
    } else {
      // render initial screen
      $('#login').show();
      $('#loggedin').hide();
      $('#guessgame').hide();
      $('#restart').hide();
    }

    document.getElementById('obtain-new-token').addEventListener('click', function () {
      $.ajax({
        url: '/refresh_token',
        data: {
          'refresh_token': refresh_token
        }
      }).done(function (data) {
        access_token = data.access_token;
      });
    }, false);
  }
};