(function($) {

    var methods = {};

    /**
     * Initializes component
     * @param params
     * @returns {*}
     */
    methods.init = function(params) {

        return this.each(function() {

            var $this = $(this);
            var settings = $.extend({}, settings);
            var name = settings ? settings.name : null;
            var $element;
            var _options = [];

            if ($this.prop('tagName') == 'SELECT') {

                if (!name) name = $(this).attr('name');
                $this.find('option').each(function(i, e) {
                    var option = {
                        value: $(e).val(),
                        name: $(e).html(),
                        style: $(e).attr('style'),
                        class: $(e).attr('class'),
                        disabled: $(e).prop('disabled'),
                        selected: $(e).prop('selected'),
                    }
                    _options.push(option);
                });

                var attrs = {};

                $.each(this.attributes, function(idx, attr) {
                    attrs[attr.nodeName] = attr.nodeValue;
                });

                $element = $("<div/>", attrs).append($this.contents());

                $this.replaceWith($element);

                $element.removeAttr('name');
                $element.find('option').remove();

            } else {

                if (!name) name = $this.data('name');
                $element = $(this);

            }

            if (params && params.options) {
                $.extend(_options, params.options);
            }

            var data = $element.data('select');

            $element.addClass('tm-fancy-select');

            $element.append('<input type="hidden" name="' + name + '">');
            var $hidden = $($element.children()[0]);

            $element.append('<div class="input">&nbsp;</div>');
            var $input = $($element.children()[1]);
            $input.append('<span></span><span>&#9660;</span></i>');

            $element.append('<div class="dropdown"></div>');
            var $dropdown = $($element.children()[2]);

            if (!data) {
                $element.data('select', {
                    element: $element,
                    dropdown: $dropdown,
                    input: $input,
                    hidden: $hidden,
                });
            }

            if (_options) {
                for (i in _options) {
                    methods['addOption'].call($element, _options[i]);
                }
            }

            $input.on('click', onInputClick);

            $dropdown.on('click', onDropDownClick);

            $(window).on('click', function() {
                $('.tm-fancy-select div.dropdown:visible').hide();
            });

        });

    }

    /**
     * Destroys the component
     */
    methods.destroy = function() {
        return this.each(function(){

            var $this = $(this),
                data = $this.data('select');

            methods['clearOptions'].call(data.element);
            data.input.off('click', onInputClick);
            data.dropdown.off('click', onDropDownClick);
            data.element.remove();
            $this.removeData('select');

        });
    }

    /**
     * Adds <option> to <select>
     * @param {*} params
     * @returns {methods}
     */
    methods.addOption = function(params) {
        var data = $(this).data('select');
        var d = $('<div/>');
        data.dropdown.append(d);
        for (attr in params) {
            applyAttr(d, attr, params[attr]);
        }
        d.on('click', onOptionClick);
        return this;
    }

    /**
     * Adds [<option>] to <select>
     * @param {*} params
     */
    methods.addOptions = function(params) {
        var data = $(this).data('select');
        for (i in params) {
            methods['addOption'].call(data.element, params[i]);
        }
        return this;
    }

    /**
     * Edit a specified <option>
     * @param {*} params
     * @returns {methods}
     */
    methods.editOption = function(params) {
        var data = $(this).data('select');
        var d = findOption(data, params);
        for (attr in params) {
            applyAttr(d, attr, params[attr]);
        }
        return this;
    }

    /**
     * Clears all [<option>]
     * @returns {methods}
     */
    methods.clearOptions = function() {
        var data = $(this).data('select');
        data.dropdown.find('div').off('click', onOptionClick);
        data.dropdown.find('div').remove();
        methods['reset'].call(data.element);
        return this;
    }

    /**
     * Removes specified <option>
     * @param {*} params
     * @returns {methods}
     */
    methods.removeOption = function(params) {
        var data = $(this).data('select');
        var d = findOption(data, params);
        d.off('click', onOptionClick);
        if (d.data('value') == methods['val'].call(data.element)) {
            console.log('clear');
            methods['reset'].call(data.element);
        }
        d.remove();
        return this;
    }

    /**
     * Removes specified option attribute
     * @param {*} params
     * @returns {methods}
     */
    methods.removeAttr = function(params) {
        var data = $(this).data('select');
        var d = findOption(data, params);
        d.removeAttr(params.attr);
        return this;
    }

    /**
     * Selects specified <option>
     * @param params
     * @returns {methods}
     */
    methods.select = function(params) {
        var data = $(this).data('select');
        var d = findOption(data, params);
        select.call(d);
        return this;
    }

    /**
     * Sets <select> value to ''
     * @returns {methods}
     */
    methods.reset = function() {
        var data = $(this).data('select');
        data.input.attr('data-value', '');
        data.input.find('span:first-child').html('&nbsp');
        data.hidden.val('');
        return this;
    }

    /**
     * Disables specified <option>
     * @param {*} params
     * @returns {methods}
     */
    methods.disable = function(params) {
        var data = $(this).data('select');
        var d = findOption(data, params);
        applyAttr(d, 'disabled', true);
        return this;
    }

    /**
     * Enables specified <opton>
     * @param {*} params
     * @returns {methods}
     */
    methods.enable = function(params) {
        var data = $(this).data('select');
        var d = findOption(data, params);
        applyAttr(d, 'disabled', false);
        return this;
    }

    /**
     * If value is undefined returns select value, else sets value
     * @param {string} params
     * @returns {methods}
     */
    methods.val = function(value) {
        var data = $(this).data('select');
        if (value) {
            var d = findOption(data, {value: value});
            select.call(d);
            return this;
        } else {
            return data.hidden.val();
        }
    }

    function findOption(data, params) {
        var d;
        if (params.index) {
            d = data.dropdown.find('div')[params.index];
            d = $(d);
        } else if (params.value) {
            d = data.dropdown.find('div[data-value="' + params.value + '"]');
        }
        if (!d || !d.length) {
            $.error('Cannot find option');
        }
        return d;
    }

    function applyAttr(el, attr, value) {
        switch (attr) {
            case 'name': $(el).html(value); break;
            case 'value': $(el).attr('data-value', value); break;
            case 'disabled':
                if (value) {
                    $(el).addClass('disabled');
                } else {
                    $(el).removeClass('disabled');
                }
                break;
            case 'selected':
                if (value) {
                    select.call(el[0]);
                }
                break;
            default: $(el).attr(attr, value);
        }
    }

    function select() {
        var data = $(this).parent().parent().data('select');
        if ($(this).hasClass('disabled')) return;
        data.dropdown.find('>div').show();
        $(this).hide();
        data.input.attr('data-value', $(this).data('value'));
        data.hidden.val($(this).data('value'));
        data.input.find('span:first-child').html($(this).html());
        data.dropdown.hide();
    }

    function onInputClick(event) {
        var data = $(this).parent().data('select');
        event.stopPropagation();
        data.dropdown.toggle();
    }

    function onDropDownClick(event) {
        event.stopPropagation();
    }

    function onOptionClick(event) {
        select.call(this);
    }

    $.fn.tmFancySelect = function(action) {

        if (methods[action]) {

            return methods[action].apply(this, Array.prototype.slice.call(arguments, 1));

        } else if (typeof action === 'object' || ! action) {

            return methods.init.apply(this, arguments);

        } else {

            $.error('Unknown method "' +  action + '" for tw-fancy-select');

        }

    }

    $(document).ready(function() {
        $('.tm-fancy-select').each(function(i, e) {
            $(e).tmFancySelect();
        });
    });

})(jQuery);