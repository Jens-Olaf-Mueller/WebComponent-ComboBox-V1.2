# Web component that unites the functionality of the HTML elements SELECT, DATALIST and INPUT.

## Content
  * [Brief](#brief)
  * [How to Use](#how-to-use)
  * [Documentation](#full-jsdoc-documentation)
  * [Demo](#demo)
  * [ToDo](#todo)
  * [Change Log](#change-log)
	* [Screenshot](#screenshot)


## Brief 
  This web component provides a new HTML element that combines the features of three standard HTML elements:
  * INPUT element:    you can simply do keyboard inputs like in a common INPUT element
  * SELECT element:   items in the list can be selected by click or ENTER
  * DATALIST element: the list is filtered according to the input
  
  The element supports some specific attributes and all global HTML attributes.
  It dispatches different events in order to interact with the user.
  The element can be styled by CSS like any other HTML element and it supports some specific own CSS-properties.
  It is also completely accessable by JavaScript and provides full HTML form support.
		
  
## How to use
  Just link the [combobox_class.js](./src/combobox_class.js) in your project(s).
  Now you can use it either by JavaScript or HTML or both.

 	### HTML
		<combo-box><combo-box>
	

## Full JSDoc documentation
  A full documentation of the component you will find [here](https://jom-soft.com/webcomponents/combobox/docs/ComboBox.html)

## Demo
  For a demo visit my [demo page](https://jom-soft.com/webcomponents/combobox/index.html)

## ToDo
  - fix an issue when a long list is dropped and the user presses the Cursor down key.
  - support more events

## Change Log
  * V1.0.0
    - first stable version
  * V1.1.0
    - fixed some minor bugs and added new attributes
  * V1.2.0
    - added events
   
## Screenshot
	<image src="">
