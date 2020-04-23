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

  //quando gli elementi sono generati in modo appropiato, se l'utente vuole può selezionare e vedere solo film o serieTV o entrambi. Di default si mostrano sia serietv che film
  $( ".avvisi" ).on( "change", "#filtro",
  function() {
      if ($("#filtro").val()==="everywhere"){
        console.log("everywhere");
        $(".movie.Film").show();
        $(".movie.SerieTV").show();
      } else if ($("#filtro").val()==="onlyFilm"){
        console.log("film");
        $(".movie.Film").show();
        $(".movie.SerieTV").hide();
      } else if ($("#filtro").val()==="onlySeries"){
        console.log("tv");
        $(".movie.Film").hide();
        $(".movie.SerieTV").show();
      }
    }
  );

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
              language: "en",
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
                $("#filtro").hide();
                $(".avvisi").append("<p>Nessun Film Trovato</p>")
              }
              //altrimenti, per ogni opera salvata in arrayFilmTrovati fai un append in html
              else {
                generaOutput(arrayFilmTrovati, "Film");
              }
              //fai lo stesso per le serie televisive
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

  //queste funzione oltre che trovare le serie tv gestisce anche l'apparizione del selettore per mostrare
  // sia serie tv che film, o film, o serie tv ma il selettore compare solo se entrambe le funzioni
  // (quella che genera film e quella genera tv) hanno fatto append() a qualcosa in html, quindi se sono state eseguite entrambe
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
            language: "en",
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
              $("#filtro").hide();
              $(".avvisi").append("<p>Nessuna serieTV Trovata</p>")
            }
            //altrimenti, per ogni opera salvata in arrayFilmTrovati fai un append in html
            else {
              generaOutput(arrayFilmTrovati, "SerieTV");
              //gestisco l'apparizione del selettore, che appare solo se sono stati trovati sia film che serie tv
              if ($(".films").find(".movie.Film").length>0 && $(".films").find(".movie.SerieTV").length>0){
                $("#filtro").show();
              }
            }
          },
          error: function(richiesta, stato, errore){
            $(".films").html("<p>Qualcosa non ha funzionato</p>");
          }
      })
    }
}

// Funzione Generale che forma l'oggetto da cui estrarre film e serieTV
function generaOutput(listaOggetti, tipo) {
  for (var i = 0; i < listaOggetti.length; i++) {
    var elementoTrovato = listaOggetti[i];
    var titolo, titoloOriginale;
    // preparo i valori da usare nell'oggetto successivo per il voto in stelle
    var votoInStelle=Math.ceil(((elementoTrovato.vote_average)/2));
    // debug: controllo che funzioni
    // console.log(votoInStelle);
    // se tipo è movie
    if(tipo === "Film"){
      // allora var titoloGenerato = movie.title
      titolo = elementoTrovato.title;
      titoloOriginale = elementoTrovato.original_title;
   // se tipo è tv
    } else if (tipo === "SerieTV"){
      titolo = elementoTrovato.name;
      titoloOriginale = elementoTrovato.original_name;
    }
    // creo l'oggetto e lo riempio con i dati corrispondenti
    var filmTrovato = {
      tipo: tipo,
      titolo: titolo,
      titoloOriginale: titoloOriginale,
      lingua: mostraBandieraOtesto(elementoTrovato.original_language),
      voto: elementoTrovato.vote_average,
      votoInStelle: calcolaStelleGiuste(votoInStelle),
      img: "https://image.tmdb.org/t/p/w500" + elementoTrovato.poster_path,
      overView: trovaOverview(elementoTrovato, tipo)
    };
    // se l'opera non ha una copertina, mostra un'immagine personalizzata
    if (elementoTrovato.poster_path == null){
      filmTrovato.img = "imgs/image-not-found.png"
    }
    //applico Handelbars all'opera trovata
    var templateHtml = modelloSchedaFilm(filmTrovato);
    //e lo appendo in HTML
    $(".films").append(templateHtml)
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
      var bandierina = "<img src='imgs/flags/"+valore+".png' alt="+valore+">";
      return bandierina;
    } else{
      return valore;
    }
  }

  // questa funzione gestisce l'overview sia per le serieTV che per i Film
  function trovaOverview(valore, tipo){
    //se il valore.overview non è vuoto e è maggiore di 250 caratteri,
    //limitalo a 250 caratteri e aggiungi [...] per far vedere che interrotta
    if (valore.overview!="" && valore.overview.length>250){
      return "<span>Overview: </span>" + valore.overview.substring(0, 250) + "[...]";
    }
    //se non è vuota e non supera i 250 caratteri stampala
    else if (valore.overview!=""){
      return "<span>Overview: </span>" + valore.overview;
    }
    // altrimenti stampa il titolo dell'opera corrispondente
    else{
      if (tipo==="Film"){
      return "<span>Titolo: </span>" + valore.title;
      } else if (tipo==="SerieTV"){
        return "<span>Titolo: </span>" + valore.name;
      }
    }
  }

})
