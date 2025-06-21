const TMP_COMBOSTYLE = document.createElement('template'),
      TMP_PLUSSIGN = document.createElement('template'),
      TMP_ARROW = document.createElement('template'),
      TMP_CLOSE = document.createElement('template');

TMP_COMBOSTYLE.innerHTML = `
    <style>
        :host {
            display: inline-block;
            border: 1px solid silver;
            padding: 0;
        }

        :host:(input:disabled) {        
            border: 2px solid red;
        }

        #divCombo.jom-combo {
            height: 100%;
            display: inline-block;
            position: relative;            
            border-radius: inherit;           
        }

        #inpCombo.jom-input {
            height: 100%;
            /* outline: 2px solid transparent; */
            padding: 0 0 0 0.5rem;
            outline: none;
            border: none;
            border-radius: inherit;
            font: inherit;
        }

        .jom-input:disabled {
            background-color: field;
            color: fieldtext;
        }

        .jom-combo ul {
            position: absolute;
            width: 100%;
            z-index: 99998;
            list-style: none;
            padding: unset;
            margin: unset;
            margin-top: 1px;
            overflow-y: hidden;
        }

        .jom-combo ul:has(li) {
            border-bottom: 1px solid silver;
        }

        .jom-combo ul.scroll {
            overflow-y: scroll;
        }

        li.jom-list-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-left: 1px solid silver;
            border-right: 1px solid silver;
            background-color: var(--combo-list-background, field);
            padding: var(--combo-item-padding, 0.25rem 0.5rem);
        }

        li.jom-list-item:last-child {
            border-bottom: 1px solid silver;
        }

        li.jom-list-item[selected] {
            color: var(--combo-selected-color, white);
            background-color: var(--combo-selected-background-color, #0075ff);
        }

        .combo-icon {
            position: absolute;
            height: var(--combo-arrow-size, 1.25rem);
            width: var(--combo-arrow-size, 1.25rem);
            top: 50%;
            transform: translateY(-50%);
            right: 1px;
            cursor: pointer;
            z-index: 99999;
        }

        #divArrow {
            transition: transform 350ms ease;
        }

        :host([open]) #divArrow {
            transform: rotate(180deg) translateY(50%)
        }

        .combo-delete {
            display: flex;
            align-items: center;
            justify-content: center;
            aspect-ratio: 1 / 1;
            height: 0.75rem;
            cursor: pointer;
        }

        .combo-delete:hover svg {
            mix-blend-mode: exclusion;
            fill: var(--combo-selected-color, white);
            transform: scale(1.25);
        }

        .combo-icon svg {
            stroke: var(--combo-accent-color, #0075ff);
            fill: var(--combo-accent-color, #0075ff);
        }

        :host([disabled]) svg {
            stroke: #aaa;
            fill: #aaa;
        }

        :host[hidden], [hidden] {
            display: none;
        }
    </style>`;

TMP_PLUSSIGN.innerHTML = `
    <div id="divPlus" class="combo-icon" hidden>
        <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 200"
            stroke-width="20">
            <path d="M40 100 h120 M100 40 v120z"/>
        </svg>
    </div>`;

TMP_ARROW.innerHTML = `
    <div id="divArrow" class="combo-icon" hidden>
        <svg xmlns="http://www.w3.org/2000/svg"
            id="svgArrow"
            viewBox="0 0 100 100">
            <path d="M20 35 l30 30 l30-30z"/>
        </svg>
    </div>`;

TMP_CLOSE.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="#000000A0">
        <path d="M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.707.708L7.293 8l-3.646 3.646.707.708L8 8.707z"/>
    </svg>`;

class ComboBox extends HTMLElement {
    #size = 6;
    #type = 'combo';
    #dropped = false;
    #listindex = -1;
    #options = null;
    #internals = null;

    /**
     * @summary `getter`
     * Returns an array of all <code>getters</code> and <code>setters</code> of this class.
     * If only <code>getters</code> are wanted, the code must be changed from:
     * <code>...=> typeof descriptor.set  === 'function' TO: ...=> typeof descriptor.<strong>get</strong> === 'function'</code>
     * @memberof ComboBox
     * @member {String.<Array>} properties
     * @readonly
     * @see {@link https://stackoverflow.com/questions/39310890/get-all-static-getters-in-a-class}
     */
    get properties() {
        const props = Object.entries(Object.getOwnPropertyDescriptors(ComboBox.prototype))
            .filter(([key, descriptor]) => typeof descriptor.set === 'function')
            .map(([key]) => key);
        return props;
    }


    /**
     * @summary `getter | setter`
     * Returns or assigns the displayed list items.
     * Returns null if list is empty.
     * @memberof ComboBox
     * @member {String | String.<Array>} options
     */
    get options() {
        if (this.#options) return this.#options;
        if (this.hasAttribute('options')) return this.getAttribute('options');
        return null;
    }
    set options(newOpts) {
        if (newOpts == null) return;
        // handle HTML-array like: ['Germany','United Kindom','Poland'] (regEx removes braces)
        if (typeof newOpts === 'string') {
            newOpts = newOpts.replaceAll(/[^,\p{L}\d\s]+/gu, '').split(',');
        }
        this.#options = newOpts.map(opt => opt.trim());
        if (this.#options.length == 0) {
            this.showIcon(false);
            return;
        }
        const attrOpts = this.#options.join(','),
              icon = this.value.length > 0 && !this.#options.includes(this.value) ? 'plus' : 'arrow';
        this.showIcon(icon);
        if (!this.hasAttribute('options')) this.setAttribute('options', attrOpts);
    }

    /**
     * @summary `getter | setter`
     * Determines whether the ComboBox works as a simple dropdown list or if it provides the full new functionality.
     * The type may contain one of these values:
     * - combo (default)
     * - list
     * @memberof ComboBox
     * @member {String} type
     */
    get type() { return this.#type; }
    set type(newType) {
        newType = newType?.trim();
        if (!'list combo'.includes(newType)) return;
        this.#type = newType;
        this.setAttribute('type', newType);
        if (this.input) {
            this.input.toggleAttribute('disabled', (newType === 'list') || this.disabled);
            if (newType === 'list') this.input.value = '';
        }
    }


    /**
     * @summary `getter | setter`
     * <strong>true | false</strong>
     * Returns or determines whether the dropdown list can be extended by new entries or not.
     * If property is <strong>true</strong> or the corresponding HTML attribute is set,
     * a new entry can be added by pressing the <kbd>ENTER</kbd> key or clicking the + symbol
     * that appears on the right side of the control.
     * @memberof ComboBox
     * @member {Boolean} extendable
     */
    get extendable() { return this.hasAttribute('extendable'); }
    set extendable(flag) {
        this.toggleAttribute('extendable', this.toBoolean(flag));
    }


    /**
     * @summary `getter | setter`
     * Returns or determines if the displayed dropdown list is sorted or not.
     * <strong>true | false</strong>
     * @memberof ComboBox
     * @member {Boolean} sorted
     */
    get sorted() { return this.hasAttribute('sorted'); }
    set sorted(flag) {
        this.toggleAttribute('sorted', this.toBoolean(flag));
    }


    /**
     * @summary `getter | setter`
     * Returns or sets the control's disabled state. <strong>true | false</strong>
     * @memberof ComboBox
     * @member {Boolean} disabled
     */
    get disabled() { return this.hasAttribute('disabled'); }
    set disabled(flag) {
        this.toggleAttribute('disabled', this.toBoolean(flag));
        this.input.toggleAttribute('disabled', this.toBoolean(flag));
    }

    
    /**
     * @summary `getter | setter`
     * <strong>true | false</strong>
     * Tells us, if the dropdown list is open or closed and toggles the arrow button on the right side.
     * Toggles the <strong>open</strong> attribute in HTML.
     * @memberof ComboBox
     * @member {Boolean} isDropped
     */
    get isDropped() { return this.#dropped; }
    set isDropped(flag) {
        this.#dropped = this.toBoolean(flag);
        this.toggleAttribute('open', this.#dropped);
    }


    /**
     * @summary `getter | setter`
     * Returns or determines the count of displayed list items in the dropdown list.
     * Default value is 6.
     * @memberof ComboBox
     * @member {Number} size
     */
    get size() { return this.#size; }
    set size(newSize) {
        this.#size = Number(newSize);
        if (!this.hasAttribute('size')) this.setAttribute('size', newSize);
    }


    /**
     * @summary `getter | setter`
     * Returns or set's the value of the ComboBox.
     * @memberof ComboBox
     * @member {String} value
     */
    get value() { return this.input ? this.input.value : ''; }
    set value(newVal) { 
        if (!this.hasAttribute('value') && newVal !== '') this.setAttribute('value', newVal);
        const plus = this.getElement('divPlus');
        if (this.input) this.input.value = newVal;
        if (this.extendable && newVal !== '') {
            if (!this.#options || !this.#options.includes(newVal)) {
                if (plus) this.showIcon('plus');
            }
        }
    }


    /**
     * @summary `getter | setter`
     * Returns or sets the name attribute of the element.
     * @memberof ComboBox
     * @member {String} name
     */
    get name() { return this.input.name; }
    set name(newName) {
        if (!this.hasAttribute('name')) this.setAttribute('name', newName);
        this.input.name = newName;
    }


    /**
     * @summary `getter | setter`
     * Supplies the placeholder attribute to the internal input field.
     * @memberof ComboBox
     * @member {String} placeholder
     */
    get placeholder() { return this.hasAttribute('placeholder') ? this.getAttribute('placeholder') : ''; }
    set placeholder(newVal) {
        this.input.placeholder = newVal;
        if (!this.hasAttribute('placeholder')) this.setAttribute('placeholder', newVal);
    }


    /**
     * Returns a reference to the component's list element.
     * @readonly
     * @ignore
     */
    get list() { return this.getElement('lstCombo'); }


    /**
     * Returns the current selected list item.
     * @readonly
     * @ignore
     */
    get selectedItem() { return this.shadowRoot.querySelector('li[selected]'); }


    /**
     * Returns a reference to the component's input element.
     * @readonly
     * @ignore
     */
    get input() { return this.getElement('inpCombo'); }


    /**
     * @summary `getter`
     * Returns a list of all attributes to be observed.
     * Any attribute contained in this list will trigger the attributeChangedCallback method. 
     * @see {@link # attributeChangedCallback}
     * @memberof ComboBox
     * @member {Array.<String>} observedAttributes
     * @readonly
     */
    static get observedAttributes() {
        return ['options','type','size','value','name','extendable','sorted','placeholder','disabled'];
    }


    /**
     * Connects the control with HTML forms so that it's value will be submitted.
     * @readonly
     * @ignore
     */
    static formAssociated = true;


    /**
     * @classdesc
     * Creates a new HTML element that unites the features of the input, select- and the datalist-element.
     * The control provides a few additional features:
     * - assigning the list as string or string array
     * - adding new entries to the list if property 'extendable' is set to 'true'
     * - setting the length of the displayed dropdown list
     * - displaying the list sorted or unsorted
     * @version 1.2.0
     * @constructor ComboBox
     * @example
     * <COMBO-BOX extendable 
     *            size="8" 
     *            options="United States, Germany, United Kingdom"
     *            placeholder="-- select a country --">
     * </COMBO-BOX>// creates a new ComboBox element with these attributes:
     * 
     * // - extendable  - new items can be added to the list
     * // - size = "8"  - if expanded, the list displays max. 8 items without scrollbar
     * // - options     - this is the list to be displayed when dropped
     * // - placeholder - shows a placeholder, when the INPUT field is empty
     * 
     * @example
     * const combo = new ComboBox();
     * combo.options = ['Germany','United Kingdom','Panama','Netherlands','Portugal','Italy'];
     * combo.size = 8; // display 8 list items max. (default = 6)
     * combo.addListItem('Mexico'); // add a new item to the list
     * combo.removeListItem(2); // removes the second item (='Panama') from list
     * combo.value = 'Egypt'; // set the value of the ComboBox. If not in list it can be added!
     */
    constructor() {
        super();
        this.attachShadow({mode: 'open', delegatesFocus: true});
        this.#createChildren();
        // this.importStyleSheet();
        this.onArrowClick = this.onArrowClick.bind(this);
        this.onInput = this.onInput.bind(this);
        this.onKeydown = this.onKeydown.bind(this);
        this.addListItem = this.addListItem.bind(this);
        this.removeListItem = this.removeListItem.bind(this);
        this.#internals = this.attachInternals();
    }


    /**
     * Method is automatically called when the component is connected to the DOM.
     * Right moment to add event listeners and updating HTML attributes.
     * @ignore
     */
    connectedCallback() {
        this.#updateProperties();
        if (!this.hasAttribute('role')) this.setAttribute('role', 'listbox');
        if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', 0);
        const arrow = this.getElement('divArrow'),
              plus = this.getElement('divPlus'),
              size = `${this.input.clientHeight}px`;
        this.setAttributes(plus, {height: size, width: size});
        this.setAttributes(arrow, {height: size, width: size});
        plus.addEventListener('pointerdown', this.addListItem);
        this.input.addEventListener('input', this.onInput);
        this.input.addEventListener('keydown', this.onKeydown);
        // TODO: this.addEventListener('keydown', this.onKeydown);
        // expanding the list in list mode by arrow down click?!
        arrow.addEventListener('click', this.onArrowClick);
        this.addEventListener('blur', this.collapse);
    }


    /**
     * Method to clean up the event listeners and other stuff
     * when the component is removed from DOM.
     * @ignore
     */
    disconnectedCallback() {
        const arrow = this.getElement('divArrow'),
              plus = this.getElement('divPlus');
        plus.removeEventListener('click', this.addListItem);
        this.input.removeEventListener('input', this.onInput);
        this.input.removeEventListener('keydown', this.onKeydown);
        arrow.removeEventListener('click', this.onArrowClick);
        this.removeEventListener('blur', this.collapse);
    }


    /**
     * @description This method is called when an attribute has been changed, is new assigned
     * or right after the component is connected to the DOM.
     * The attribute must be listed in the observedAttributes property.
     * If the attribute's value has not been changed, the method has no effect.
     * @example
     * <COMBO-BOX name="surname"></COMBO-BOX> // setting the 'name' attribute to an element would trigger this method.
     * @param {string} attrName name of the changed attribute.
     * @param {any} oldVal old value of the attribute.
     * @param {any} newVal new value of the attribute.
     * @see #{@link observedAttributes}
     */
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (oldVal === newVal) return; // leave immediately if there are no changes!
        if (attrName == 'options') this.options = newVal;
        if (attrName == 'type') this.type = newVal;
        if (attrName == 'size') this.size = newVal;
        if (attrName == 'name') this.name = newVal;
        if (attrName == 'value') this.value = newVal;
        if (attrName == 'placeholder') this.placeholder = newVal;
        if (attrName == 'extendable') this.extendable = this.hasAttribute('extendable');
        if (attrName == 'sorted') this.sorted = this.hasAttribute('sorted');
        if (attrName == 'disabled') this.disabled = this.hasAttribute('disabled');
    }


    /**
     * Method is called when the control is connected to a form element.
     * Here can be applied some settings between the control an the form it's in.
     * @param {HTMLElement} form The parent form of the control.
     * @ignore
     */
    formAssociatedCallback(form) {
        // console.log(form, new FormData(form))
        // for advanced purposes...
    }


    /**
     * Adds a new entry to the list if the <strong>extendable</strong> attribute is set to <strong>true</strong>.
     * If the list is expanded it will be collapsed after adding it.
     * @param {Event | String | Number} item item to be added to the dropdown list.
     * @see {@link extendable}
     */
    addListItem(item) {
        let added = false;
        if (this.extendable) {
            if (item instanceof PointerEvent || item == undefined) item = this.value;
            if (this.#options == null) {
                this.#options = new Array(item);
                added = true;
            } else if (!this.#options.includes(item)) {
                this.#options.push(item);
                added = true;
            }
            this.showIcon('arrow');
        }
        if (added) this.#raiseEvent('addItem', item);
        this.collapse();
    }


    /**
     * Removes an existing list item from the options.
     * @param {Event | String | Number} item list item to be removed.
     */
    removeListItem(item) {
        let removeItem;
        if (item instanceof Event) {
            const index = item.currentTarget.dataset.index;
            removeItem = this.#options[index];
            this.#options.splice(index, 1);
        } else if (typeof item === 'string') {
            const index = this.#options.indexOf(item);
            if (index > -1) {
                removeItem = item;
                this.#options.splice(index, 1);
            }
        } else if (typeof item === 'number') {
            if (item < this.#options.length) {
                removeItem = this.#options[item];
                this.#options.splice(item, 1);
            }
        }

        if (removeItem) this.#raiseEvent('removeItem', removeItem);
        if (this.isDropped) this.expand();
        if (this.#options.length == 0) {
            this.value = '';
            this.showIcon(false);
        }
    }


    /**
     * Toggles the dropdown list.
     * @ignore
     */
    onArrowClick(evt) {
        if (this.disabled) return;
        evt.stopPropagation();
        if (this.isDropped) {
            this.collapse();
        } else {
            this.expand();
            this.input.setSelectionRange(0,0);
            this.#highlightSelectedItem(this.input.value);
        }
    }


    /**
     * Takes over the active list-item in the input field.
     * @ignore
     */
    onItemClick(evt) {
        if (evt.target.nodeName === 'LI') {
            this.input.value = evt.target.innerText;
            this.#internals.setFormValue(this.value, this.value);
            this.#raiseEvent('select', this.value);
            this.collapse();
            this.input.blur();            
        }
    }


    /**
     * Provides keyboard support for the control:
     * - ENTER-key takes over a new entry if the 'extendable' attribute is set.
     * - If the dropdown list is displayed and an item is selected, ENTER takes over the item.
     * - ARROW_UP | ARROW_DOWN applies scolling inside the list.
     * - ESCAPE closes the open dropdown list.
     * @param {event} evt Keydown event of the input element.
     * @ignore
     */
    onKeydown(evt) {
        if (this.disabled) return;
        const key = evt.key;
        if (this.isDropped) {
            if (key === 'Escape' || key === 'Delete') this.collapse();
            if (key.includes('Arrow')) {
                evt.preventDefault();
                this.#scroll(key);
            }
            if (key === 'Enter' && this.selectedItem) {
                this.input.value = this.selectedItem.innerText;
                this.collapse();
                this.#internals.setFormValue(this.value, this.value);
            }
        } else {
            if (key === 'Enter') this.addListItem();
            if (key === 'ArrowDown') {
                this.expand();
                this.#highlightSelectedItem(this.input.value);
            }
        }
        if (key === 'Delete') this.input.value = '';
    }


    /**
     * Filters, creates and displays the items of the list matching to the input.
     * @param {event} evt The input event of the input element.
     * @ignore
     */
    onInput(evt) {
        if (this.disabled) {
            evt.preventDefault();
            this.input.value = '';
            return;
        }
        const searchFor = evt.target.value.toLowerCase(),
              arrMatches = [];
        this.collapse();
        this.showIcon(false);
        if (searchFor.length == 0) {
            if (this.options?.length > 0) this.showIcon('arrow');
            return;
        }
        if (!this.options) {
            if (this.extendable) this.showIcon('plus');
            return;
        }
        for (let i = 0; i < this.options.length; i++) {
            const item = this.options[i];
            if (item.substring(0, searchFor.length).toLowerCase() === searchFor) {
                arrMatches.push(item);
            }
        }
        this.#internals.setFormValue(this.value, this.value);
        if (arrMatches.length == 0) {
            if (this.extendable) {
                this.showIcon('plus');
            } else if (this.options) {
                this.showIcon('arrow');
            }
            this.#listindex = -1;
            return;
        }
        const icon = (arrMatches.length > 0) ? 'arrow' : false;
        this.showIcon(icon);
        this.expand(arrMatches);
    }


    /**
     * Displays the selected item and synchronisizes the list-index.
     * @ignore
     */
    onMouseHover(evt) {
        if (evt.target.nodeName !== 'LI') return; // ignore the cross!
        if (this.selectedItem) this.selectedItem.removeAttribute('selected');
        evt.target.setAttribute('selected','');
        const list = this.shadowRoot.querySelectorAll('li.jom-list-item');
        this.#listindex = -1;
        do {
            this.#listindex++;
        } while (!list[this.#listindex].hasAttribute('selected'));
    }


    /**
     * Enables or disables either the dropdown arrow or the plus symbol.
     * @param {String | Boolean} type The icon to be displayed or disabled.
     * - 'arrow'         - the dropdown icon is displayed
     * - 'plus'          - displays the plus icon to indicate that an item can be added to the list
     * - 'none' | false  - disables all icons (i.e. when the list is empty)
     */
    showIcon(type) {
        const arrow = this.getElement('divArrow'),
              plus = this.getElement('divPlus');
        if (!(arrow && plus)) return;
        if (type === 'arrow') {
            arrow.removeAttribute('hidden');
            plus.setAttribute('hidden','');
        } else if (type === 'plus') {
            plus.removeAttribute('hidden');
            arrow.setAttribute('hidden','');
        } else if (type === false || type === 'none') {
            arrow.setAttribute('hidden','');
            plus.setAttribute('hidden','');
        }
    }


    /**
     * Shows the dropdown list.
     * The method is called either by click on the arrow button or by making an input into the <code>INPUT</code> field.
     * @param {String | String.<Array>} [options] String array of options to be displayed in the dropdown list.
     * If omitted, the current assigned item list is going to be displayed.
     */
    expand(options = this.#options) {
        this.isDropped = false; // prevents the 'close' event!
        this.collapse();
        this.isDropped = (options.length > 0);
        const items = (this.sorted) ? options.sort() : options;
        for (let i = 0; i < items.length; i++) {
            const item = document.createElement('li');
            let cross;
            if (this.extendable && this.type === 'combo') {
                cross = document.createElement('div');
                cross.append(TMP_CLOSE.content.cloneNode(true));
                this.setAttributes(cross, {"data-index": i, class: "combo-delete"});
                cross.addEventListener('click', (evt) => this.removeListItem(evt));
            }
            item.className = 'jom-list-item';
            item.innerText = items[i];
            if (cross) item.appendChild(cross);
            item.addEventListener('click', (evt) => this.onItemClick(evt));
            item.addEventListener('pointermove', (evt) => this.onMouseHover(evt));
            this.list.appendChild(item);
            if (i >= this.size - 1 && !this.list.classList.contains('scroll')) {
                const height = item.clientHeight * this.size + 1;
                this.list.classList.add('scroll');
                this.setAttributes(this.list, {style: `max-height: ${height}px;`});
            }
        }
        if (this.isDropped) this.#raiseEvent('dropDown');
    }


    /**
     * Closes the dropdown list and set's the flag <strong>isDropped</strong> to false.
     */
    collapse() {
        this.list.innerHTML = '';
        this.list.classList.remove('scroll');
        if (this.isDropped) this.#raiseEvent('close');
        this.isDropped = false;
    }


    /**
     * Imports a CSS stylesheet with the specific attribute: "data-control".
     * Since the parameter can be changed, any other flag can be used as marker
     * for the component to recognize the wanted stylesheet.
     * @param {string} selector An attribute given in the stylesheet link
     * to recognize it for this component.
     * @ignore
     */
    importStyleSheet(selector = 'link[data-control]') {
        const link = document.querySelector(selector);
        if (link) this.shadowRoot.innerHTML += link.outerHTML;
    }


    /**
     * Raises an event of the component.
     * @param {String} type the type of the raised event.
     */
    #raiseEvent(type, item) {
        this.dispatchEvent(new CustomEvent(type, {detail: 
            {
                item: item,
                name: this.name,
                dropped: this.isDropped || type === 'close',
                listItems: this.options,
                selectedItem: this.selectedItem?.innerText || null,
                value: this.value
            },
            cancelable: true,
            bubbles: true
        }));
    }


    /**
     * Private method.
     * Highlightes the current selected item after expanding the dropdown list.
     */
    #highlightSelectedItem(item) {
        if (item == '') return;
        const list = this.shadowRoot.querySelectorAll('li.jom-list-item');
        this.#listindex = this.#options.indexOf(item);
        if (this.#listindex > -1) {
            list[this.#listindex].scrollIntoView({block: 'center'});
            list[this.#listindex].setAttribute('selected','');            
        }
    }

    /**
     * Creates the component's child elements:
     * - div (wrapper)
     * - imput element
     * - ul element (droplist)
     * - drop arrow (svg-image)
     * - plus sign (svg-image)
     */
    #createChildren() {
        const wrapper = document.createElement('div'),
              input = document.createElement('input'),
              list = document.createElement('ul');
        this.setAttributes(wrapper, {id: 'divCombo', class: 'jom-combo'});
        this.setAttributes(input, {type: 'text', id: 'inpCombo', class: 'jom-input', autocomplete: 'off'});
        this.setAttributes(list, {id: 'lstCombo', class: 'cbo-list'});        
        wrapper.append(input, list,
                       TMP_PLUSSIGN.content.cloneNode(true),
                       TMP_ARROW.content.cloneNode(true));
        this.shadowRoot.append(wrapper, TMP_COMBOSTYLE.content.cloneNode(true));
    }


    /**
     * Scrolls the list up or down.
     * @param {string} key Arrowdown | ArrowUp
     */
    #scroll(key) {
        const list = this.shadowRoot.querySelectorAll('li.jom-list-item'),
              step = (key === 'ArrowDown') ? 1 : -1,
              bound = (key === 'ArrowDown') ? 0 : list.length - 1;
        this.#listindex += step;
        if (this.selectedItem) {
            this.selectedItem.removeAttribute('selected');
            if (this.#listindex < 0 || this.#listindex >= list.length) this.#listindex = bound;
        } else {
            this.#listindex = bound;
        }
        list[this.#listindex].setAttribute('selected','');
        list[this.#listindex].scrollIntoView({block: 'center'});
        // TODO maybe here is the reason for scrolling up the whole page on long lists
    }


    /**
     * Updates all HTML-given attributes after connectedCallback!
     */
    #updateProperties() {
        Object.values(this.properties).forEach((prop) => {
            if (ComboBox.prototype.hasOwnProperty(prop)) {
                let value = this[prop];
                delete this[prop];
                this[prop] = value;
            }
        });
    }


    /**
     * Helper function to set one ore more attributes to a single element.
     * @param {HTMLElement} element Element the attributes to be set on.
     * @param {object} attributes Object of attributes and values: {id: 'divID', class: 'active'} etc.
     * @ignore
     */
    setAttributes(element, attributes) {
        Object.keys(attributes).forEach(attr => {
            element.setAttribute(attr, attributes[attr]);
        });
    }


    /**
     * Helper function to find a shadow root element.
     * @param {String} id The id of the wanted child element from shadow root.
     * @returns {HTMLElement | null} returns the shadow root element with the given id or 'null' if not found.
     * @ignore
     */
    getElement(id) {
        return this.shadowRoot.getElementById(id);
    }


    /**
     * Helper function.
     * Converts some specific epressions to Boolean.
     * @param {any} expression The expression to be checked for true or false
     * @returns true | false
     * @ignore
     */
    toBoolean(expression) {
        if (expression === false || expression === true) return expression;
        if (typeof expression === 'string') {
            expression = expression.toLowerCase().trim();
            switch(expression) {
                case 'true':
                case 'yes':
                case 'on':
                case '1':
                    return true;
                default:
                    return false;
            }
        } else {
            return Boolean(expression);
        }
    }
}

customElements.define('combo-box', ComboBox);

/**
 * @summary `Events, raised by the ComboBox class`
 * It can be one of the following events:
 * - {@link addItem}
 * - {@link removeItem}
 * - {@link select}
 * - {@link dropDown}
 * - {@link close}
 * 
 * @typedef {Object} ComboBoxEvent
 * @property {String} type the name of the event
 * @property {String} item the item to be added or removed
 * @property {String} name the name of the element
 * @property {Boolean} dropped indicates whether the list is dropped or not
 * @property {String.<Array>} items the whole list of items
 */

/**
 * The event raises always when an item has been selected.
 * @event select
 * @type {ComboBoxEvent}
 */

/**
 * The event raises always when a new item has been added to the list.
 * @event addItem
 * @type {ComboBoxEvent}
 */

/**
 * The event raises always when a new item has been removed from the list.
 * @event removeItem
 * @type {ComboBoxEvent}
 */

/**
 * The event raises when the dropdown list has been opened.
 * @event dropDown
 * @type {ComboBoxEvent}
 */

/**
 * The event raises when the dropdown list has been closed.
 * @event close
 * @type {ComboBoxEvent}
 */