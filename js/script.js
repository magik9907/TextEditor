/*
TEXTEDITOR  (OBIEKTOWO)

-zliczanie slow i liter
-aktualizacja daty
-zapisywanie do localStorage i odczyt
-czyszczenie
-autozapis
-zapis po kliknieciu

*/
(function (){
   "use strict";
	
	/*zarzadzanie tekstarea*/
	var textManager = (function (){
		
		var textAreaValue = null;
		var updateDate = null;
		var wordAmount = 0;
		var letterAmount = 0;
		

		var getTextAreaValues = function(){
			return $textArea.value;
		};

		var setTextAreaValue = function(text){
			$textArea.value=text;
		};

		var textAreaCleaning = function(){
			$textArea.value = "";
		};

		var returnTextAreaValues = function(){
			textAreaValue = getTextAreaValues();
			updateDate = new Date().getTime();
			return {
				textContent:textAreaValue,
				updateDate:updateDate,		
			};
		};

		return {
			setTextAreaValue:setTextAreaValue,
			returnTextAreaValues:returnTextAreaValues,
			textAreaCleaning:textAreaCleaning
		};
	})();
	

	/*zliczanie statystyk*/
	var statisticManager = (function (){

		var wordAmount = 0;
		var letterAmount = 0;

		var setCalculator = function(text){
			if(""===text){
				return{
					letters:letterAmount,
					words:wordAmount
				};
			}	
			
			text = textCleaner(text);
			
			wordCalculator(text);
			letterCalculator(text);

			return{
				letters:letterAmount,
				words:wordAmount
			};	
		};

		var wordCalculator = function(text){
			text = text.split(/\s+/);
			console.log(text);
			wordAmount = text.length;
		};

		var letterCalculator = function(text){
			letterAmount = text.length;
		};

		var textCleaner = function(text){
			text = text.trim();
			text = text.replace(/\s\s+/, ' ');
			return text;
		};

		return{
			setCalculator:setCalculator
		};
		
	})();

	/*zapis i odczyt z local storage*/
	var storageManager = (function (){
		
		var saveToStorage = function(textValues){
			localStorage.setItem('text', textValues.textContent);
			localStorage.setItem('date', textValues.updateDate);
		};
	
		var loadFromStorage = function(){
			var text = localStorage.getItem("text");
			var date = localStorage.getItem('date');
			console.log(text, typeof(text));
			console.log(isNaN(date), typeof(date));
			if(""==text || isNaN(date) || ""==date){
				return false;
			}

			date = parseInt(date);
			return {
				textContent:text,
				dateContent:date
			};
		};

		return{
			saveToStorage:saveToStorage,
			loadFromStorage:loadFromStorage
		};
	})();

	/*Wyswietlanie  */
	var viewManager = (function (){

		var $letterSpan = document.querySelector(".js--letter-amount");
		var $wordSpan = document.querySelector(".js--word-amount");
		var $dateSpan = document.querySelector(".js--date");

		var updateDate = function(d){
			console.log(d,typeof(d));
			if( isNaN(d)){
				$dateSpan.innerHTML = "Brak zapisanych danych";
				return false;
			}
			var updateDateForm = dateForm(d);
			$dateSpan.innerHTML = updateDateForm;
		};

		var updateCounts = function(textValues){
			letterUpdate(textValues.letters);
			wordUpdate(textValues.words);
		};

		var letterUpdate = function(letter = 0){
			$letterSpan.innerHTML = letter;
		};

		var wordUpdate = function(word = 0){
			$wordSpan.innerHTML = word; 
		};

		var dateForm = function(d){
			var newDate = new Date(d);
			var date = setZeroDate(newDate.getDate());
			var month = setZeroDate(newDate.getMonth()+1);
			var fullYear = newDate.getFullYear();
			var hours = setZeroDate(newDate.getHours());
			var minutes = setZeroDate(newDate.getMinutes());
			var seconds = setZeroDate(newDate.getSeconds());

			var form = hours+":"+minutes+":"+seconds+", "+date+"-"+month+"-"+fullYear;

			return form;
		};

		var setZeroDate = function(d){
			if(10>d){
				return "0"+d;
			}
			return d;
		};

		return {
			updateCounts:updateCounts,
			updateDate:updateDate
		};
	})();


	var $textArea = document.querySelector('textarea');
	var interval = null;
	var intervalTime = 10000;

	var runSaveToStorage = function(){
		var values = textManager.returnTextAreaValues();
		storageManager.saveToStorage(values);
		viewManager.updateDate(values.updateDate);
		if (""===values.textContent) {
			viewManager.updateDate('text');
		}else{
			viewManager.updateDate(values.updateDate);
			values = statisticManager.setCalculator(values.textContent);
		}
		viewManager.updateCounts(values);
	}

	$textArea.addEventListener('focus',function(){
		interval = setInterval(function(){
			runSaveToStorage();
		},intervalTime);
	},false);
	
	$textArea.addEventListener('blur',function(){
			clearInterval(interval);
			interval = null;
	},false);

	$textArea.addEventListener("keyup",function(){
		var values = textManager.returnTextAreaValues();
		values = statisticManager.setCalculator(values.textContent);
		viewManager.updateCounts(values);
	},false);

	document.querySelector('.js--clear-btn').addEventListener('click',function(){
		textManager.textAreaCleaning();
		runSaveToStorage();
	},false);

	document.querySelector(".js--save-btn").addEventListener('click',function() {
		runSaveToStorage();
		if(null!==interval){
			clearInterval(interval);
			interval = null;
		}
	},false);	
	
	var load = function(){
		var values = storageManager.loadFromStorage();

		if (false !== values){
			viewManager.updateDate(values.dateContent);
			textManager.setTextAreaValue(values.textContent);

			if(""===values.textContent){
				values = statisticManager.setCalculator(values.textContent);
				
				viewManager.updateCounts(values);
			}
			return true;
		}

		viewManager.updateDate("text");
	};

	load();



})();