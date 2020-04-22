// Creare un layout base con una searchbar (una input e un button) in cui possiamo scrivere completamente o parzialmente il nome di un film. Possiamo, cliccando il  bottone, cercare sull’API tutti i film che contengono ciò che ha scritto l’utente.
// Vogliamo dopo la risposta dell’API visualizzare a schermo i seguenti valori per ogni film trovato:
// Titolo
// Titolo Originale
// Lingua
// Voto
//Trovare anche le serie TV, la lingua deve mostrare una bandierina per le nazionalità principali o una sigla e deve esserci una votazione di 5 stelle arrotondata per eccesso 6.4 -> 4 stelle 5.9-> 3 stelle

$(document).ready(function(){
  //dichiarazione variabili
  var bottoneCerca = $(".cerca");
  //Gestione Handlebars
  var modelloSchedaFilm = Handlebars.compile($(".infoMovies").html())

  //gestisco comportamento quando clicco sul bottone cerca
  bottoneCerca.click(trovaFilmeSerieTvCorrispondenti);

  //gestisco cosa succede quando premo il tasto invio sulla selezione .inputUtente
  $(".inputUtente").keypress(function(e) {
    // 13 sta a significare il tasto invio, è witch resistuisce il tasto pigiato
    //For key or mouse events, "which" property indicates the specific key or button that was pressed.
    if (e.which == 13) {
      trovaFilmeSerieTvCorrispondenti();
    }
  });

  /***********************************/
  /****** FUNZIONI VARIE *****/
  /***********************************/

    function trovaFilmeSerieTvCorrispondenti(){
      //prendi il valore inserito dall'utente
      var ricercaUtente = $(".inputUtente").val();
      // se l'utente ha inserito qualcosa, fai partire la ricerca
      if (ricercaUtente!=="") {
        //svuota eventuali film già cercati prima o avvisi che non è stato trovato nulla
        $(".films").find(".movie").remove()
        $(".avvisi p").remove()
        //chiamata Ajax per mostrare solo i film cercati
        $.ajax({
            url: "https://api.themoviedb.org/3/search/movie/",
            method: "GET",
            data: {
              api_key: "7ab1f00d1393dbddf2fd6b9abcef3d13",
              language: "it_IT",
              query: ricercaUtente,
              page: 1
            },
            // se la chiamata ha successo eseguo questi comandi
            success: function(data, stato){
              //salvati il risltato ottenuto nella variabile arrayFilmTrovati
              var arrayFilmTrovati = data.results;
              //debug, controllo cosa ho trovato in console
              console.log("array Film Trovati:", arrayFilmTrovati);

              //se non trovo nulla, dimmelo
              if (arrayFilmTrovati.length === 0){
                $(".avvisi").append("<p>Nessun Film Trovato</p>")
              }
              //altrimenti, per ogni opera salvata in arrayFilmTrovati fai un append in html
              else {
                for (var i = 0; i < arrayFilmTrovati.length; i++) {
                  // preparo i valori da usare nell'oggetto successivo per il voto in stelle e la lingua
                  var votoInStelle=Math.ceil(((arrayFilmTrovati[i].vote_average)/2));
                  // debug: controllo che funzioni
                  // console.log(votoInStelle);
                  var gestisceBandiera = arrayFilmTrovati[i].original_language
                  // debug: controllo che funzioni
                  // console.log(gestisceBandiera);
                  // creo l'oggetto e lo riempio con i dati trovati
                  var filmTrovato = {
                    tipo: "Film",
                    titolo: arrayFilmTrovati[i].title,
                    titoloOriginale: arrayFilmTrovati[i].original_title,
                    lingua: mostraBandieraOtesto(gestisceBandiera),
                    voto: arrayFilmTrovati[i].vote_average,
                    votoInStelle: calcolaStelleGiuste(votoInStelle),
                    img: "https://image.tmdb.org/t/p/w500" + arrayFilmTrovati[i].poster_path
                  }

                  // se l'opera non ha una copertina, mostra un'immagine personalizzata
                  if (arrayFilmTrovati[i].poster_path == null){
                    filmTrovato.img = "imgs/image-not-found.png"
                  }
                  //applico Handelbars al film trovato
                  var templateHtml = modelloSchedaFilm(filmTrovato);
                  //e lo appendo in HTML
                  $(".films").append(templateHtml)
                }
              }
              trovaSerieTvCorrispondenti();
              //svuoto l'input utente
              $(".inputUtente").val("");
            },
            error: function(richiesta, stato, errore){
              $(".films").html("<p>Qualcosa non ha funzionato</p>");
            }
        })
      }
  }

  function trovaSerieTvCorrispondenti(){
    //prendi il valore inserito dall'utente
    var ricercaUtente = $(".inputUtente").val();
    // se l'utente ha inserito qualcosa, fai partire la ricerca
    if (ricercaUtente!=="") {
      $.ajax({
          url: "https://api.themoviedb.org/3/search/tv?",
          method: "GET",
          data: {
            api_key: "7ab1f00d1393dbddf2fd6b9abcef3d13",
            language: "it_IT",
            query: ricercaUtente,
            page: 1
          },
          // se la chiamata ha successo eseguo questi comandi
          success: function(data, stato){
            //salvati il risltato ottenuto nella variabile arrayFilmTrovati
            var arrayFilmTrovati = data.results;
            //debug, controllo cosa ho trovato in console
            console.log("array SerieTV trovate:", arrayFilmTrovati);

            //se non trovo nulla, dimmelo
            if (arrayFilmTrovati.length === 0){
              $(".avvisi").append("<p>Nessuna serieTV Trovata</p>")
            }
            //altrimenti, per ogni opera salvata in arrayFilmTrovati fai un append in html
            else {
              for (var i = 0; i < arrayFilmTrovati.length; i++) {
                // preparo i valori da usare nell'oggetto successivo per il voto in stelle e la lingua
                var votoInStelle=Math.ceil(((arrayFilmTrovati[i].vote_average)/2));
                // debug: controllo che funzioni
                // console.log(votoInStelle);
                var gestisceBandiera = arrayFilmTrovati[i].original_language
                // debug: controllo che funzioni
                // console.log(gestisceBandiera);
                // creo l'oggetto e lo riempio con i dati trovati
                var filmTrovato = {
                  tipo: "SerieTV",
                  titolo: arrayFilmTrovati[i].name,
                  titoloOriginale: arrayFilmTrovati[i].original_name,
                  lingua: mostraBandieraOtesto(gestisceBandiera),
                  voto: arrayFilmTrovati[i].vote_average,
                  votoInStelle: calcolaStelleGiuste(votoInStelle),
                  img: "https://image.tmdb.org/t/p/w500" + arrayFilmTrovati[i].poster_path
                }

                // se l'opera non ha una copertina, mostra un'immagine personalizzata
                if (arrayFilmTrovati[i].poster_path == null){
                  filmTrovato.img = "imgs/image-not-found.png"
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
    }
}

  // questa funzione mostra le stelle, piene per i punti positivi e vuote per i punti mancanti
  function calcolaStelleGiuste(valore){
    var stella="";
    for (var i=0; i<valore; i++){
      stella=stella + "<i class='fas fa-star'></i>";
      // console.log(stella);
    }
    while (valore<5){
      stella=stella + "<i class='far fa-star'></i>";
      valore++;
    }
    return stella;
  }

  // questa funzione gestisce le bandierine
  function mostraBandieraOtesto(valore){
    if (valore==="de"||valore==="en"||valore==="es"||valore==="fr"||valore==="it"||valore==="ja"||valore==="pt"||valore==="zh"){
      var bandierina = "<img src='imgs/flags/"+valore+".png' alt=''>";
      return bandierina;
    } else{
      return valore;
    }
  }

})
