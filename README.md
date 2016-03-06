# Fanclubs Schema
Schemaapp för Teknisk Fysik F-15 Fanclub på KTH.

![Logga](https://lh3.googleusercontent.com/6smOW8EC7md_V6UiYiZNd4hKzMf861GiuF5BL3-zuE2BHWNeI7ZAalYw8klp29wCUQ=w300-rw "Logga")

- [Google Play](https://play.google.com/store/apps/details?id=com.HelmerNylen.fanclubschema)
- Applelänk kommer när den finns på App Store, vilket kan ta ett tag

## För utvecklare
Bra-att-ha:
- [Hur du fixar en API-nyckel](http://wpdocs.philderksen.com/google-calendar-events/getting-started/api-key-settings/). Jag tog Android-nyckel i stället för server, men ska man bara testa så funkar nog vilken som.
- [Ionics Komponenter](http://ionicframework.com/docs/components/#header), bra om man ska göra en ny sida eller tycker att jag har designat något illa.
- [Ikoner](http://ionicons.com/)
- [KTH:s APIer](http://www.kth.se/api/)
- [Googles Kalender-API](https://developers.google.com/google-apps/calendar/)
- Färgen [Fysikorange](http://old.f.kth.se/styrdokument/THS_Fysiksektionens_Stadgar.pdf) är #FF642B. Använd klassen ```ctfys``` eller typ ```button-ctfys``` för att få den direkt på knappar e.d.
- [Stilguide](https://www.se.rit.edu/~tabeec/RIT_441/Resources_files/How%20To%20Write%20Unmaintainable%20Code.pdf) och [Motivationshöjande Musik](https://open.spotify.com/track/5TnZihe1AVVHPtgX1osH6Y)

### Hur kommer jag igång?
Appen körs i [Ionic](http://ionicframework.com/), de har en ganska bra [Getting Started](http://ionicframework.com/getting-started/)-sida och [Dokumentation](http://ionicframework.com/docs/).
#### 1. Ladda ner [Node.js](https://nodejs.org/en/)
Ionic verkar vilja ha version 4.

#### 2. Ladda ned Ionic och Cordova
Öppna ett kommandofönster och kör ```npm install -g cordova ionic```. Detta tar ett litet tag. Funkar inte kommandot kan du behöva hitta npm bland dina program och köra det direkt, för mig (Windows) ligger det under ```C:\Program Files\nodejs```.

#### 3. Ladda ned koden
Lägg i någon bra mapp.

#### 4. Testa!
Ställ ett kommandofönster i projektets rotmapp (dvs. den mapp där bl.a. config.xml finns) och kör där ```ionic serve```. (Igen, funkar inte det får du leta rätt på filen. För mig finns den i ```%appdata%\npm```.) Första gången behöver du välja hur du vill att Ionic ska hosta appen, det brukar finnas en IP-adress och en localhost. IP-adressen är nog bekvämast, då man kan testa direkt från mobilen via den.

Nu får du antagligen upp ett vitt fönster utan någon fin app. Öppnar du webbläsarkonsollen (F12 på Chrome) är det antagligen ett antal ilskna röda felmeddelanden där. Detta beror på två saker:

##### 4.1 IP-adresser
När man testar via ```ionic serve``` fungerar det inte att anropa API-er direkt med $http eller liknande. Under ```www/js/app.js``` finns en bunt konstanter under en kommentarswitch.

1. Du måste antagligen byta ut ip-addresserna mot din egen.
2. Om du pushar kod, se till att det är de riktiga URL-erna som är aktiva. Detta byts lättast genom att ändra ```//*/``` till ```/*/``` ovanför ip-URLerna. 
3. Under ```ionic.project``` finns en bunt proxys. Om du vill koppla upp något mot en address måste proxyn definieras här för att fungera medan man testar.
4. Detta lär gå att automatisera med Gulp, men jag har inte orkat.

**TLDR**: Öppna ```www/js/app.js``` och byt ut IP-adresserna mot den du valde när du körde ```ionic serve```.

##### 4.2 API-nyckel
Om sektionskalendern ska funka måste appen ha en giltig api-nyckel. Denna får man hantera lokalt. Skapa ```www/js/apikey.js``` och skriv i den
```
angular.module('starter.apikey', [])
.constant('APIkey', {
	key: "Shalalie"
});
```
där du byter ut Shalalie mot en giltig nyckel du fått från [Google Developer Console](https://console.developers.google.com/).
**Notera**: Du kan behöva lägga till filen och modulen trots att du inte vill testa sektionskalendern, då övriga delar av koden förutsätter att modulen finns.

#### 5. That's it!
Ionic, ett terminalfönster, en webbläsare (rekommenderar Chrome) och någon form av texteditor (jag kör Visual Studio eller Notepad++) är allt du behöver.

### Hur funkar det då?
Alltihopa är i princip en glorifierad hemsida, så det är HTML, JavaScript och CSS som gäller. Det börjar i ```www/index.html```.  Här importeras alla JS- och CSS-filer, och roten till all HTML sitter här. Allting hamnar nämligen inuti ```ion-nav-view```, under body.

I ```www/js/app.js``` definieras ett antal states. Alla states är understates till ```app```, och den anger att ```www/templates/menu.html``` att visas i nav viewen. Den är i sin tur en delad sida, som ger plats för ytterligare en nav view till höger om menyn. De olika understatesen anger vad som ska visas till höger om menyn, dvs det användaren glor på 90% av tiden. Byter vi state så byter vi sida. Defaultstate är ```app.feed```, och då är det ```www/templates/feed.html``` som visas.

Läser man under ```app.feed```-statet står det att den behöver en controller, nämligen ```FeedViewCtrl```. Den definieras i ```www/js/controllers.js```. En controller är i princip en funktion som körs, som låter HTML-filen via [AngularJS](http://www.w3schools.com/angular/) hämta och hantera data med JS-kod. Funktionen tar ett antal argument, exempelvis ```$scope```, och dem fyller Angular i när funktionen anropas så att de kan användas i den. Vi kan till exempel köra ```$scope.music = "Shalalie"``` i FeedViewCtrl, och om vi i feed.html skriver ```{{ music }}``` ersätts det med ```Shalalie```.

Varje menysida har sin egen controller, och för att kunna återanvända data på flera sidor använder vi services. Dessa finns i ```www/js/services.js```. När man i en controller lägger till ett argument, exempelvis ```DataService```, så kan DataService användas i den controllern.

#### Det här gör mig bara mer förvirrad
Men då tar vi ett exempel. Säg att vi vill göra en ny menysida med en enkel räknare. Vi gör då en ny sida, ```www/templates/counter.html```. Från början är den tom, men vi skriver i den följande:
```
<ion-view view-title="Räknare">
    <ion-content>
    </ion-content>
</ion-view>
```

Nu går vi till app.js. Kopiera ett state, typ ```app.food```, och klistra in det strax under. Byt sedan ut ```'app.food'``` mot ```'app.counter'```,  ```'/food'``` mot ```'/counter'```, ```'templates/food.html'``` mot ```'templates/counter.html'``` och ```'FoodCtrl'``` mot ```'CounterCtrl'```. Slutresultatet bör bli typ
```
(...)
          'menuContent': {
              templateUrl: 'templates/food.html',
              controller: 'FoodCtrl'
          }
      }
  })

.state('app.counter', {
      url: '/counter',
      views: {
          'menuContent': {
              templateUrl: 'templates/counter.html',
              controller: 'CounterCtrl'
          }
      }
  })

.state('app.section', {
      url: '/section',
(...)
```

Nu har vi sagt att om vi länkar användaren till ```/app/counter``` ska det till höger om menyn visas innehållet i ```counter.html```, och controllern ```CounterCtrl``` ska köras. Då får vi ta och skapa controllern. Öppna ```controllers.js``` och lägg till
```
.controller('CounterCtrl', function ($scope) {
	
})
```
längst ner i filen, innan sista ```;```.

Öppna nu ```menu.html``` och lägg till
```
<ion-item class="item-icon-left" menu-close href="#/app/counter" style="border: 0">
    <i class="icon ion-happy-outline"></i>
    Räknare
</ion-item>
```
under den ```ion-item``` som har texten Inställningar. Detta gör att man kan klicka sig till den nya sidan från menyn. Ikonen ```ion-happy-outline``` är en [Ionicon](http://ionicons.com/). Attributet ```menu-close``` gör att menyn stängs när vi trycker på knappen, och ```href="#/app/counter"``` gör att statet ändras till ```app.counter```.

Spara alla filer och prova. Är allt som det ska borde det gå att i menyn välja Räknare så att man hamnar på en tom sida. En tom sida är tråkig, så nu lägger vi till en knapp. Gå till ```counter.html``` igen och lägg till följande mellan ```ion-content```-taggarna:
```
<div style="text-align: center; padding: 1em;">
	<button class="button button-ctfys" ng-click="click()">
		{{ presses }} tryck!
	</button>
</div>
```
```{{ presses }}``` kommer att ersättas av värdet i ```$scope.presses```, och ```ng-click="click()"``` gör att funktionen ```$scope.click``` körs när vi trycker på knappen. Så då får vi ta och definiera dem. I vår controller lägger vi till
```
$scope.presses = 0;
$scope.click = function () {
  $scope.presses++;
};
```
Nu räknar knappen upp när vi trycker på den!
