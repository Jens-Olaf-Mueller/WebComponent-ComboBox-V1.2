# Web component that unites the functionality of the HTML elements SELECT, DATALIST and INPUT.


## Content
  * [Brief](#brief)
  * [How to Use](#how-to-use)
  * [Documentation](#full-jsdoc-documentation)
  * [Demo](#demo)
  * [Change Log](#change-log)
  * [Screenshots](#screenshots)
  * [ToDo](#todo)

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

  > [!NOTE]
  > Make sure you use the ```defer``` attribute in your HTML script-tag in order to assure
  > that the page is fully parsed. Alternatively put the script-tag at the end of the page.

  #### HTML

  ```html
  <script defer src="./src/combobox_class.js"></script>

  <combo-box name="myNewCombo" type="list" 
      size="7"
      options="Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday"
      placeholder=" please select a weekday "
      extendable>
  </combo-box>
  ```

  #### JavaScript

  ```javascript
  const combo = new ComboBox();
  combo.size = 7;
  combo.options = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  ```

  #### CSS

  ```css
  /* size of the dropdown arrow or plus-icon */
  --combo-arrow-size: 2rem;

  /* color of the dropdown arrow or plus-icon */
  --combo-accent-color: darkgreen;

  /* background color of the dropdown list */
  --combo-list-background: lightgreen;

  /* background color of the selected item */
  --combo-selected-background-color: green;

  /* text color of the selected item */
  --combo-selected-color: lightyellow;

  /* padding for the list items */
  --combo-item-padding: 0.5rem 1rem;
  ```

## Full JSDoc documentation
  A full documentation of the component you will find [here](https://jom-soft.com/webcomponents/combobox/docs/ComboBox.html)


## Demo
  For a demo visit the [demo page](https://jom-soft.com/webcomponents/combobox/index.html)


## Change Log
  * V1.0.0
      - first stable version
  * V1.1.0
      - fixed some minor bugs and added new attributes
  * V1.2.0
      - added events
      - added readme file


## Screenshots

<image src="/img/Screenshot1.jpg">
  Input of a not existing item displays the PLUS-sign on the right side, if the extendable attribute is set and indicates that the new item can be added by pressing the <kbd> ENTER </kbd> key.
<image src="/img/Screenshot2.jpg">

  The sort attribute displays the list sorted.
<image src="/img/Screenshot3.jpg">

  The size attribute defines how many items are displayed in the dropped list.
<image src="/img/Screenshot4.jpg">
	
  #### Styling the element's inside appearance
  Except from common styling of the component, you can style the list elements with these implemented CSS-properties:

  ```css
  /* change the color of the dropdown arrow or plus-icon */
  --combo-accent-color: red;
  /* set the background color of the selected item to pink */
  --combo-selected-background-color: pink;
  /* set the text color of the selected item to red */
  --combo-selected-color: red; /* or #ff0000 | rgb(255,0,0) */
  ```
<image src="/img/Screenshot5.jpg">

  ```css
  /* change the size of the dropdown arrow or plus-icon */
  --combo-arrow-size: 2rem;
  --combo-accent-color: darkgreen;
  /* set the background color of the dropdown list to lightgreen */
  --combo-list-background: lightgreen;
  --combo-selected-background-color: green;
  --combo-selected-color: lightyellow;
  ```
<image src="/img/Screenshot6.jpg">


## ToDo
  - fix an issue when a long list is dropped and the user presses the Cursor down key.
  - support more events
  - improving mobile support