
/* Add class raw javascript */

function hasClass(ele,cls) {
	return !!ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
}

function removeClass(element, className) {
	if (element && hasClass(element,className)) {
		var reg = new RegExp('(\\s|^)'+className+'(\\s|$)');
		element.className = ' ' + element.className.replace(reg,'') + ' ';
	}
}

function addClass(element, className) {
	if (element && !hasClass(element,className)) {
		element.className += '  '+ className + '  ';
	}
}

/* Simple group length compute for arrays */

function groupsLength(array, groupLength) {
  var remainder = array.length % 4;
  var groupNumber = (array.length - remainder) / 4;
  return remainder ? groupNumber + 1 : groupNumber;
}

// Higher-order functions for Nodelists and full browser support
// https://toddmotto.com/ditch-the-array-foreach-call-nodelist-hack/#recommendations
// These functions are taken from the allmighty http://eloquentjavascript.net/05_higher_order.html
// Also they have been adapted to support the index value
function forEachNl(array, action) {
  for (var i = 0; i < array.length; i++)
	action(array[i], i);
}

function filterNl(array, test) {
  var passed = [];
  for (var i = 0; i < array.length; i++) {
	if (test(array[i], i))
	  passed.push(array[i]);
  }
  return passed;
}

function mapNl(array, transform) {
  var mapped = [];
  for (var i = 0; i < array.length; i++)
	mapped.push(transform(array[i], i));
  return mapped;
}

function reduceNl(array, combine, start) {
  var current = start;
  for (var i = 0; i < array.length; i++)
	current = combine(current, array[i], i);
  return current;
}

function everyNl(array, predicate) {
  for (var i = 0; i < array.length; i++) {
	if (!predicate(array[i], i))
	  return false;
  }
  return true;
}

function someNl(array, predicate) {
  for (var i = 0; i < array.length; i++) {
	if (predicate(array[i], i))
	  return true;
  }
  return false;
}


/* Animation end detection */

function whichAnimationEvent(){
	var t;
	var el = document.createElement("fakeelement");

	var animations = {
		"animation"      : "animationend",
		"OAnimation"     : "oAnimationEnd",
		"MozAnimation"   : "animationend",
		"WebkitAnimation": "webkitAnimationEnd"
	};

	for(t in animations) {
		if (el.style[t] !== undefined){
			return animations[t];
		}
	}
}

var animationEvent = whichAnimationEvent();



// MIGHT BE USEFUL ONE DAY
// var lessVariables = {};

// forEachNl(document.styleSheets, function(sheet){
// 	forEachNl(sheet.cssRules, function(rule) {
// 		var sRule = rule.cssText;
// 		if (sRule.substr(0,5)=="#less") {
// 			var aKey = sRule.match(/\.(\w+)/);
// 			var aVal = sRule.match(/(\d+)/);
// 			if (aKey && aVal)
// 				lessVariables[aKey[1]] = aVal[0]<<0;
// 		}
// 	});
// });

// The less file must be in the form :
// #less {
// 	.margin { width: @margin; }
// 	.column { width: @column; }
// 	.gutter { width: @gutter; }
// }