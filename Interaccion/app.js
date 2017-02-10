    'use strict';

    (function() {
        var app = {
            data: {},
            localization: {
                defaultCulture: 'en',
                cultures: [{
                    name: "English",
                    code: "en"
                }]
            },
            navigation: {
                viewModel: kendo.observable()
            },
            showMore: {
                viewModel: kendo.observable()
            }
        };

        var bootstrap = function() {
            $(function() {
                app.mobileApp = new kendo.mobile.Application(document.body, {
                    transition: 'slide',
                    skin: 'flat',
                    initial: 'components/principal/view.html'
                });

                kendo.bind($('.navigation-link-text'), app.navigation.viewModel);
            });
        };

        $(document).ready(function() {

            var navigationShowMoreView = $('#navigation-show-more-view').find('ul'),
                allItems = $('#navigation-container-more').find('a'),
                navigationShowMoreContent = '';

            allItems.each(function(index) {
                navigationShowMoreContent += '<li>' + allItems[index].outerHTML + '</li>';
            });

            navigationShowMoreView.html(navigationShowMoreContent);
            kendo.bind($('#navigation-show-more-view'), app.showMore.viewModel);

            app.notification = $("#notify");

        });

        app.listViewClick = function _listViewClick(item) {
            var tabstrip = app.mobileApp.view().footer.find('.km-tabstrip').data('kendoMobileTabStrip');
            tabstrip.clear();
        };

        app.showNotification = function(message, time) {
            var autoHideAfter = time ? time : 3000;
            app.notification.find('.notify-pop-up__content').html(message);
            app.notification.fadeIn("slow").delay(autoHideAfter).fadeOut("slow");
        };

        if (window.cordova) {
            document.addEventListener('deviceready', function() {
                if (navigator && navigator.splashscreen) {
                    navigator.splashscreen.hide();
                }
                bootstrap();
                //correcion hide overlay header IOs 7
                onDeviceReady();
            }, false);
        } else {
            bootstrap();
        }

        app.keepActiveState = function _keepActiveState(item) {
            var currentItem = item;
            $('#navigation-container li.active').removeClass('active');
            currentItem.addClass('active');
        };

        window.app = app;

        app.isOnline = function() {
            if (!navigator || !navigator.connection) {
                return true;
            } else {
                return navigator.connection.type !== 'none';
            }
        };

        app.openLink = function(url) {
            if (url.substring(0, 4) === 'geo:' && device.platform === 'iOS') {
                url = 'http://maps.apple.com/?ll=' + url.substring(4, url.length);
            }

            window.open(url, '_system');
            if (window.event) {
                window.event.preventDefault && window.event.preventDefault();
                window.event.returnValue = false;
            }
        };

        /// start appjs functions
        /// end appjs functions
        app.showFileUploadName = function(itemViewName) {
            $('.' + itemViewName).off('change', 'input[type=\'file\']').on('change', 'input[type=\'file\']', function(event) {
                var target = $(event.target),
                    inputValue = target.val(),
                    fileName = inputValue.substring(inputValue.lastIndexOf('\\') + 1, inputValue.length);

                $('#' + target.attr('id') + 'Name').text(fileName);
            });

        };

        app.clearFormDomData = function(formType) {
            $.each($('.' + formType).find('input:not([data-bind]), textarea:not([data-bind])'), function(key, value) {
                var domEl = $(value),
                    inputType = domEl.attr('type');

                if (domEl.val().length) {

                    if (inputType === 'file') {
                        $('#' + domEl.attr('id') + 'Name').text('');
                    }

                    domEl.val('');
                }
            });
        };

        /// start kendo binders
        kendo.data.binders.widget.buttonText = kendo.data.Binder.extend({
            init: function(widget, bindings, options) {
                kendo.data.Binder.fn.init.call(this, widget.element[0], bindings, options);
            },
            refresh: function() {
                var that = this,
                    value = that.bindings["buttonText"].get();

                $(that.element).text(value);
            }
        });
        /// end kendo binders
    }());

    /// start app modules
    (function localization(app) {
        var localization = app.localization = kendo.observable({
                cultures: app.localization.cultures,
                defaultCulture: app.localization.defaultCulture,
                currentCulture: '',
                strings: {},
                viewsNames: [],
                registerView: function(viewName) {
                    app[viewName].set('strings', getStrings() || {});

                    this.viewsNames.push(viewName);
                }
            }),
            i, culture, cultures = localization.cultures,
            getStrings = function() {
                var code = localization.get('currentCulture'),
                    strings = localization.get('strings')[code];

                return strings;
            },
            updateStrings = function() {
                var i, viewName, viewsNames,
                    strings = getStrings();

                if (strings) {
                    viewsNames = localization.get('viewsNames');

                    for (i = 0; i < viewsNames.length; i++) {
                        viewName = viewsNames[i];

                        app[viewName].set('strings', strings);
                    }

                    app.navigation.viewModel.set('strings', strings);
                    app.showMore.viewModel.set('strings', strings);
                }
            },
            loadCulture = function(code) {
                $.getJSON('cultures/' + code + '/app.json',
                    function onLoadCultureStrings(data) {
                        localization.strings.set(code, data);
                    });
            };

        localization.bind('change', function onLanguageChange(e) {
            if (e.field === 'currentCulture') {
                var code = e.sender.get('currentCulture');

                updateStrings();
            } else if (e.field.indexOf('strings') === 0) {
                updateStrings();
            } else if (e.field === 'cultures' && e.action === 'add') {
                loadCulture(e.items[0].code);
            }
        });

        for (i = 0; i < cultures.length; i++) {
            loadCulture(cultures[i].code);
        }

        localization.set('currentCulture', localization.defaultCulture);
    })(window.app);
    /// end app modules

    // START_CUSTOM_CODE_kendoUiMobileApp
    // Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

    function onDeviceReady() {

        if (device.platform === 'iOS' && parseFloat(device.version) >= 7.0) {
            console.log("IOs 7 o +");
            document.body.style.marginTop = "20px";
            var tamano = $('#kendoUiMobileApp').height();
            tamano = tamano - 20;
            $('#kendoUiMobileApp').height(tamano);
        }
        /*
        if (device.platform === 'iOS' && parseFloat(device.version) >= 7.0) {
            console.log("IOs 7 o +");
            $('.ui-header > *').css('margin-top', function (index, curValue) {
                return parseInt(curValue, 10) + 20 + 'px';
            });
        }
        */
    }

    /* funciones de db */

    //Based on http://www.html5rocks.com/en/tutorials/webdatabase/todo/ 
    document.addEventListener("deviceready", inicioDB, false);
    //Activate :active state on device
    document.addEventListener("touchstart", function() {}, false);

    var appdb = {};
    appdb.db = null;
        
    appdb.openDb = function() {
        var dbName = "DB.sqlite";
        if (window.navigator.simulator === true) {
                // For debugin in simulator fallback to native SQL Lite
                //console.log("Use built in SQL Lite");
                console.log("Simulador Navigator");
                appdb.db = window.openDatabase(dbName, "1.0", "DB-ValmarGroup", 200000);
            }
            else {
                appdb.db = window.sqlitePlugin.openDatabase(dbName);
                console.log("SQLite Plugin");
            }
    }
        
    appdb.createTable = function() {
        var db = appdb.db;
        db.transaction(function(tx) {
            tx.executeSql("CREATE TABLE IF NOT EXISTS tablavalores(ID INTEGER PRIMARY KEY ASC, valor TEXT, added_on DATETIME)", []);
        });
    }
        
    appdb.addTodo = function(todoText) {
        var db = appdb.db;
        db.transaction(function(tx) {
            var addedOn = new Date();
            tx.executeSql("INSERT INTO tablavalores(valor, added_on) VALUES (?,?)",
                        [todoText, addedOn],
                        appdb.onSuccess,
                        appdb.onError);
        });
    }
        
    appdb.onError = function(tx, e) {
        console.log("Error: " + e.message);
        appdb.hideOverlay();
    } 

    appdb.onSuccess = function(tx, r) {
        appdb.refresh();
        appdb.hideOverlay();
    }

    appdb.hideOverlay = function() {
        var overlay = document.getElementById("overlay");
        overlay.style.display = "none";    
    }

    appdb.showOverlay = function(id) {
        var overlay = document.getElementById("overlay");
        
        overlay.innerHTML = "<div class='row -justify-content-bottom'><div class='col'>" +
                                "<button class='button -negative' onclick='appdb.deleteTodo(" + id + ");'>Delete</button>" + 
                                "<button class='button' onclick='appdb.hideOverlay();'>Cancel</button></div>" + 
                            "</div>";
        
        overlay.style.display = "block";
    }

    appdb.deleteTodo = function(id) {
        var db = appdb.db;
        db.transaction(function(tx) {
            tx.executeSql("DELETE FROM tablavalores WHERE ID=?", [id],
                        appdb.onSuccess,
                        appdb.onError);
        });
    }

    appdb.refresh = function() {
        var renderTodo = function (row) {
            return "<li class='list__item'><i class='list__icon list__icon--check fa fa-check u-color-positive'></i><span class='list__text'>" + row.valor + "</span>" +
                "<a class='delete' href='javascript:void(0);' onclick='appdb.showOverlay(" + row.ID + ");'><i class='list__icon list__icon--delete fa fa-trash-o u-color-negative'></i></a></li>";
        }

        console.log(renderTodo);
        
        var render = function (tx, rs) {
            var rowOutput = "";
            var todoItems = document.getElementById("todoItems");
            for (var i = 0; i < rs.rows.length; i++) {
                //console.log(rs.rows.item(i)); 
                rowOutput = rowOutput + renderTodo(rs.rows.item(i));
            }
            //$("#todoItems").html('');
            $("#todoItems").html(rowOutput); 
            //todoItems.innerHTML = rowOutput;
        }
        
        var db = appdb.db;
        db.transaction(function(tx) {
            tx.executeSql("SELECT * FROM tablavalores", [], 
                        render, 
                        appdb.onError);
        });
    }
        
    function inicioDB() {
        console.log("iniciar");
        navigator.splashscreen.hide();
        appdb.openDb();
        appdb.createTable();
        appdb.refresh();
    }
        
    function addTodo() {
        var todo = document.getElementById("todo");
        appdb.addTodo(todo.value);
        todo.value = "";
    }

    /* funciones de db */

    // END_CUSTOM_CODE_kendoUiMobileApp