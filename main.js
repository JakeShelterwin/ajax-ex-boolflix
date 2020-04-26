// Creare un layout base con una searchbar (una input e un button) in cui possiamo scrivere completamente o parzialmente il nome di un film. Possiamo, cliccando il  bottone, cercare sull’API tutti i film che contengono ciò che ha scritto l’utente.
// Vogliamo dopo la risposta dell’API visualizzare a schermo i seguenti valori per ogni film trovato:
// Titolo, Titolo Originale, Lingua, Voto
//Trovare anche le serie TV, la lingua deve mostrare una bandierina per le nazionalità principali o una sigla e deve esserci una votazione di 5 stelle arrotondata per eccesso 6.4 -> 4 stelle 5.9-> 3 stelle
//all'hover del mouse compare un overview dell'opera oppure se non disponibile il suo titolo
//aggiunto un selettore per mostrare solo serieTV o solo Film o entrambi
//aggiunto un selettore per filtrare i risultai in base al genere

$(document).ready(function(){
  //dichiarazione variabili
  var bottoneCerca = $(".cerca");
  //Preparo gli array che si riempiranno con i generi di film e tv rispettivamente
  var arrayGeneriFilm=[];
  var arrayGeneriTV=[];

  //Gestione Handlebars
  var modelloSchedaFilm = Handlebars.compile($(".infoMovies").html());

  //gestisco comportamento quando clicco sul bottone cerca
  var arrayPerRiempireSelettoreGeneri = [];
  bottoneCerca.click(function(){
    //nascondi il filtro generi, sarà mostrato se necessario tramite la funzione trovaFilmeSerieTvCorrispondenti
    $("#filtroGeneri").hide();
    //Ripristino il selettore film/SerieTV
    $("#filtro").val("everywhere");
    trovaFilmeSerieTvCorrispondenti();
    //ripristino l'array se dentro c'era qualcosa, che si riempirà quando si richiama ciclaGeneri
    arrayPerRiempireSelettoreGeneri = [];
  });

  //gestisco cosa succede quando premo il tasto invio sulla selezione .inputUtente
  $(".inputUtente").keypress(function(e) {
    // 13 sta a significare il tasto invio, è witch resistuisce il tasto pigiato
    //For key or mouse events, "which" property indicates the specific key or button that was pressed.
    if (e.which == 13) {
      //nascondi il filtro generi, sarà mostrato se necessario tramite la funzione trovaFilmeSerieTvCorrispondenti
      $("#filtroGeneri").hide();
      //Ripristino il selettore film/SerieTV
      $("#filtro").val("everywhere");
      trovaFilmeSerieTvCorrispondenti();
      //ripristino l'array se dentro c'era qualcosa, che si riempirà quando si richiama ciclaGeneri
      arrayPerRiempireSelettoreGeneri = [];
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

  //Selettore del genere
  $( ".avvisi" ).on( "change", "#filtroGeneri",
  function() {
      var classe = $("#filtroGeneri option:selected").val();
      console.log(classe);
      if (classe=="Mostra"){
        $(".movie").show();
      } else {
          $(".movie").each(
          function (){
            if ($(this).hasClass(classe)){
              $(this).show();
            } else {
              $(this).hide();
            }
          }
        );
      }
    }
  );

  // trovo i generi di film e tv e li metto in 2 array
  generaGeneriFilm();
  generaGeneriSerieTV();

  /***********************************/
  /********** FUNZIONI VARIE *********/
  /***********************************/

    function trovaFilmeSerieTvCorrispondenti(){
      //prendi il valore inserito dall'utente
      var ricercaUtente = $(".inputUtente").val();
      // se l'utente ha inserito qualcosa, fai partire la ricerca
      if (ricercaUtente!=="") {
        //svuota eventuali film già cercati prima o avvisi che non è stato trovato nulla
        $(".films").find(".movie").remove();
        $(".avvisi p").remove();
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
              // console.log("array Film Trovati:", arrayFilmTrovati);

              //se non trovo nulla, dimmelo
              if (arrayFilmTrovati.length === 0){
                $("#filtro").hide();
                $(".avvisi").append("<p>Nessun Film Trovato</p>");
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
        });
      }
  }

  //queste funzione oltre che trovare le serie tv gestisce anche l'apparizione del selettore per mostrare
  // sia serie tv che film, o film, o serie tv
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
            // console.log("array SerieTV trovate:", arrayFilmTrovati);

            //se non trovo nulla, dimmelo
            if (arrayFilmTrovati.length === 0){
              $("#filtro").hide();
              $(".avvisi").append("<p>Nessuna serieTV Trovata</p>");
            }
            //altrimenti, per ogni opera salvata in arrayFilmTrovati fai un append in html
            else {
              generaOutput(arrayFilmTrovati, "SerieTV");
              //gestisco l'apparizione del selettore, che appare solo se sono stati trovati sia film che serie tv
              if ($(".films").find(".movie.Film").length>0 && $(".films").find(".movie.SerieTV").length>0){
                $("#filtro").show();
              }
            }
            preparaSelettoreGeneri();
          },
          error: function(richiesta, stato, errore){
            $(".films").html("<p>Qualcosa non ha funzionato</p>");
          }
      });
    }
}

// Funzione Generale che forma l'oggetto da cui estrarre film e serieTV
//richiama anche la funzione che popola gli array arrayGeneriFilm e arrayGeneriTV
function generaOutput(listaOggetti, tipo) {
  for (var i = 0; i < listaOggetti.length; i++) {
    var elementoTrovato = listaOggetti[i];
    // console.log(elementoTrovato.genre_ids);
    var titolo, titoloOriginale, cicloGeneri;
    // preparo i valori da usare nell'oggetto successivo per il voto in stelle
    var votoInStelle=Math.ceil(((elementoTrovato.vote_average)/2));
    // debug: controllo che funzioni
    // console.log(votoInStelle);
    // se tipo è movie
    if(tipo === "Film"){
      // allora var titoloGenerato = movie.title
      titolo = elementoTrovato.title;
      titoloOriginale = elementoTrovato.original_title;
      cicloGeneri = elementoTrovato.genre_ids;
   // se tipo è tv
    } else if (tipo === "SerieTV"){
      titolo = elementoTrovato.name;
      titoloOriginale = elementoTrovato.original_name;
      cicloGeneri = elementoTrovato.genre_ids;
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
      overView: trovaOverview(elementoTrovato, tipo),
      classe: ciclaGeneri(cicloGeneri, tipo)
    };
    // se l'opera non ha una copertina, mostra un'immagine personalizzata
    if (elementoTrovato.poster_path == null){
      filmTrovato.img = "imgs/image-not-found.png";
    }
    //applico Handelbars all'opera trovata
    var templateHtml = modelloSchedaFilm(filmTrovato);
    //e lo appendo in HTML
    $(".films").append(templateHtml);
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

  // questa funzione quando richiamata trova i generi di ciascun film o serieTV
  function ciclaGeneri(arreyGeneriSingolaOpera, tipo){
    var stringaOttenuta = "";
    //cicla i generi di ciascun film
    for (var i=0; i<arreyGeneriSingolaOpera.length; i++){
      var elementoArray = arreyGeneriSingolaOpera[i];
      //per ciascuno di questi generi, controlla nell'array principale che contiene
      // gli id dei numeri (indici pari) con le corrispettive stringhe esplicative (indici dispari)
      //e concatena tutte le stringhe in una stringa unica
      for (var x = 0; x < arrayGeneriFilm.length; x++) {
        if (tipo==="Film"){
          if (elementoArray===arrayGeneriFilm[x]) {
            stringaOttenuta += " " + arrayGeneriFilm[x+1];
            //dei generi che ho trovato, se non l'ho ancora in contrato, aggiungilo nell'array
            //che servirà per generare il selettore di generi
            if (!(arrayPerRiempireSelettoreGeneri.includes(arrayGeneriFilm[x+1]))) {
              arrayPerRiempireSelettoreGeneri.push((arrayGeneriFilm[x+1]));
            }
          }
        }
        else if (tipo==="SerieTV"){
            if (elementoArray===arrayGeneriTV[x]) {
              stringaOttenuta += " " + arrayGeneriTV[x+1];
              if (!(arrayPerRiempireSelettoreGeneri.includes(arrayGeneriTV[x+1]))) {
                arrayPerRiempireSelettoreGeneri.push((arrayGeneriTV[x+1]));
              }
          }
        }
      }
    }
    //mostro il selettore del genere solo se i generi sono almeno 2
    //il < 3 indica questo, perché l'array contiene sempre l'opzione "mostra tutto" che ripristina e mostra tutti i generi...
    //se a quell'opzione viene aggiunto un solo genere allora ho 2 elementi nel selettore
    if (arrayPerRiempireSelettoreGeneri.length<3){
      $("#filtroGeneri").hide();
    } else {
      $("#filtroGeneri").show();
    }
    // ordino alfabeticamente i generi ottenuti
    arrayPerRiempireSelettoreGeneri.sort();

    //Adesso mi assicuro che comunque sia ordinato l'array, il primo elemento dell'array sia il valore "Mostra Tutto"
    if ((arrayPerRiempireSelettoreGeneri.includes("Mostra Tutto"))){
      for (var y = 0; y < arrayPerRiempireSelettoreGeneri.length; y++) {
         if (arrayPerRiempireSelettoreGeneri[y]==="Mostra Tutto"){
           arrayPerRiempireSelettoreGeneri.splice([y]);
         }
      }
    }
    arrayPerRiempireSelettoreGeneri.unshift("Mostra Tutto");
    // debug per vedere se funziona
    // console.log(arrayPerRiempireSelettoreGeneri);
    return stringaOttenuta;
  }


  //popola un array con i generi trovati di film e le stringhe relative
  // gli indici pari hanno l'id numerico, indici dispari hanno la stringa a cui si riferisce il precedente indice
  //esempio indice[0]-> 35 che corrisponde a indince[1] --> comedy
  function generaGeneriFilm(){
    $.ajax({
        url: "https://api.themoviedb.org/3/genre/movie/list",
        method: "GET",
        data: {
          api_key: "7ab1f00d1393dbddf2fd6b9abcef3d13",
          language: "en"
        },
        // se la chiamata ha successo eseguo questi comandi
        success: function(data, stato){
          //salvati il risltato ottenuto nella variabile arrayGeneriTrovatiFilm
          var arrayGeneriTrovatiFilm = data.genres;
          // controllo di trovare tutti i generi dei film: si!
          // console.log("generiFilm Trovati: ", arrayGeneriTrovatiFilm);
          for (var i = 0; i < arrayGeneriTrovatiFilm.length; i++) {
            arrayGeneriFilm.push(arrayGeneriTrovatiFilm[i].id);
            arrayGeneriFilm.push(arrayGeneriTrovatiFilm[i].name);
          }
          // debug
          // console.log(arrayGeneriFilm);
        },
        error: function(richiesta, stato, errore){
          console.log("ListaGeneriFilm non trovata");
        }
    });
  }

  //popola un array con i generi trovati di SerieTV e le stringhe relative
  // gli indici pari hanno l'id numerico, indici dispari hanno la stringa a cui si riferisce il precedente indice
  //esempio indice[0]-> 35 che corrisponde a indince[1] --> comedy
  function generaGeneriSerieTV(){
    $.ajax({
        url: "https://api.themoviedb.org/3/genre/tv/list",
        method: "GET",
        data: {
          api_key: "7ab1f00d1393dbddf2fd6b9abcef3d13",
          language: "en"
        },
        // se la chiamata ha successo eseguo questi comandi
        success: function(data, stato){
          //salvati il risltato ottenuto nella variabile arrayGeneriTrovatiTV
          var arrayGeneriTrovatiTV = data.genres;
          // controllo di trovare tutti i generi delle serie TV: si!
          // console.log("generiSerieTV Trovati: ", arrayGeneriTrovatiTV);
          for (var i = 0; i < arrayGeneriTrovatiTV.length; i++) {
            arrayGeneriTV.push(arrayGeneriTrovatiTV[i].id);
            arrayGeneriTV.push(arrayGeneriTrovatiTV[i].name);
          }
          // debug
          // console.log(arrayGeneriTV);
        },
        error: function(richiesta, stato, errore){
          console.log("ListaGeneriSerieTV non trovata");
        }
    });
  }
  //prepara selettore con i generi corrispondenti
  function preparaSelettoreGeneri(){
      // svuoto il filtroGeneri nel caso fosse pieno
      $("#filtroGeneri option").remove();
      //e lo riempio con i generi delle opere trovate
      for (var i = 0; i < arrayPerRiempireSelettoreGeneri.length; i++) {
        $("#filtroGeneri").append('<option value='+arrayPerRiempireSelettoreGeneri[i]+'>'+arrayPerRiempireSelettoreGeneri[i]+'</option>');
      }
      //ripristino l'array se dentro c'era qualcosa, che si riempirà quando si richiama ciclaGeneri
      arrayPerRiempireSelettoreGeneri = [];
      //debug, voglio controlalre di non aver fatto confusione
      // console.log("array al click movie",arrayPerRiempireSelettoreGeneri);
  }

});
