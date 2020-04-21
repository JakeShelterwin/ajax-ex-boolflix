// Creare un layout base con una searchbar (una input e un button) in cui possiamo scrivere completamente o parzialmente il nome di un film. Possiamo, cliccando il  bottone, cercare sull’API tutti i film che contengono ciò che ha scritto l’utente.
// Vogliamo dopo la risposta dell’API visualizzare a schermo i seguenti valori per ogni film trovato:
// Titolo
// Titolo Originale
// Lingua
// Voto

$(document).ready(function(){
  //dichiarazione variabili
  var bottoneCerca = $(".cerca");
  //Gestione Handlebars
  var modelloSchedaFilm = Handlebars.compile($(".infoMovies").html())

  //gestisco comportamento quando clicco sul bottone cerca
  bottoneCerca.click(trovaFilmCorrispondenti);

  //gestisco cosa succede quando premo il tasto invio sulla selezione .inputUtente
  $(".inputUtente").keypress(function(e) {
    // 13 sta a significare il tasto invio, è witch resistuisce il tasto pigiato
    //For key or mouse events, "which" property indicates the specific key or button that was pressed.
    if (e.which == 13) {
      trovaFilmCorrispondenti();
    }
  });

  /***********************************/
  /****** FUNZIONI DA RICHIAMARE *****/
  /***********************************/

    function trovaFilmCorrispondenti(){
      //prendi il valore inserito dall'utente
      var ricercaUtente = $(".inputUtente").val();
      //svuota eventuali film già cercati prima o avvisi che non è stato trovato nulla
      $(".films").find(".movie").remove()
      $(".films").find("p").remove()
      //chiamata Ajax per mostrare solo i film cercati
      $.ajax({
          url: "https://api.themoviedb.org/3/search/movie/",
          method: "GET",
          data: {
            api_key: "7ab1f00d1393dbddf2fd6b9abcef3d13",
            query: ricercaUtente,
          },
          // se la chiamata ha successo eseguo questi comandi
          success: function(data, stato){
            var arrayFilmTrovati = data.results;
            //debug, controllo cosa ho trovato in console
            console.log(arrayFilmTrovati);

            //se non trovo nulla, dimmelo
            if (arrayFilmTrovati.length === 0){
              $(".films").html("<p>Nessun risultato trovato </p>")
            }
            //altrimenti, per ogni film trovato in arrayFilmTrovati fai un append in html
            else {
              for (var i = 0; i < arrayFilmTrovati.length; i++) {
                var filmTrovato = {
                  titolo: arrayFilmTrovati[i].title,
                  titoloOriginale: arrayFilmTrovati[i].original_title,
                  lingua: arrayFilmTrovati[i].original_language,
                  voto: arrayFilmTrovati[i].vote_average,
                  img: "https://image.tmdb.org/t/p/w342" + arrayFilmTrovati[i].poster_path
                }
                if (arrayFilmTrovati[i].poster_path == null){
                  filmTrovato.img = "img/image-not-found.png"
                }
                //applico Handelbars al film trovato
                var templateHtml = modelloSchedaFilm(filmTrovato);
                //e lo appendo in HTML
                $(".films").append(templateHtml)
              }
            }
          },
          error: function(richiesta, stato, errore){
            $(".films").html("<p>Qualcosa non ha funzionato</p>");
          }
      })
      //svuoto l'input utente
      $(".inputUtente").val("");
  }

})
