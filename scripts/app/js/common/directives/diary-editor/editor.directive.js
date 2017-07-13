(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {

        //TODO
        // delete this file
        // https://github.com/entcore/entcore/pull/39

        module.config(function($provide) {
            $provide.decorator('editorDirective', function($delegate, $parse, $compile) {
                console.log("exec decorator");
                var directive, link;
                directive = $delegate[0];
                link = linkSurcharge;
                directive.compile = function() {
                    console.log("compile");
                    return function Link(scope, element, attrs, ctrls) {
                        scope.active = scope.$parent.$eval(attrs.isactive);
                        return link.apply(this, arguments);
                    };
                };
                return $delegate;



                function linkSurcharge(scope, element, attributes) {
                    console.log("surchage");
                    if (navigator.userAgent.indexOf('Trident') !== -1 || navigator.userAgent.indexOf('Edge') !== -1) {
                        element.find('code').hide();
                    }
                    $('body').append(
                        $('<link />')
                        .attr('rel', 'stylesheet')
                        .attr('type', 'text/css')
                        .attr('href', '/infra/public/js/prism/prism.css')
                    );

                    loader.openFile({
                        url: '/infra/public/js/prism/prism.js',
                        callback: function() {

                        },
                        error: function() {

                        }
                    });

                    element.find('.close-focus').on('click', function() {
                        element.removeClass('focus');
                        element.parent().data('lock', false);
                        element.parents('grid-cell').data('lock', false);
                        element.trigger('editor-blur');
                        $('body').css({
                            overflow: 'auto'
                        });
                    });

                    element.find('.editor-toolbar-opener').on('click', function(e) {
                        if (!$(this).hasClass('active')) {
                            $(this).addClass('active');
                            element.find('editor-toolbar').addClass('opened');
                        } else {
                            $(this).removeClass('active')
                            element.find('editor-toolbar').removeClass('opened');
                        }
                    });

                    element.find('.editor-toolbar-opener').on('touchstart', function(e) {
                        e.preventDefault();
                        if (!$(this).hasClass('active')) {
                            $(this).addClass('active');
                            element.find('editor-toolbar').addClass('opened');
                        } else {
                            $(this).removeClass('active')
                            element.find('editor-toolbar').removeClass('opened');
                        }
                        setTimeout(function() {
                            var sel = window.getSelection();
                            sel.removeAllRanges();
                            sel.addRange(editorInstance.selection.range);
                        }, 100);
                    });

                    document.execCommand("enableObjectResizing", false, false);
                    document.execCommand("enableInlineTableEditing", null, false);
                    document.execCommand("insertBrOnReturn", false, true);

                    element.addClass('edit');
                    var editZone = element.find('[contenteditable=true]');
                    var htmlZone = element.children('textarea');
                    var highlightZone = element.children('code');
                    var toolbarElement = element.children('editor-toolbar');
                    document.execCommand("styleWithCSS", false, true);

                    if (attributes.inline !== undefined) {
                        element.children('editor-toolbar').addClass('inline');
                    }

                    var toolbarConf = RTE.baseToolbarConf;
                    if (attributes.toolbarConf) {
                        toolbarConf = scope.$eval(attributes.toolbarConf);
                    }

                    var editorInstance;
                    var instance = $parse(attributes.instance);
                    if (!instance(scope)) {
                        editorInstance = new RTE.Instance({
                            toolbarConfiguration: toolbarConf,
                            element: element,
                            scope: scope,
                            compile: $compile,
                            editZone: editZone
                        });
                    } else {
                        editorInstance = instance;
                    }

                    editorInstance.addState('');
                    var ngModel = $parse(attributes.ngModel);
                    if (!ngModel(scope)) {
                        ngModel.assign(scope, '');
                    }

                    scope.$watch(
                        function() {
                            return ngModel(scope);
                        },
                        function(newValue) {
                            $(newValue).find('.math-tex').each(function(index, item) {
                                var mathItem = $('<mathjax></mathjax>');
                                mathItem.attr('formula', item.textContent.replace('\\(', '$$$$').replace('\\)', '$$$$').replace('x = ', ''));
                                $(item).removeClass('math-tex');
                                $(item).text('');
                                $(item).append(mathItem);
                            });

                            if (
                                newValue !== editZone.html() &&
                                !editZone.is(':focus') &&
                                $('editor-toolbar').find(':focus').length === 0
                            ) {
                                editZone.html($compile(ngModel(scope))(scope));
                            }
                            if (newValue !== htmlZone.val() && !htmlZone.is(':focus')) {
                                if (window.html_beautify) {
                                    htmlZone.val(html_beautify(newValue));
                                    highlightZone.text(html_beautify(newValue));
                                    Prism.highlightAll();
                                }
                                //beautifier is not loaded on mobile
                                else {
                                    htmlZone.val(newValue);
                                }
                            }
                        }
                    );

                    $(window).on('resize', function() {
                        highlightZone.css({
                            top: (element.find('editor-toolbar').height() + 1) + 'px'
                        });
                    });

                    var previousScroll = 0;

                    //$(document).on( 'scroll',_.throttle(sticky,10));
                    function sticky() {
                        if(element.parents('.editor-media').length > 0 || element.parents('body').length === 0){

                            return;
                        }

                        if (toolbarElement.css('position') !== 'absolute') {
                            toolbarElement.css({
                                'position': 'absolute',
                                'top': '0px'
                            });
                            element.css({
                                'padding-top': toolbarElement.height() + 1 + 'px'
                            });
                        }
                        var topDistance = element.offset().top - $('.height-marker').height();
                        if (topDistance < (window.scrollY || window.pageYOffset)) {
                            topDistance = (window.scrollY || window.pageYOffset);
                        }
                        if (topDistance > editZone.offset().top + editZone.height() - toolbarElement.height()) {
                            topDistance = editZone.offset().top + editZone.height() - toolbarElement.height();
                        }
                        if (attributes.inline !== undefined) {
                            toolbarElement.offset({
                                top: topDistance + $('.height-marker').height()
                            });
                            element.children('popover').offset({
                                top: topDistance + $('.height-marker').height() + 10 - parseInt(element.css('margin-top'))
                            });
                        } else {
                            toolbarElement.offset({
                                top: topDistance + $('.height-marker').height()
                            });
                            element.children('popover').offset({
                                top: topDistance + $('.height-marker').height() + 10
                            });
                        }

                        setTimeout(function() {
                            highlightZone.offset({
                                top: htmlZone.offset().top
                            });
                        }, 100);

                        previousScroll = (window.scrollY || window.pageYOffset);
                        var placeEditorToolbar = requestAnimationFrame(sticky);
                    }

                    if (ui.breakpoints.tablette <= $(window).width()) {
                        var placeEditorToolbar = requestAnimationFrame(sticky);
                    }

                    element.children('popover').find('li:first-child').on('click', function() {
                        element.removeClass('html');
                        element.removeClass('both');
                        element.addClass('edit');
                        editorInstance.trigger('contentupdated');
                    });

                    element.children('popover').find('li:nth-child(2)').on('click', function() {
                        element.removeClass('edit');
                        element.removeClass('both');
                        element.addClass('html');
                        highlightZone.css({
                            top: (element.find('editor-toolbar').height() + 1) + 'px'
                        });
                        editorInstance.trigger('contentupdated');
                        setTimeout(function() {
                            editorInstance.trigger('contentupdated');
                        }, 300);
                        if (window.html_beautify) {
                            return;
                        }
                        http().get('/infra/public/js/beautify-html.js').done(function(content) {
                            eval(content);
                            htmlZone.val(html_beautify(ngModel(scope)));
                            highlightZone.text(html_beautify(ngModel(scope)));
                            Prism.highlightAll();
                        });
                    });

                    element.children('popover').find('li:nth-child(3)').on('click', function() {
                        element.removeClass('edit');
                        element.removeClass('html');
                        element.addClass('both');
                        highlightZone.css({
                            top: (element.find('editor-toolbar').height() + 1) + 'px'
                        });
                        editorInstance.trigger('contentupdated');
                        setTimeout(function() {
                            editorInstance.trigger('contentupdated');
                        }, 300);
                        if (window.html_beautify) {
                            return;
                        }
                        http().get('/infra/public/js/beautify-html.js').done(function(content) {
                            eval(content);
                            htmlZone.val(html_beautify(ngModel(scope)));
                            highlightZone.text(html_beautify(ngModel(scope)));
                            Prism.highlightAll();
                        });
                    });

                    function b64toBlob(b64Data, contentType, sliceSize) {
                        contentType = contentType || '';
                        sliceSize = sliceSize || 512;

                        var byteCharacters = atob(b64Data);
                        var byteArrays = [];

                        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                            var slice = byteCharacters.slice(offset, offset + sliceSize);

                            var byteNumbers = new Array(slice.length);
                            for (var i = 0; i < slice.length; i++) {
                                byteNumbers[i] = slice.charCodeAt(i);
                            }

                            var byteArray = new Uint8Array(byteNumbers);

                            byteArrays.push(byteArray);
                        }

                        var blob = new Blob(byteArrays, {
                            type: contentType
                        });
                        blob.name = "image";
                        return blob;
                    }

                    element.find('.option i').click(function() {
                        if (!editZone.is(':focus')) {
                            editZone.focus();
                        }

                        scope.$apply(function() {
                            scope.$eval(attributes.ngChange);
                            ngModel.assign(scope, editZone.html());
                        });
                    });

                    editorInstance.on('change', function() {
                        editorInstance.trigger('contentupdated');
                        setTimeout(function() {

                            if (attributes.onChange) {
                                scope.$eval(attributes.onChange);
                            }

                            scope.$apply();
                        }, 10);
                    });

                    editorInstance.on('contentupdated', function() {
                        if (parseInt(htmlZone.css('min-height')) < editZone.height()) {
                            htmlZone.css('min-height', editZone.height() + 'px');
                        }
                        ui.extendElement.resizable(element.find('[contenteditable]').find('img, table, .column'), {
                            moveWithResize: false,
                            lock: {
                                left: true,
                                top: true
                            },
                            mouseUp: function() {
                                editorInstance.trigger('contentupdated');
                                editorInstance.addState(editorInstance.editZone.html());
                            }
                        });
                        htmlZone.css({
                            'min-height': '250px',
                            height: 0
                        });
                        var newHeight = htmlZone[0].scrollHeight + 2;
                        if (newHeight > htmlZone.height()) {
                            htmlZone.height(newHeight);
                        }

                        if (htmlZone[0].scrollHeight > parseInt(htmlZone.css('min-height')) && !element.hasClass('edit')) {
                            editZone.css('min-height', htmlZone[0].scrollHeight + 2 + 'px');
                        }

                        if (editorInstance.selection.changed()) {
                            editorInstance.trigger('selectionchange', {
                                selection: editorInstance.selection
                            });
                        }

                        editZone.find('img').each(function(index, item) {
                            if ($(item).attr('src').startsWith('data:')) {
                                var split = $(item).attr('src').split('data:')[1].split(',');
                                var blob = b64toBlob(split[1], split[0].split(';')[0]);
                                blob.name = 'image';
                                $(item).attr('src', 'http://loading');
                                workspace.Document.prototype.upload(blob, '', function(file) {
                                    $(item).attr('src', '/workspace/document/' + file._id);
                                    notify.info('editor.b64.uploaded');
                                    editorInstance.trigger('contentupdated');
                                });
                            }
                        });

                        if (!scope.$$phase) {
                            scope.$apply(function() {
                                scope.$eval(attributes.ngChange);
                                var content = editZone.html();
                                ngModel.assign(scope, content);
                            });
                        } else {
                            scope.$eval(attributes.ngChange);
                            var content = editZone.html();
                            ngModel.assign(scope, content);
                        }
                    });

                    var placeToolbar = function() {
                        if (attributes.inline !== undefined && $(window).width() > ui.breakpoints.tablette) {
                            element.children('editor-toolbar').css({
                                left: 0
                            });
                            element.css({
                                'padding-top': toolbarElement.height() + 1 + 'px'
                            });
                        }
                    }

                    element.parents().on('resizing', placeToolbar)
                    element.on('click', function(e) {
                        placeToolbar();

                        if (e.target === element.find('.close-focus')[0] || element.hasClass('focus')) {
                            return;
                        }

                        element.trigger('editor-focus');
                        element.addClass('focus');
                        element.parent().data('lock', true);
                        element.parents('grid-cell').data('lock', true);
                        if ($(window).width() < ui.breakpoints.tablette) {
                            $('body').css({
                                overflow: 'hidden'
                            });
                            window.scrollTo(0, 0);
                            setTimeout(function() {
                                var sel = document.getSelection();
                                var r = document.createRange();
                                r.setStart(editZone[0].firstChild, 0);
                                sel.removeAllRanges();
                                sel.addRange(r);
                            }, 600);
                        }
                    });

                    $('body').on('mousedown', function(e) {
                        if (e.target !== element.find('.editor-toolbar-opener')[0] && element.find('editor-toolbar, .editor-toolbar-opener').find(e.target).length === 0) {
                            element.find('editor-toolbar').removeClass('opened');
                            element.find('.editor-toolbar-opener').removeClass('active');
                        }

                        if (element.find(e.target).length === 0 && !$(e.target).hasClass('sp-choose') && element.hasClass('focus')) {
                            element.children('editor-toolbar').removeClass('show');
                            element.trigger('editor-blur');
                            element.removeClass('focus');
                            editorInstance.trigger('change');
                            $('body').css({
                                overflow: 'auto'
                            });
                            element.parent().data('lock', false);
                            element.parents('grid-cell').data('lock', false);
                            element.find('code').attr('style', '');

                            if (attributes.inline !== undefined) {
                                element.css({
                                    'margin-top': 0,
                                    'padding-top': 0
                                });
                                element.children('editor-toolbar').attr('style', '');
                            }
                        }
                    });

                    $('editor-toolbar').on('mousedown', function(e) {
                        e.preventDefault();
                    });

                    function wrapFirstLine() {
                        if (editZone.contents()[0] && editZone.contents()[0].nodeType === 3) {
                            var div = $('<div></div>');
                            div.text(editZone.contents()[0].textContent);
                            $(editZone.contents()[0]).remove();
                            editZone.prepend(div);
                            editorInstance.selection.moveCaret(div[0], div.text().length);
                            editorInstance.trigger('contentupdated');
                        }
                    }

                    function editingDone() {
                        editorInstance.addState(editZone.html());
                    }

                    var typingTimer;
                    var editingTimer;

                    editZone.on('paste', function() {
                        setTimeout(function() {
                            editorInstance.editZone.find('[resizable]').removeAttr('resizable').css('cursor', 'initial');
                            editorInstance.editZone.find('[bind-html]').removeAttr('bind-html');
                            editorInstance.editZone.find('[ng-include]').removeAttr('ng-include');
                            editorInstance.editZone.find('[ng-repeat]').removeAttr('ng-repeat');
                            editorInstance.editZone.find('[data-ng-repeat]').removeAttr('data-ng-repeat');
                            editorInstance.editZone.find('[ng-transclude]').removeAttr('ng-transclude');
                            if (editorInstance.editZone.find('portal').length) {
                                var portal = editorInstance.editZone.find('portal');
                                editorInstance.editZone[0].innerHTML = $('<div>' + (portal.find('[bind-html]').html() || '') + '</div>')
                            }
                            editorInstance.addState(editZone.html());
                            if (editorInstance.editZone[0].childNodes.length > editorInstance.editZone[0].children.length) {
                                var wrapper = $('<div></div>');
                                while (editorInstance.editZone[0].childNodes.length) {
                                    wrapper.append(editorInstance.editZone[0].childNodes[0]);
                                }
                                editorInstance.editZone.append(wrapper);
                            }
                            editorInstance.trigger('contentupdated');
                            editorInstance.scope.$apply();
                        }, 100);
                    });

                    editZone.on('keydown', function(e) {
                        clearTimeout(typingTimer);
                        clearTimeout(editingTimer);
                        typingTimer = setTimeout(wrapFirstLine, 10);

                        var sel = window.getSelection();
                        if (sel.rangeCount > 0) {
                            var range = sel.getRangeAt(0);
                            if (range.startContainer.nodeType !== 1 && e.which > 64 && e.which < 91 && range.startContainer.parentNode !== null) {
                                var currentTextNode = range.startContainer;
                                var initialOffset = range.startOffset;
                                if (initialOffset === currentTextNode.textContent.length) {
                                    initialOffset = -1;
                                }
                                if (range.startContainer.parentNode.innerHTML === '&#8203;' && range.startOffset === 1) {
                                    var node = range.startContainer.parentNode;

                                    setTimeout(function() {
                                        node.innerHTML = node.innerHTML.substring(7);
                                        setTimeout(function() {
                                            var range = document.createRange();
                                            if (initialOffset === -1) {
                                                initialOffset = (node.firstChild || node).textContent.length
                                            }
                                            range.setStart((node.firstChild || node), initialOffset);
                                            sel.removeAllRanges();
                                            sel.addRange(range);
                                        }, 1);
                                    }, 1);

                                }
                            }
                        }


                        if (!e.ctrlKey) {
                            editingTimer = setTimeout(editingDone, 500);
                        }

                        if (e.keyCode === 13) {
                            editorInstance.addState(editZone.html());

                            var parentContainer = range.startContainer;

                            if (
                                (parentContainer.nodeType === 1 && parentContainer.nodeName === 'LI') ||
                                (parentContainer.parentNode.nodeType === 1 && parentContainer.parentNode.nodeName === 'LI') ||
                                (parentContainer.nodeType === 1 && parentContainer.nodeName === 'TD') ||
                                (parentContainer.parentNode.nodeType === 1 && parentContainer.parentNode.nodeName === 'TD')
                            ) {
                                return;
                            }

                            var blockContainer = parentContainer;
                            while (blockContainer.nodeType !== 1 || textNodes.indexOf(blockContainer.nodeName) !== -1) {
                                blockContainer = blockContainer.parentNode;
                            }
                            if (parentContainer === editZone[0]) {
                                var wrapper = $('<div></div>');
                                $(editZone[0]).append(wrapper);
                                wrapper.html('&#8203;');
                                blockContainer = wrapper[0];
                                parentContainer = wrapper[0];
                            }
                            if (blockContainer === editZone[0]) {
                                var startOffset = range.startOffset;
                                var wrapper = $('<div></div>');

                                while (editZone[0].childNodes.length) {
                                    $(wrapper).append(editZone[0].childNodes[0]);
                                }
                                $(blockContainer).append(wrapper);
                                blockContainer = wrapper[0];
                                var sel = document.getSelection();
                                var r = document.createRange();
                                r.setStart(parentContainer, startOffset);
                                sel.removeAllRanges();
                                sel.addRange(r);
                                range = r;
                            }
                            var newNodeName = 'div';
                            if ((parentContainer.nodeType === 1 && range.startOffset < parentContainer.childNodes.length) ||
                                (parentContainer.nodeType === 3 && range.startOffset < parentContainer.textContent.length)) {
                                newNodeName = blockContainer.nodeName.toLowerCase();
                            }
                            var newLine = $('<' + newNodeName + '>&#8203;</' + newNodeName + '>');

                            blockContainer.parentNode.insertBefore(newLine[0], blockContainer.nextSibling);

                            newLine.attr('style', $(blockContainer).attr('style'));
                            newLine.attr('class', $(blockContainer).attr('class'));

                            e.preventDefault();
                            var rangeStart = 1;
                            if (parentContainer.nodeType === 3) {
                                var content = document.createElement('span');
                                var content = parentContainer.textContent.substring(range.startOffset, parentContainer.textContent.length);
                                if (!content) {
                                    content = '&#8203;';
                                } else {
                                    rangeStart = 0;
                                }
                                newLine.html(content);
                                parentContainer.textContent = parentContainer.textContent.substring(0, range.startOffset);
                            } else {
                                while (parentContainer.childNodes.length > range.startOffset) {
                                    newLine.append(parentContainer.childNodes[range.startOffset]);
                                }
                            }

                            var nodeCursor = parentContainer;
                            while (nodeCursor !== blockContainer) {
                                var cursorClone;
                                if (nodeCursor.nodeType === 1) {
                                    cursorClone = document.createElement(nodeCursor.nodeName.toLowerCase());
                                    $(cursorClone).attr('style', $(nodeCursor).attr('style'));
                                    $(cursorClone).attr('class', $(nodeCursor).attr('class'));
                                    $(cursorClone).append(newLine[0].firstChild);
                                    newLine.prepend(cursorClone);
                                }

                                var sibling = nodeCursor.nextSibling;
                                while (sibling !== null) {
                                    //order matters here. appending sibling before getting nextsibling breaks the loop
                                    var currentSibling = sibling;
                                    sibling = sibling.nextSibling;
                                    newLine.append(currentSibling);
                                }

                                nodeCursor = nodeCursor.parentNode;
                            }

                            if (!parentContainer.wholeText && parentContainer.nodeType === 3) {
                                // FF forces encode on textContent, this is a hack to get the actual entities codes,
                                // since innerHTML doesn't exist on text nodes
                                parentContainer.textContent = $('<div>&#8203;</div>')[0].textContent;
                            }

                            var range = document.createRange();
                            var newStartContainer = newLine[0];
                            while (newStartContainer.firstChild) {
                                newStartContainer = newStartContainer.firstChild;
                            }
                            range.setStart(newStartContainer, rangeStart);

                            sel.removeAllRanges();
                            sel.addRange(range);
                        }

                        if (e.keyCode === 8 || e.keyCode === 46) {
                            editorInstance.addState(editZone.html());
                            // for whatever reason, ff likes to create several ranges for table selection
                            // which messes up their deletion
                            for (var i = 0; i < sel.rangeCount; i++) {
                                var startContainer = sel.getRangeAt(i).startContainer;
                                if (startContainer.nodeType === 1 && startContainer.nodeName === 'TD' || startContainer.nodeName === 'TR') {
                                    startContainer.remove();
                                }
                            }
                            editZone.find('table').each(function(index, item) {
                                if ($(item).find('tr').length === 0) {
                                    $(item).remove();
                                }
                            });
                        }
                        if (e.ctrlKey && e.keyCode === 86) {
                            setTimeout(function() {
                                editorInstance.editZone.find('i').contents().unwrap().wrap('<em/>');
                                editorInstance.addState(editorInstance.editZone.html());
                            }, 0);
                        }
                        if (e.keyCode === 90 && e.ctrlKey && !e.shiftKey) {
                            editorInstance.undo();
                            e.preventDefault();
                            scope.$apply();
                        }
                        if ((e.keyCode === 90 && e.ctrlKey && e.shiftKey) || (e.keyCode === 89 && e.ctrlKey)) {
                            editorInstance.redo();
                            e.preventDefault();
                            scope.$apply();
                        }
                        if (e.keyCode === 9) {
                            e.preventDefault();
                            var currentTag;
                            if (editorInstance.selection.range.startContainer.tagName) {
                                currentTag = editorInstance.selection.range.startContainer;
                            } else {
                                currentTag = editorInstance.selection.range.startContainer.parentNode;
                            }
                            if (currentTag.tagName === 'TD') {
                                var nextTag = currentTag.nextSibling;
                                if (!nextTag) {
                                    nextTag = $(currentTag).parent('tr').next().children('td')[0];
                                }
                                if (!nextTag) {
                                    var newLine = $('<tr></tr>');
                                    for (var i = 0; i < $(currentTag).parent('tr').children('td').length; i++) {
                                        newLine.append($('<td><br /></td>'));
                                    }
                                    nextTag = newLine.children('td')[0];
                                    $(currentTag).closest('table').append(newLine);
                                }
                                editorInstance.selection.moveCaret(nextTag, nextTag.firstChild.textContent.length);
                            } else if (currentTag.tagName === 'LI') {
                                document.execCommand('indent');
                            } else {
                                editorInstance.selection.range.insertNode($('<span style="padding-left: 25px;">&#8203;</span>')[0]);
                            }
                        }
                    });

                    editZone.on('keyup', function(e) {
                        htmlZone.css({
                            'min-height': '250px',
                            height: 0
                        });
                        var newHeight = htmlZone[0].scrollHeight + 2;
                        if (newHeight > htmlZone.height()) {
                            htmlZone.height(newHeight);
                        }
                    });

                    editorInstance.on('contentupdated', function(e) {
                        htmlZone.css({
                            'min-height': '250px',
                            height: 0
                        });
                        editZone.css({
                            'min-height': '250px'
                        });
                        var newHeight = htmlZone[0].scrollHeight + 2;
                        if (newHeight > htmlZone.height()) {
                            htmlZone.height(newHeight);
                        }
                        if (newHeight > parseInt(editZone.css('min-height')) && !element.hasClass('edit')) {
                            editZone.css('min-height', newHeight);
                        }

                        scope.$apply(function() {
                            scope.$eval(attributes.ngChange);
                            ngModel.assign(scope, htmlZone.val());
                        });
                    });

                    htmlZone.on('keydown', function(e) {
                        // free main thread so it can render textarea changes
                        setTimeout(function() {
                            highlightZone.text($(this).val());
                            Prism.highlightAll();
                        }.bind(this), 200);
                        if (e.keyCode === 9) {
                            e.preventDefault();
                            var start = this.selectionStart;
                            var end = this.selectionEnd;

                            $(this).val($(this).val().substring(0, start) + "\t" + $(this).val().substring(end));

                            this.selectionStart = this.selectionEnd = start + 1;
                        }
                    });

                    htmlZone.on('blur', function() {
                        scope.$apply(function() {
                            scope.$eval(attributes.ngChange);
                            ngModel.assign(scope, htmlZone.val());
                        });
                        editorInstance.trigger('change');
                    });

                    element.on('dragover', function(e) {
                        element.addClass('droptarget');
                    });

                    element.on('dragleave', function() {
                        element.removeClass('droptarget');
                    });

                    element.find('[contenteditable]').on('drop', function(e) {
                        var visibility = 'protected';
                        if (element.attr('public') !== undefined) {
                            visibility = 'public';
                        }

                        element.removeClass('droptarget');
                        var el = {};
                        var files = e.originalEvent.dataTransfer.files;
                        if (!files.length) {
                            return;
                        }
                        e.preventDefault();
                        var range;
                        var sel = window.getSelection();
                        if (document.caretRangeFromPoint) {
                            range = document.caretRangeFromPoint(e.originalEvent.clientX, e.originalEvent.clientY);
                        } else if (document.caretPositionFromPoint) {
                            var caretPosition = document.caretPositionFromPoint(e.originalEvent.clientX, e.originalEvent.clientY);
                            range = document.createRange();
                            range.setStart(caretPosition.offsetNode, caretPosition.offset);
                        }
                        if (range) {

                            sel.removeAllRanges();
                            sel.addRange(range);
                            editorInstance.selection.range = range;
                        }

                        for (var i = 0; i < files.length; i++) {
                            (function() {
                                var name = files[i].name;
                                workspace.Document.prototype.upload(files[i], 'file-upload-' + name + '-' + i, function(doc) {
                                    var path = '/workspace/document/';
                                    if (visibility === 'public') {
                                        path = '/workspace/pub/document/';
                                    }

                                    if (name.indexOf('.mp3') !== -1 || name.indexOf('.wav') !== -1 || name.indexOf('.ogg') !== -1) {
                                        el = $('<audio draggable native controls></audio>');
                                        el.attr('src', path + doc._id)
                                    } else if (name.toLowerCase().indexOf('.png') !== -1 || name.toLowerCase().indexOf('.jpg') !== -1 || name.toLowerCase().indexOf('.jpeg') !== -1 || name.toLowerCase().indexOf('.svg') !== -1) {
                                        el = $('<img draggable native />');
                                        el.attr('src', path + doc._id)
                                    } else {
                                        el = $('<div class="download-attachments">' +
                                            '<h2>' + lang.translate('editor.attachment.title') + '</h2>' +
                                            '<div class="attachments">' +
                                            '<a href="' + path + doc._id + '"><div class="download"></div>' + name + '</a>' +
                                            '</div></div><div><br /><div><br /></div></div>');
                                    }

                                    editorInstance.selection.replaceHTML('<div>' + el[0].outerHTML + '<div><br></div><div><br></div></div>');
                                }, visibility);
                            }())
                        }
                    });

                    scope.$on('$destroy', function() {
                        cancelAnimationFrame(placeEditorToolbar);
                    });
                }
            });
        });
    });

})();
