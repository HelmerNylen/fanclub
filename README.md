# Fanclubs Schema
Schemaapp för Teknisk Fysik F-15 Fanclub på KTH.

![Logga](https://lh3.googleusercontent.com/6smOW8EC7md_V6UiYiZNd4hKzMf861GiuF5BL3-zuE2BHWNeI7ZAalYw8klp29wCUQ=w300-rw "Logga")

- [Google Play](https://play.google.com/store/apps/details?id=com.HelmerNylen.fanclubschema)
- Applelänk kommer när den finns på App Store, vilket kan ta ett tag

### För utvecklare
Appen körs i [Ionic](http://ionicframework.com/). Kolla under [Getting Started](http://ionicframework.com/getting-started/) för vilka andra verktyg som behövs.

Om sektionskalendern ska funka måste appen ha en giltig api-nyckel. Denna får man hantera lokalt. Skapa www/js/apikey.js och skriv i den
```
angular.module('starter.apikey', [])
.constant('APIkey', {
	key: "Shalalie"
});
```
där du byter ut Shalalie mot en giltig nyckel du fått från [Google Developer Console](https://console.developers.google.com/).
**Notera**: Du kan behöva lägga till filen och modulen trots att du inte vill testa sektionskalendern, då övriga delar av koden förutsätter att modulen finns.

När man testar via ```ionic serve``` fungerar det inte att anropa API-er direkt med $http eller liknande. Under www/js/app.js finns en bunt konstanter under en kommentarswitch.

1. Du måste antagligen byta ut ip-addresserna mot din egen.
2. Om du pushar kod, se till att det är de riktiga URL-erna som är aktiva. Detta byts lättast genom att ändra ```//*/``` till ```/*/``` ovanför ip-URLerna. 
3. Under ionic.project finns en bunt proxys. Om du vill koppla upp något mot en address måste proxyn definieras här för att fungera medan man testar.
4. Detta lär gå att automatisera med Gulp, men jag har inte orkat.

Bra-att-ha:
- [Hur du fixar en API-nyckel](http://wpdocs.philderksen.com/google-calendar-events/getting-started/api-key-settings/). Jag tog Android-nyckel i stället för server, men ska man bara testa så funkar nog vilken som.
- [Ionics Komponenter](http://ionicframework.com/docs/components/#header), bra om man ska göra en ny sida eller tycker att jag har designat något illa.
- [KTH:s APIer](http://www.kth.se/api/)
- [Googles Kalender-API](https://developers.google.com/google-apps/calendar/)
- Färgen [Fysikorange](http://old.f.kth.se/styrdokument/THS_Fysiksektionens_Stadgar.pdf) är #FF642B. Använd klassen ```ctfys``` eller typ ```button-ctfys``` för att få den direkt på knappar e.d.
- [Stilguide](https://www.se.rit.edu/~tabeec/RIT_441/Resources_files/How%20To%20Write%20Unmaintainable%20Code.pdf) och [Motivationshöjande Musik](https://open.spotify.com/track/5TnZihe1AVVHPtgX1osH6Y)

Koden är rätt fult skriven, delvis pga att CSS-filen inte funkar ibland, delvis då jag är JS-nybörjare, och delvis eftersom det mesta skrivits typ ett på natten. Vill du fixa saker, be my guest.

/Helmer
